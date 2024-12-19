import { Injectable, OnModuleInit } from "@nestjs/common";
import * as TelegramBot from 'node-telegram-bot-api';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TelegramBotService implements OnModuleInit {
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
                await this.sendMessageWithLink(chatId, 'Welcome! 👋 Press launch to trade. \n\nSubscribe to our Telegram channel - https://t.me/payonton \n\nRoad map - https://payonton.site \n\nChat - https://t.me/payontonchat', '💰 Launch', 'https://t.me/PayOnTonBot/app');
            }
        });
    }
    onModuleInit() {
        this.bot.on('message', (msg) => this.handleMessage(msg));
    }
    private async sendInfoMessage(msg: TelegramBot.Message): Promise<void> {
        const chatId = msg.chat.id;
        const text = msg.text?.toLowerCase();
        const responses = {
            site: 'Our site - https://payonton.site',
            app: 'Our app - https://t.me/PayOnTonBot/app',
            channel: 'Our channel - https://t.me/payonton',
        };
        const keywords = {
            site: ['сайт', 'site'],
            app: ['апка', 'приложение', 'app'],
            channel: ['канал', 'тг канал', 'channel']
        };
        for (const [key, words] of Object.entries(keywords)) {
            if (words.some((word) => text.includes(word))) {
                this.bot.sendMessage(chatId, responses[key], { reply_to_message_id: msg.message_id });
                break;
            }
        }
    }
    private async handleMessage(msg: TelegramBot.Message) {
        if (msg.chat.type === 'private') return;
        if (!msg.from) return;
        if (!msg.text) return;
        if (msg.from.is_bot) return;
        this.sendInfoMessage(msg);
    }
    async sendMessage(chatId: number | string, message: string): Promise<TelegramBot.Message> {
        try {
            return this.bot.sendMessage(chatId, message);
        }catch (e) {
            
        }
    }
    async isUserSubscribed(telegramId: number, channelId?: string): Promise<boolean> {
        try {
            const memberStatus = await this.bot.getChatMember(channelId || this.channelId, telegramId);
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
