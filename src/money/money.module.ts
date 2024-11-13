import { Module } from '@nestjs/common';
import { MoneyService } from './money.service';
import { PrismaService } from "../prisma.service";
import { NotificationsModule } from "../notifications/notifications.module";
@Module({
  providers: [MoneyService, PrismaService],
  exports: [MoneyService],
  imports: [NotificationsModule]
})
export class MoneyModule {}
