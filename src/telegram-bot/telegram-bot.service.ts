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

        this.bot.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;
            const isSubscribed = await this.isUserSubscribed(chatId);

            if (isSubscribed) {
                await this.sendMessageWithLink(chatId, 'Welcome! 👋 Press launch to trade.', '💰 Launch', 'https://t.me/PayOnTonBot/app');
            } else {
                await this.sendMessageWithLink(chatId, 'Welcome! 👋 Press launch to trade. \nSubscribe to our Telegram channel - https://t.me/payonton \nRoad map - https://payonton.site \nChat - https://t.me/payontonchat', '💰 Launch', 'https://t.me/PayOnTonBot/app');
            }
        });
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
    async sendMessageWithLink(chatId: number | string, message: string, buttonText: string, url: string): Promise<TelegramBot.Message> {
        try {
            return this.bot.sendMessage(chatId, message, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: buttonText,
                                url: url
                            }
                        ]
                    ]
                }
            });
        } catch (e) {
            console.error("Failed to send message with link:", e);
        }
    }

}
