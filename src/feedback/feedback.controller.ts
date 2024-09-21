import { Body, Controller, Delete, Post, Request } from "@nestjs/common";
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from "./feedback.dto";
import { Roles } from "../decorators/role.decorator";
import { Role } from "@prisma/client";

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}
  @Post()
  create(@Body() dto: CreateFeedbackDto, @Request() req: { id: string }){
    return this.feedbackService.create(dto, req.id)
  }

  @Delete()
  @Roles(Role.ADMIN, Role.CREATOR)
  delete(@Body() body: {id: string}){
    return this.feedbackService.delete(body.id)
  }
}
