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
                users: {
                    every: {
                        userId: {
                            in: [dto.senderId, dto.recipientId],
                        },
                    },
                },
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
        for (let i = 0; i < dto.files.length; i++){
            const res =  await this.cloudinary.uploadImage(dto.files[i], `/tonpay/messages/${message.id}`)
            screenUrls = [...screenUrls, res.public_id]
        }
        if(screenUrls.length > 0) message = await this.prisma.message.update({where: {id: message.id}, data: {screens: screenUrls}})
        return message;
    }
}
