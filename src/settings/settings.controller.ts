import { Body, Controller, Post, Request } from "@nestjs/common";
import { SettingsService } from './settings.service';
import { NotifyToggleDto } from "./settings.dto";

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('toggle/notifications')
  async toggleNotifications(@Request() req, @Body() dto: NotifyToggleDto){
    return this.settingsService.toggleNotifications(req.user.id, dto);
  }
}
