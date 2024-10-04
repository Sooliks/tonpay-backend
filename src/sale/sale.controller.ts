import { Body, Controller, Get, ParseIntPipe, Post, Query, Request } from "@nestjs/common";
import { SaleService } from './sale.service';
import { CreateSaleDto } from "./sale.dto";
import { PublicRoute } from "../decorators/public-route.decorator";
import { IsString } from "class-validator";

@Controller('sales')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Get()
  findAll(@Query('count') count: number, @Query('skip') skip?: number, @Query('userId') userId?: string){
    return this.saleService.findAll(count, userId, skip);
  }

  @Post()
  create(@Body() dto: CreateSaleDto, @Request() req){
    return this.saleService.create(dto, req.user.id)
  }
}
