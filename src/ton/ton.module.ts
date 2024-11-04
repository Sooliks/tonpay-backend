import { Module } from '@nestjs/common';
import { TonService } from './ton.service';
import { TonController } from './ton.controller';
import { PrismaService } from "../prisma.service";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [ScheduleModule.forRoot(), NotificationsModule],
  controllers: [TonController],
  providers: [TonService, PrismaService, ConfigService]
})
export class TonModule {}
