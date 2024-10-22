import { Body, Controller, Post, Request, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateMessageDto } from "./chat.dto";
import { FilesInterceptor } from "@nestjs/platform-express";

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post('createmessage')
    @UseInterceptors(FilesInterceptor('files', 3))
    async createMessage(@Body() dto: CreateMessageDto, @Request() req, @UploadedFiles() files?: Array<Express.Multer.File>){
        dto.files = files;
        return this.chatService.createMessage(dto)
    }

}
