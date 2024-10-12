import {
  Body,
  Controller, Delete,
  Get,
  Param,
  Post,
  Request,
  UploadedFiles,
  UseInterceptors
} from "@nestjs/common";
import { SaleService } from './sale.service';
import { CreateSaleDto, DeleteSaleForAdminDto } from "./sale.dto";
import { PublicRoute } from "../decorators/public-route.decorator";
import { Roles } from "../decorators/role.decorator";
import { Role } from "@prisma/client";
import { FilesInterceptor } from "@nestjs/platform-express";

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
  @UseInterceptors(FilesInterceptor('files', 3))
  async create(@Body() dto: CreateSaleDto, @Request() req, @UploadedFiles() files?: Array<Express.Multer.File>){
    dto.files = files;
    return this.saleService.create(dto, req.user.id)
  }

  @Delete()
  @Roles(Role.ADMIN, Role.CREATOR)
  async delete(@Body() dto: DeleteSaleForAdminDto){
    return this.saleService.delete(dto);
  }

  @Post('publish/:id')
  @Roles(Role.ADMIN, Role.CREATOR)
  async publish(@Param('id') id: string){
    return this.saleService.publish(id);
  }
}
