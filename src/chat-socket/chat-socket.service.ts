import { Injectable } from '@nestjs/common';
import { ChatSocketGateway } from "./chat-socket.gateway";
import { Message } from "@prisma/client";

@Injectable()
export class ChatSocketService {
    constructor(private chatSocketGateway: ChatSocketGateway) {}

    sendMessageToUser(userId: string, message: Message){
        return this.chatSocketGateway.sendMessageToUser(userId, message)
    }
}
