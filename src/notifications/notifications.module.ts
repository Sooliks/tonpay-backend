import { Module } from '@nestjs/common';
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { NotificationsService } from "./notifications.service";
import { NotificationsGateway } from "./notifications.gateway";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_CONSTANTS,
      signOptions: { expiresIn: "1h" },
    })
  ],
  providers: [NotificationsGateway, NotificationsService, ConfigService],
  exports: [NotificationsService]
})
export class NotificationsModule {}
