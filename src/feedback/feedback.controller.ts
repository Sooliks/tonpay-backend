import { Body, Controller, Delete, Get, Param, Post, Query, Request } from "@nestjs/common";
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from "./feedback.dto";
import { Roles } from "../decorators/role.decorator";
import { Role } from "@prisma/client";
import { PublicRoute } from "../decorators/public-route.decorator";

@Controller('feedbacks')
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

  @PublicRoute()
  @Get('byuserid/:id')
  async getFeedbacksByUserId(@Param('id') id: string, @Query('count') count: number, @Query('skip') skip: number){
    return this.feedbackService.getFeedbacksByUserId(id, count, skip)
  }
}
