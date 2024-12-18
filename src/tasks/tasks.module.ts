import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from "../prisma.service";
import { TelegramBotService } from "../telegram-bot/telegram-bot.service";
import { MoneyModule } from "../money/money.module";
import { ReferralsService } from "../referrals/referrals.service";

@Module({
  controllers: [TasksController],
  providers: [TasksService, PrismaService, TelegramBotService, ReferralsService],
  imports: [MoneyModule]
})
export class TasksModule {}
