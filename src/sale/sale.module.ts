import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { PrismaService } from "../prisma.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { FeedbackService } from "../feedback/feedback.service";

@Module({
  controllers: [SaleController],
  providers: [SaleService, PrismaService, CloudinaryService, FeedbackService],
})
export class SaleModule {}
