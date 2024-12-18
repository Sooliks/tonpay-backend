import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from "../prisma.service";
import { TelegramBotService } from "../telegram-bot/telegram-bot.service";

@Module({
  controllers: [TasksController],
  providers: [TasksService, PrismaService, TelegramBotService],
})
export class TasksModule {}
