import { Controller, Get, ParseIntPipe, Query } from "@nestjs/common";
import { SaleService } from './sale.service';

@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Get('findall')
  findAll(@Query('pageNumber', ParseIntPipe) pageNumber: number){
    console.log(pageNumber)
    return this.saleService.findAll();
  }
}
