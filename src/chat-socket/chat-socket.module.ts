import { Module } from '@nestjs/common';
import { ChatSocketService } from './chat-socket.service';
import { ChatSocketGateway } from './chat-socket.gateway';
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_CONSTANTS,
      signOptions: { expiresIn: "1h" },
    })
  ],
  providers: [ChatSocketService, ConfigService, ChatSocketGateway],
  exports: [ChatSocketService]
})
export class ChatSocketModule {}
