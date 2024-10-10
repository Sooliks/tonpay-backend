import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Address, fromNano, internal, TonClient, WalletContractV4 } from "ton";
import { Cron } from "@nestjs/schedule";
import { TransactionType } from "@prisma/client";
import { mnemonicToWalletKey } from "ton-crypto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TonService {
    private client: TonClient;
    private readonly fee: number;
    private readonly ourWalletAddress: Address;
    constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {
        this.fee = 10;
        this.client = new TonClient({
            endpoint: 'https://toncenter.com/api/v2/jsonRPC',
            apiKey: 'ea3449af5a3b4d4dfae328caa64e0ee315a4b829c46094586f33fa88e9d35bdc'
        });
        this.ourWalletAddress = Address.parse('UQDFD5TTfKEKnFgJkeKiCCzrDpX_iM85JRdig3RnmPrnjjMA');
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
        const amountWithFee = this.subtractPercentage(amount, this.fee);
        const balance = Number(fromNano(await this.client.getBalance(this.ourWalletAddress)));
        if(balance < amountWithFee){
            throw new BadRequestException('Sorry, there is not enough balance on our wallet right now')
        }
        const user = await this.prisma.user.findUnique({where: {id: userId}})
        if(user.money < amount){
            throw new BadRequestException('Insufficient funds')
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
            let countWaiting = 0;
            while (currentSeqno == seqno) {
                console.log("waiting for transaction to confirm...");
                if (countWaiting >= 60) {
                    throw new BadRequestException('The TON network is overloaded')
                }
                await this.sleep(1500);
                currentSeqno = await walletContract.getSeqno();
                countWaiting++;
            }
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
    async findTransactions(userId: string, count: number, skip?: number){
        return this.prisma.transaction.findMany({
            where: {userId: userId},
            take: Number(count),
            skip: skip ? Number(skip) : undefined,
            orderBy: [{id: 'desc'}]
        })
    }
    @Cron('*/30 * * * * *') // Каждые 30 секунд
    handleCron() {
        console.log('Проверка новых транзакций...');
        this.checkNewTransactions().catch((e)=>{
            console.log(e)
        });
    }
    bigIntToBuffer(data: bigint) {
        if (!data) {
            return Buffer.from([])
        }
        const hexStr = data.toString(16)
        const pad = hexStr.padStart(64)
        const hashHex = Buffer.from(pad, 'hex')

        return hashHex
    }
    sanitizeObjectId(oid: string): string {
        return oid.replace(/[\x00]/g, '').replace(/[^0-9a-f]/g, '');
    }
    async checkNewTransactions() {
        try {
            const address = this.ourWalletAddress;
            const transactions = await this.client.getTransactions(address, {
                limit: 5, lt: Date.now().toString()
            });
            for (const transaction of transactions) {
                try {
                    const userId = this.sanitizeObjectId(Buffer.from(transaction.inMessage?.body.asSlice().loadStringTail().toString(), 'utf-8').toString('utf-8'));
                    if(!userId)return
                    const description: any = transaction.description;
                    const success: boolean = description.computePhase.success && description.actionPhase.success;
                    const amount = fromNano(description.creditPhase.credit.coins)
                    const txId = this.sanitizeObjectId(Buffer.from(this.bigIntToBuffer(transaction.prevTransactionHash).toString('hex').toString(), 'utf-8').toString('utf-8'));
                    if(!txId)return
                    const existingTransaction = await this.prisma.transaction.findFirst({
                        where: { transactionId: txId, userId: userId, countTon: Number(amount) }
                    })
                    if (!existingTransaction) {
                        const tx = await this.prisma.transaction.create({
                            data: {
                                userId: userId,
                                transactionId: txId,
                                confirmed: success,
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
                        }
                    }
                }catch (e) {
                    continue
                }
            }
        }catch (error) {
            console.error('Ошибка', error);
        }
    }
}
