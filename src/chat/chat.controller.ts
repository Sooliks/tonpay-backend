import { Body, Controller, Post, Request } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateMessageDto } from "./chat.dto";

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post('createmessage')
    async createMessage(@Body() dto: CreateMessageDto, @Request() req){

    }

}
