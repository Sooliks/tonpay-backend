import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { PrismaService } from "../prisma.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Module({
  controllers: [SaleController],
  providers: [SaleService, PrismaService, CloudinaryService],
})
export class SaleModule {}
