import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Address, fromNano, internal, TonClient, WalletContractV4 } from "ton";
import { Cron } from "@nestjs/schedule";
import { TransactionType } from "@prisma/client";
import { mnemonicToWalletKey } from "ton-crypto";
import { ConfigService } from "@nestjs/config";
import { NotificationsService } from "../notifications/notifications.service";
import axios from "axios";

@Injectable()
export class TonService {
    private client: TonClient;
    private readonly fee: number;
    private readonly ourWalletAddress: Address;
    private readonly ourWalletAddressString: string;
    constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService, private readonly notificationsService: NotificationsService) {
        this.fee = 15;
        this.client = new TonClient({
            endpoint: 'https://toncenter.com/api/v2/jsonRPC',
            apiKey: 'ea3449af5a3b4d4dfae328caa64e0ee315a4b829c46094586f33fa88e9d35bdc'
        });
        this.ourWalletAddress = Address.parse('UQDFD5TTfKEKnFgJkeKiCCzrDpX_iM85JRdig3RnmPrnjjMA');
        this.ourWalletAddressString = "UQDFD5TTfKEKnFgJkeKiCCzrDpX_iM85JRdig3RnmPrnjjMA";
    }
    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    subtractPercentage(amount: number, percentage: number): number {
        const deduction = (amount * percentage) / 100;
        return amount - deduction;
    }
    async sendCoins(amount: number, address: string, userId: string) {
        if(amount < 0.05){
            throw new BadRequestException('The minimum amount is 0.05')
        }
        const user = await this.prisma.user.findUnique({where: {id: userId}})
        if(!user){
            throw new NotFoundException('User not found')
        }
        if(user.money < amount){
            throw new BadRequestException('Insufficient funds')
        }
        const amountWithFee = this.subtractPercentage(amount, user.isSubscribed ? 5 : this.fee);
        const balance = Number(fromNano(await this.client.getBalance(this.ourWalletAddress)));
        if(balance < amountWithFee){
            throw new BadRequestException('Sorry, there is not enough balance on our wallet right now')
        }
        const mnemonic = this.configService.get<string>('SID');
        const key = await mnemonicToWalletKey(mnemonic.split(" "));
        const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
        if (!await this.client.isContractDeployed(wallet.address)) {
            throw new BadRequestException('Wallet is not deployed')
        }
        await this.prisma.user.update({
            where: {id: userId},
            data: {
                money: {decrement: amount}
            }
        })
        try {
            const walletContract = this.client.open(wallet);
            const seqno = await walletContract.getSeqno();
            await walletContract.sendTransfer({
                secretKey: key.secretKey,
                seqno: seqno,
                messages: [
                    internal({
                        to: address,
                        value: amountWithFee.toFixed(5).toString(),
                        body: `Withdraw, fee: ${this.fee}%. User: @${user.nickname}`,
                        bounce: false
                    })
                ]
            });
            let currentSeqno = seqno;
            while (currentSeqno == seqno) {
                await this.sleep(1500);
                currentSeqno = await walletContract.getSeqno();
            }
            await this.notificationsService.notifyUser(userId, `Success withdraw, amount: ${amount} TON. Check your wallet.`, true)
        }
        catch (e) {
            await this.prisma.user.update({
                where: {id: userId},
                data: {
                    money: {increment: amount}
                }
            })
            throw new BadRequestException('The TON network is overloaded')
        }
        //TODO тут добавление транзы в бд надо
        /*try {
          const transactions = await this.client.getTransactions(this.ourWalletAddress, { limit: 5 });
          const transaction = transactions.find(tx => {
            const description: any = tx?.description;
            console.log(description)
            if(description?.creditPhase) {
              const amount = fromNano(description.creditPhase.credit.coins)
              return amount === amountWithFee.toString()
            }
            return false;
          });
          const description: any = transaction.description;
          const txId = this.sanitizeObjectId(Buffer.from(this.bigIntToBuffer(transaction.prevTransactionHash).toString('hex').toString(), 'utf-8').toString('utf-8'));
          const success: boolean = description.computePhase.success && description.actionPhase.success;
          await this.prisma.transaction.create({
            data: {
              userId: userId,
              type: TransactionType.WITHDRAWAL,
              countTon: amountWithFee,
              transactionId: txId,
              confirmed: success
            }
          })
        }catch (e) {
          console.log(e)
          throw new BadRequestException('Transaction is sending, other error..')
        }*/
    }
    async findTransactions(userId: string, count: number, skip: number){
        return this.prisma.transaction.findMany({
            where: {userId: userId},
            take: Number(count),
            skip: Number(skip),
            orderBy: [{id: 'desc'}]
        })
    }
    @Cron('*/35 * * * * *')
    handleCron() {
        this.checkNewTransactions().then(res=>{

        }).catch(err=>console.error(err));
    }
    async getTransactionsWithRetry(retries: number = 3, limit: number = 20): Promise<any> {
        let attempts = 0;
        while (attempts < retries) {
            try {
                const timestamp = new Date().getTime();
                const response = await axios.get(`https://toncenter.com/api/v2/getTransactions?address=${this.ourWalletAddressString}&limit=${limit}&archival=true&timestamp=${timestamp}`, {
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                if (response.data.ok) {
                    return response.data.result;
                }
                throw new Error(response.data.error);
            } catch (error) {
                attempts++;
                console.error(`Attempt ${attempts} failed. Retrying...`);
                if (attempts >= retries) {
                    throw new Error("Max retries reached. Unable to fetch transactions.");
                }
                await new Promise(resolve => setTimeout(resolve, 2000)); // задержка перед повтором
            }
        }
    }
    async checkNewTransactions() {
        try {
            const transactions: any[] = await this.getTransactionsWithRetry()
            for (const transaction of transactions) {
                try {
                    const userId = transaction.in_msg.message;
                    if(!userId){
                        continue;
                    }
                    const amount = fromNano(transaction.in_msg.value)
                    if(!amount){
                        continue;
                    }
                    const txId = transaction.transaction_id.hash;
                    if(!txId){
                        continue;
                    }
                    const existingTransaction = await this.prisma.transaction.findUnique({
                        where: { transactionId: txId, userId: userId, countTon: Number(amount) }
                    })
                    if (!existingTransaction) {
                        const tx = await this.prisma.transaction.create({
                            data: {
                                userId: userId,
                                transactionId: txId,
                                confirmed: true,
                                countTon: Number(amount),
                                type: TransactionType.PAYMENT
                            }
                        })
                        if (tx.confirmed === true) {
                            await this.prisma.user.update({
                                where: { id: userId },
                                data: {
                                    money: { increment: Number(amount) }
                                }
                            })
                            await this.notificationsService.notifyUser(userId, `Your balance has been replenished by ${amount} TON.`, true)
                        }
                    }
                }catch (error) {
                    console.error('Ошибка', error);
                    continue;
                }
            }
        }catch (error) {
            console.error('Ошибка', error);
        }
    }
}
