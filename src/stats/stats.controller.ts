import { Controller, Get } from "@nestjs/common";
import { StatsService } from './stats.service';
import { Roles } from "../decorators/role.decorator";
import { Role } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService, private readonly notificationsService: NotificationsService) {}

  @Get('/admins')
  @Roles(Role.CREATOR, Role.ADMIN)
  async admins(){
    return this.statsService.getAdmins()
  }

  @Get('/currentonline')
  @Roles(Role.CREATOR, Role.ADMIN)
  async getCurrentOnline(){
    return this.notificationsService.getCurrentOnline()
  }
}
