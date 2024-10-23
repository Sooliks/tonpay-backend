import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateMessageDto } from "./chat.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { Chat, Message } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService, private readonly cloudinary: CloudinaryService, private readonly notificationsService: NotificationsService) {}

    async createMessage(dto: CreateMessageDto) {
        if(!dto.message && dto.files.length === 0){
            throw new BadRequestException('The message must contain text or files')
        }
        let chat: Chat = await this.prisma.chat.findFirst({
            where: {
                AND: [
                    {
                        users: {
                            some: {
                                userId: dto.senderId
                            }
                        }
                    },
                    {
                        users: {
                            some: {
                                userId: dto.recipientId
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
        let message: Message = await this.prisma.message.create({
            data: {
                content: dto.message,
                chatId: chat.id,
                senderId: dto.senderId
            }, include: {sender: true}
        });
        let screenUrls: string[] = []
        if(dto.files) {
            for (let i = 0; i < dto.files.length; i++) {
                const res = await this.cloudinary.uploadImage(dto.files[i], `/tonpay/messages/${message.id}`)
                screenUrls = [...screenUrls, res.public_id]
            }
        }
        if(screenUrls.length > 0) message = await this.prisma.message.update({where: {id: message.id}, data: {screens: screenUrls}, include: {sender: true}})
        const connectedUsers = await this.notificationsService.getConnectedUsers()
        const user = await this.prisma.user.findUnique({where: {id: dto.senderId}})
        if(!connectedUsers.has(dto.recipientId)){
            await this.notificationsService.notifyUser(dto.recipientId, `You have received a new message from @${user.nickname}: ${message.content || 'File'}`, true)
        }
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
