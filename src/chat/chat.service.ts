import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma.service";

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService) {}

    async createMessage(userIds: string[], senderId: string, messageContent: string) {

    }
}
