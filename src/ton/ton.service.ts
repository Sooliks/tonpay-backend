import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Address, fromNano, internal, TonClient, WalletContractV4 } from "ton";
import { Cron } from "@nestjs/schedule";
import { TransactionType } from "@prisma/client";
import { mnemonicNew, mnemonicToPrivateKey, mnemonicToWalletKey } from "ton-crypto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TonService {
  private client: TonClient;
  private fee: number;
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {
    this.fee = 10;
    this.client = new TonClient({
      endpoint: 'https://toncenter.com/api/v2/jsonRPC',
      apiKey: 'ea3449af5a3b4d4dfae328caa64e0ee315a4b829c46094586f33fa88e9d35bdc'
    });
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
      const amountWithFee = this.subtractPercentage(amount, this.fee);
      await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [
          internal({
            to: address,
            value: amountWithFee.toString(),
            body: `Withdraw, fee: ${this.fee}%`,
            bounce: false,
          })
        ]
      });
      let currentSeqno = seqno;
      let countWaiting = 0;
      while (currentSeqno == seqno) {
        console.log("waiting for transaction to confirm...");
        if(countWaiting >= 60){
          throw new BadRequestException('The TON network is overloaded')
        }
        await this.sleep(1500);
        currentSeqno = await walletContract.getSeqno();
        countWaiting++;
      }
    }catch (e) {
      await this.prisma.user.update({
        where: {id: userId},
        data: {
          money: {increment: amount}
        }
      })
      console.log(e)
      throw new BadRequestException('The TON network is overloaded')
    }
    //TODO добавлять транзу в бд
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
  async checkNewTransactions() {
    function sanitizeObjectId(oid: string): string {
      // Удаляем все символы, кроме 0-9, a-f и нулевые символы
      return oid.replace(/[\x00]/g, '').replace(/[^0-9a-f]/g, '');
    }
    try {
      const address = Address.parse('UQDFD5TTfKEKnFgJkeKiCCzrDpX_iM85JRdig3RnmPrnjjMA');
      const transactions = await this.client.getTransactions(address, {
        limit: 5, lt: Date.now().toString()
      });
      for (const transaction of transactions) {
        try {
          const userId = sanitizeObjectId(Buffer.from(transaction.inMessage?.body.asSlice().loadStringTail().toString(), 'utf-8').toString('utf-8'));
          if(!userId)return
          const description: any = transaction.description;
          const success: boolean = description.computePhase.success && description.actionPhase.success;
          const amount = fromNano(description.creditPhase.credit.coins)
          const txId = sanitizeObjectId(Buffer.from(this.bigIntToBuffer(transaction.prevTransactionHash).toString('hex').toString(), 'utf-8').toString('utf-8'));
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
