import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma.service";

@Injectable()
export class ReferralsService {
    constructor(private readonly prisma: PrismaService) {}

    async getCountReferrals(userId: string): Promise<number> {
        return this.prisma.user.count({where: {refId: userId}});
    }
    async getReferrals(userId: string, count: number = 100, skip?: number) {
        return this.prisma.user.findMany({
            where: {refId: userId},
            select: {
                nickname: true,
                money: true,
                id: true
            },
            take: count,
            skip: skip
        })
    }
}
