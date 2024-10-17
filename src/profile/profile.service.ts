import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma.service";


@Injectable()
export class ProfileService {
    constructor(private readonly prisma: PrismaService) {}
    async getUserById(id: string){
        return this.prisma.user.findUnique({
            where: {id: id},
            select: {
                id: true,
                isBanned: true,
                isPremium: true,
                lastOnline: true,
                refId: true,
                photoUrl: true,
                role: true,
                nickname: true
            }
        })
    }
}
