import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class MoneyService {
    constructor(private readonly prisma: PrismaService, private readonly notificationsService: NotificationsService) {}
    async minusMoney(userId: string, money: number){
        const user = await this.prisma.user.findUnique({where: {id: userId}})
        if(user.money < money){
            throw new BadRequestException('There is not enough TON on the balance sheet')
        }
        return this.prisma.user.update({
            where: {id: userId},
            data: {
                money: {decrement: money}
            }
        })
    }
    async plusMoney(userId: string, money: number){
        await this.notificationsService.notifyUser(userId, `Your balance has been replenished by ${money} TON`, true)
        return this.prisma.user.update({
            where: {id: userId},
            data: {
                money: {increment: money}
            }
        })
    }
}
