import { Body, Controller, Get, ParseIntPipe, Post, Query, Request } from "@nestjs/common";
import { SaleService } from './sale.service';
import { CreateSaleDto } from "./sale.dto";
import { PublicRoute } from "../decorators/public-route.decorator";

@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Get('findall')
  findAll(@Query('pageNumber', ParseIntPipe) pageNumber: number){
    console.log(pageNumber)
    return this.saleService.findAll();
  }

  @Post('create')
  create(@Body() dto: CreateSaleDto, @Request() req: { id: string }){
    return this.saleService.create(dto, req.id)
  }
}
