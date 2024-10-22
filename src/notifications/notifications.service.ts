import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from "./notifications.gateway";
import { TelegramBotService } from "../telegram-bot/telegram-bot.service";
import { PrismaService } from "../prisma.service";

@Injectable()
export class NotificationsService {
    constructor(private notificationsGateway: NotificationsGateway, private telegramBotService: TelegramBotService, private prisma: PrismaService) {}
    async notifyAll(message: string, sendInTelegram: boolean = false) {
        if(sendInTelegram) {
            const users = await this.prisma.user.findMany()
            users.map(user=> this.telegramBotService.sendMessage(user.telegramId, message))
        }
        this.notificationsGateway.sendNotificationToAll(message);
    }
    async notifyUser(userId: string, message: string, sendInTelegram: boolean = false) {
        if(sendInTelegram) {
            const {telegramId} = await this.prisma.user.findUnique({where: {id: userId}})
            await this.telegramBotService.sendMessage(telegramId, message)
        }
        this.notificationsGateway.sendNotificationToUser(userId, message);
    }
    async getCurrentOnline(){
        return this.notificationsGateway.getConnectedUsers().size;
    }
    async getConnectedUsers() {
        return this.notificationsGateway.getConnectedUsers();
    }
}
