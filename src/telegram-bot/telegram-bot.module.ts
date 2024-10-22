import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotController } from './telegram-bot.controller';
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [TelegramBotController],
  providers: [TelegramBotService, ConfigService],
  exports: [TelegramBotService]
})
export class TelegramBotModule {}
