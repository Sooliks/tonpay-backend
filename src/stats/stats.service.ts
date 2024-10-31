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
    async getUsers(take: number, skip: number = 0) {
        return this.prisma.user.findMany({
            where: {
                role: Role.USER
            },
            select: {
                nickname: true,
                lastOnline: true,
                money: true,
                id: true
            },
            orderBy: {
                lastOnline: 'desc'
            },
            take: Number(take),
            skip: Number(skip)
        })
    }
}
