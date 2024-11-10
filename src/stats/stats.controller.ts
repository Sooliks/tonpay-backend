import { Controller, Get, Query, Request } from "@nestjs/common";
import { StatsService } from './stats.service';
import { Roles } from "../decorators/role.decorator";
import { Role } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService, private readonly notificationsService: NotificationsService) {}

  @Get('/admins')
  @Roles(Role.CREATOR, Role.ADMIN)
  async getAdmins(){
    return this.statsService.getAdmins()
  }
  @Get('/users')
  @Roles(Role.CREATOR, Role.ADMIN)
  async getUsers(@Query('count') count: number, @Query('skip') skip: number){
    return this.statsService.getUsers(count, skip);
  }
  @Get('/users/count')
  @Roles(Role.CREATOR, Role.ADMIN)
  async getCountUsers(){
    return this.statsService.getCountUsers();
  }

  @Get('/currentonline')
  @Roles(Role.CREATOR, Role.ADMIN)
  async getCurrentOnline(){
    return this.notificationsService.getCurrentOnline()
  }

  @Get('/counts')
  @Roles(Role.CREATOR, Role.ADMIN)
  async getCounts(){
    return this.statsService.getCounts()
  }
}
