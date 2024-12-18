import { Controller, Get, Query, Request } from "@nestjs/common";
import { TasksService } from './tasks.service';
import { Roles } from "../decorators/role.decorator";
import { Role } from "@prisma/client";

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('get')
  async getTasks(@Request() req){
    return this.tasksService.getTasks(req.user.id);
  }
}
