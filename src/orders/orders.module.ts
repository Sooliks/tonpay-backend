import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from "../prisma.service";
import { MoneyModule } from "../money/money.module";
import { ChatModule } from "../chat/chat.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
  imports: [MoneyModule, ChatModule, NotificationsModule]
})
export class OrdersModule {}
