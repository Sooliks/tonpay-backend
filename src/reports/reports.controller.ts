import { Body, Controller, Post } from "@nestjs/common";
import { ReportsService } from './reports.service';
import { CreateReportDto } from "./reports.dto";

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}
  @Post()
  async createReport(@Body() dto: CreateReportDto) {

  }
}
