import { Body, Controller, Get, Param, Post, Query, Request, UploadedFiles, UseInterceptors } from "@nestjs/common";
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
        dto.senderId = req.user.id;
        return this.chatService.createMessage(dto)
    }

    @Get('dialogs')
    async getAllDialogs(@Request() req) {
        return this.chatService.getUserChats(req.user.id)
    }
    @Get('dialogs/:id/messages')
    async getDialogById(@Param('id') id: string, @Query('skip') skip: number, @Query('count') count: number, @Request() req) {
        return this.chatService.getMessages(id, count, skip, req.user.id)
    }

}
