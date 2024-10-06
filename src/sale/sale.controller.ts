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

  @PublicRoute()
  @Get('one/:id')
  async getSaleById(@Param('id') id: string){
    return this.saleService.getSaleById(id)
  }

  @PublicRoute()
  @Get('bysubscope/:id')
  async getSalesBySubScopeId(@Param('id') id: string){
    return this.saleService.findAllBySubScopeId(id)
  }

  @Get('my')
  async findAllMy(@Request() req){
    return this.saleService.findAllByUserId(req.user.id);
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
