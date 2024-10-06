import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class StatsService {
    constructor(private readonly prisma: PrismaService) {}

    async getAdmins(){
        return this.prisma.user.findMany({
            where: {
                OR: [{role: Role.ADMIN}, {role: Role.CREATOR}]
            },
            select: {
                nickname: true,
                role: true,
                lastOnline: true,
                money: true,
                id: true
            }
        })
    }
}
