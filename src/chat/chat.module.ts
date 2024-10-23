import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma.service";
import { ChatController } from "./chat.controller";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_CONSTANTS,
      signOptions: { expiresIn: "1h" },
    }), NotificationsModule
  ],
  providers: [ChatGateway, ChatService, ConfigService, PrismaService, CloudinaryService],
  controllers: [ChatController]
})
export class ChatModule {}
