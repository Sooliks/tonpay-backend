import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma.service";
import { Address, fromNano, Message, toNano, TonClient } from "ton";
import { Cron } from "@nestjs/schedule";


@Injectable()
export class TonService {
  private client: TonClient;

  constructor(private readonly prisma: PrismaService) {
    this.client = new TonClient({
      endpoint: 'https://toncenter.com/api/v2/jsonRPC',
      apiKey: 'ea3449af5a3b4d4dfae328caa64e0ee315a4b829c46094586f33fa88e9d35bdc'
    });
  }
  @Cron('*/1 * * * *') // Каждые 5 минут
  handleCron() {
    console.log('Проверка новых транзакций...');
    this.checkNewTransactions().catch((e)=>{
      console.log(e)
    });
  }
  async checkNewTransactions() {
    try {
      const address = Address.parse('UQDFD5TTfKEKnFgJkeKiCCzrDpX_iM85JRdig3RnmPrnjjMA');
      const transactions = await this.client.getTransactions(address, {
        limit: 5, lt: Date.now().toString()
      });
      for (const transaction of transactions) {
        /*console.log(transaction.outMessages)
        console.log(toNano(transaction.totalFees.coins))*/
        console.log(transaction.outMessages)



        /*const comment = JSON.parse(transaction.raw.toString());
        const userId = comment.userId;
        const existingTransaction = await this.prisma.transaction.findFirst({ where: { transactionId: transaction.hash.toString() } })
        if (!existingTransaction) {
          await this.prisma.transaction.create({
            data: {
              userId: userId,
              transactionId: transaction.hash.toString(),
              confirmed: transaction.endStatus === 'active',
              countTon: Number(transaction.stateUpdate)
            }
          })
          if (transaction.endStatus === 'active') {
            await this.prisma.user.update({
              where: { id: userId },
              data: {
                money: { increment: Number(transaction.stateUpdate) }
              }
            })
          }
        }*/
      }
    }catch (error) {
      console.error('Ошибка в цикле:', error);
    }
  }
}
