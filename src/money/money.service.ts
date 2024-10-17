import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class MoneyService {
    constructor(private readonly prisma: PrismaService) {}
    async minusMoney(userId: string, money: number){
        const user = await this.prisma.user.findUnique({where: {id: userId}})
        if(user.money < money){
            throw new BadRequestException('You not have money')
        }
        return this.prisma.user.update({
            where: {id: userId},
            data: {
                money: {decrement: money}
            }
        })
    }
    async plusMoney(userId: string, money: number){
        return this.prisma.user.update({
            where: {id: userId},
            data: {
                money: {increment: money}
            }
        })
    }
}
