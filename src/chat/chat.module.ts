import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma.service";
import { ChatController } from "./chat.controller";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { ChatSocketModule } from "../chat-socket/chat-socket.module";
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_CONSTANTS,
      signOptions: { expiresIn: "1h" },
    }), NotificationsModule, ChatSocketModule
  ],
  providers: [ChatService, ConfigService, PrismaService, CloudinaryService],
  controllers: [ChatController],
  exports: [ChatService]
})
export class ChatModule {}
