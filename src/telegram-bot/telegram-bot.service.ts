import { Injectable, OnModuleInit } from "@nestjs/common";
import * as TelegramBot from 'node-telegram-bot-api';
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";

@Injectable()
export class TelegramBotService implements OnModuleInit {
    private readonly bot: TelegramBot;
    private readonly channelId: string;
    private readonly context: string = '';
    private readonly openai: OpenAI;
    constructor(private readonly configService: ConfigService) {
        this.openai = new OpenAI({apiKey: this.configService.get<string>('OPENAI_API_KEY')})
        this.bot = new TelegramBot(this.configService.get<string>('TELEGRAMBOT_TOKEN'), { polling: true });
        this.channelId = this.configService.get<string>('TELEGRAM_CHANNEL_ID');
        this.context = "Welcome to the future of trading game values on the Web 3!\n" +
            "\n" +
            "Meet the new trading platform – PayOnTon! We have created a unique space for players, traders, collectors and anyone who wants to plunge into the world of digital assets.\n" +
            "\n" +
            "Why PayOnTon?\n" +
            "\n" +
            "Automatic authorization via Telegram. Forget about complicated registrations – buying and selling in a couple of clicks!\n" +
            "Instant withdrawal and replenishment of funds. All operations take place in less than two minutes thanks to the use of the TON blockchain.\n" +
            "A wide range of goods and services. Sell and buy any game items, digital assets, and more.\n" +
            "Convenience and safety. The platform is integrated directly into Telegram, providing you with comfort and protection of your transactions.\n" +
            "\n" +
            "What can I sell on PayOnTon?\n" +
            "\n" +
            "On our platform, you can sell any goods and services permitted by the laws of your country. Whether it's rare skins, unique items or digital collections, all this will find its buyer on PayOnTon." +
            "Mini app - https://t.me/PayOnTonBot/app" +
            "Channel - https://t.me/payonton" +
            "Site with road map - https://payonton.site" +
            "Last news - We’re thrilled to announce a new reward for our sellers!\n" +
            "🌟 For every user who successfully publishes their first sale on PayOnTon, we’re giving 0.05 TON (~$0.30) as a thank-you for joining our marketplace and sharing your products with the community.\n" +
            "\n" +
            "It’s our way of supporting new sellers and boosting activity in the PayOnTon ecosystem. Let’s grow together and make trading on the TON blockchain a rewarding experience!\n" +
            "\n" +
            "If you don’t see the category you need for your listing, feel free to suggest it in the comments, and we’ll be happy to add it.\n" +
            "\n" +
            "Get started today and earn your reward! 🚀";
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
    onModuleInit() {
        this.bot.on('message', (msg) => this.handleMessage(msg));
    }
    private async handleMessage(msg: TelegramBot.Message) {
        if (msg.chat.type === 'private') {
            return;  // Выход из функции, если это личное сообщение
        }
        if (!msg.from) {
            console.log('Игнорируем сообщение о действии в группе');
            return;  // Просто выходим из функции, если это системное сообщение
        }
        // Игнорируем сообщения от бота
        if (msg.from.is_bot) return;
        const chatId = msg.chat.id;
        const text = msg.text;
        // Формируем полный контекст, включая сообщение пользователя и общий контекст проекта
        const fullContext = `User message: ${text}`;
        // Получаем ответ от нейросети с учетом контекста проекта
        const response = await this.getNeuralNetworkResponse(fullContext);
        // Отправляем ответ в группу
        this.bot.sendMessage(chatId, response, {reply_to_message_id: msg.message_id});
    }
    private async getNeuralNetworkResponse(context: string): Promise<string> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are an assistant for the PayOnTon chat project.' },
                    { role: 'user', content: context },
                ]
            });
            return completion.choices[0].message.content.trim();
        } catch (error) {
            console.error(error);
            //return 'Извините, произошла ошибка при обработке вашего запроса.';
        }
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
