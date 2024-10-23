import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma.service";
import { CreateMessageDto } from "./chat.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { Chat } from "@prisma/client";

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService, private readonly cloudinary: CloudinaryService) {}

    async createMessage(dto: CreateMessageDto) {
        let chat: Chat = await this.prisma.chat.findFirst({
            where: {
                AND: [
                    {
                        users: {
                            some: {
                                userId: dto.senderId,
                            }
                        }
                    },
                    {
                        users: {
                            some: {
                                userId: dto.recipientId,
                            }
                        }
                    }
                ]
            },
            include: {
                users: true
            },
        });
        if (!chat) {
            chat = await this.prisma.chat.create({ data: {} });
            // Привязать пользователей к чату
            await this.prisma.userChat.createMany({
                data: [
                    { chatId: chat.id, userId: dto.senderId },
                    { chatId: chat.id, userId: dto.recipientId },
                ],
            });
        }
        let message = await this.prisma.message.create({
            data: {
                content: dto.message,
                chatId: chat.id,
                senderId: dto.senderId,
            },
        });
        let screenUrls: string[] = []
        if(dto.files)
        for (let i = 0; i < dto.files.length; i++){
            const res =  await this.cloudinary.uploadImage(dto.files[i], `/tonpay/messages/${message.id}`)
            screenUrls = [...screenUrls, res.public_id]
        }
        if(screenUrls.length > 0) message = await this.prisma.message.update({where: {id: message.id}, data: {screens: screenUrls}})
        return message;
    }
    async getUserChats(userId: string) {
        // Находим все чаты, в которых участвует пользователь
        const userChats = await this.prisma.chat.findMany({
            where: {
                users: {
                    some: {
                        userId: userId, // проверяем, что пользователь есть в чате
                    },
                },
            },
            include: {
                users: {
                    include: {
                        user: true, // получаем информацию о пользователях
                    },
                },
                messages: {
                    take: 1, // берем последнее сообщение
                    orderBy: {
                        createdAt: 'desc', // сортируем по дате создания
                    },
                    include: {
                        sender: {
                            select: {
                                photoUrl: true,
                                nickname: true,
                                id: true
                            }
                        }
                    }
                },
            },
        });
        // Возвращаем найденные чаты
        return userChats.map((chat) => ({
            id: chat.id,
            users: chat.users.map((userChat) => userChat.user), // список пользователей
            lastMessage: chat.messages[0], // последнее сообщение
        }));
    }
    async getMessages(chatId: string, take: number, skip: number){
        console.log(chatId)
        const chat = await this.prisma.chat.findUnique({
            where: {id: chatId},
            include: {
                users: {
                    include: {
                        user: true, // получаем информацию о пользователях
                    },
                },
                messages: {
                    include: {
                        sender: {
                            select:
                                {photoUrl: true, nickname: true, id: true}
                        }
                    },
                    take: Number(take),
                    skip: Number(skip),
                    orderBy: { createdAt: 'desc' }
                }
            }
        })
        return {
            ...chat,
            users: chat.users.map((userChat) => userChat.user), // Только пользователи
        };
    }
}
