import { Controller } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';

@Controller()
export class TelegramBotController {
  constructor(private readonly telegramBotService: TelegramBotService) {}
}
