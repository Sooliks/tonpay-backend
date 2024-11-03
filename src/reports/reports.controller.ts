import { Body, Controller, Get, Post, Query, Request } from "@nestjs/common";
import { ReportsService } from './reports.service';
import { ConfirmReportDto, CreateReportDto, GetChatReportDto, TakeReportDto } from "./reports.dto";
import { Roles } from "../decorators/role.decorator";
import { Role } from "@prisma/client";

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('create')
  async createReport(@Body() dto: CreateReportDto, @Request() req) {
    return this.reportsService.createReport(dto, req.user.id);
  }

  @Roles(Role.ADMIN, Role.CREATOR)
  @Post('take')
  async takeReport(@Body() dto: TakeReportDto, @Request() req) {
    return this.reportsService.takeReport(dto, req.user.id);
  }

  @Roles(Role.ADMIN, Role.CREATOR)
  @Post('confirm')
  async confirmReport(@Body() dto: ConfirmReportDto, @Request() req) {
    return this.reportsService.confirmReport(dto, req.user.id);
  }

  @Roles(Role.ADMIN, Role.CREATOR)
  @Get('completed')
  async getAllCompletedReports(@Query('count') count: number, @Query('skip') skip: number){
    return this.reportsService.getAllReports(true, count, skip);
  }

  @Roles(Role.ADMIN, Role.CREATOR)
  @Get('uncompleted')
  async getAllUnCompletedReports(){
    return this.reportsService.getAllReports(false);
  }

  @Roles(Role.ADMIN, Role.CREATOR)
  @Post('getchat')
  async getChat(@Body() dto: GetChatReportDto, @Request() req){
    return this.reportsService.getChat(dto, req.user.id)
  }
}
