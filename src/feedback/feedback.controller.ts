import { Body, Controller, Delete, Post, Request } from "@nestjs/common";
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from "./feedback.dto";
import { Roles } from "../decorators/role.decorator";
import { Role } from "@prisma/client";

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}
  @Post()
  async create(@Body() dto: CreateFeedbackDto, @Request() req){
    return this.feedbackService.create(dto, req.user.id)
  }

  @Delete()
  @Roles(Role.ADMIN, Role.CREATOR)
  async delete(@Body() body: {id: string}){
    return this.feedbackService.delete(body.id)
  }
}
