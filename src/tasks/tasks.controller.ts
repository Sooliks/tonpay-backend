import { Body, Controller, Get, Post, Request } from "@nestjs/common";
import { TasksService } from './tasks.service';
import { CheckCompleteTaskDto } from "./tasks.dto";

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('get')
  async getTasks(@Request() req){
    return this.tasksService.getTasks(req.user.id);
  }

  @Post('check')
  async check(@Request() req, @Body() dto: CheckCompleteTaskDto ) {
    return this.tasksService.checkCompleteTask(dto, req.user.id);
  }
}
