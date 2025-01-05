import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma.service";
import { NotifyToggleDto } from "./settings.dto";

@Injectable()
export class SettingsService {
    constructor(private readonly prisma: PrismaService) {}

    async toggleNotifications(userId: string, dto: NotifyToggleDto) {
        await this.prisma.user.update({
            where: {id: userId},
            data: {
                notifications: dto.value
            }
        })
    }
}
