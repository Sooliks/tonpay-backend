import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Request } from "@nestjs/common";
import { SaleService } from './sale.service';
import { CreateSaleDto } from "./sale.dto";
import { PublicRoute } from "../decorators/public-route.decorator";
import { IsString } from "class-validator";
import { Roles } from "../decorators/role.decorator";
import { Role } from "@prisma/client";

@Controller('sales')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Get()
  async findAll(
      @Query('count') count: number,
      @Query('skip') skip?: number,
      @Query('userId') userId?: string,
      @Query('subScopeId') subScopeId?: string,
      @Query('id') id?: string,
  ){
    return this.saleService.findAll(count, userId, skip, subScopeId, id);
  }
  @Get('onmoderating')
  @Roles(Role.ADMIN, Role.CREATOR)
  async findAllOnModerating(){
    return this.saleService.findAllOnModerating();
  }

  @Post()
  async create(@Body() dto: CreateSaleDto, @Request() req){
    return this.saleService.create(dto, req.user.id)
  }
}
