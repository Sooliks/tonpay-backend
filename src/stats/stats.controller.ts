import { Controller, Get } from "@nestjs/common";
import { StatsService } from './stats.service';
import { Roles } from "../decorators/role.decorator";
import { Role } from "@prisma/client";

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('/admins')
  @Roles(Role.CREATOR, Role.ADMIN)
  async admins(){
    return this.statsService.getAdmins()
  }
}
