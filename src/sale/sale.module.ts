import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { PrismaService } from "../prisma.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { FeedbackModule } from "../feedback/feedback.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { TelegramBotService } from "../telegram-bot/telegram-bot.service";
import { MoneyModule } from "../money/money.module";

@Module({
  imports: [FeedbackModule, NotificationsModule, MoneyModule],
  controllers: [SaleController],
  providers: [SaleService, PrismaService, CloudinaryService, TelegramBotService],
})
export class SaleModule {}
