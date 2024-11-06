import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TelegramBotService {
    private readonly bot: TelegramBot;
    private readonly channelId: string;
    constructor(private readonly configService: ConfigService) {
        this.bot = new TelegramBot(this.configService.get<string>('TELEGRAMBOT_TOKEN'), { polling: true });
        this.channelId = this.configService.get<string>('TELEGRAM_CHANNEL_ID');
    }
    async sendMessage(chatId: number | string, message: string): Promise<TelegramBot.Message> {
        try {
            return this.bot.sendMessage(chatId, message);
        }catch (e) {
            
        }
    }
    async isUserSubscribed(telegramId: number): Promise<boolean> {
        try {
            const memberStatus = await this.bot.getChatMember(this.channelId, telegramId);
            return ['member', 'administrator', 'creator'].includes(memberStatus.status);
        } catch (error) {
            console.error("Failed to check user subscription:", error);
            return false;
        }
    }
}
