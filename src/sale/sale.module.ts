import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { PrismaService } from "../prisma.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { FeedbackModule } from "../feedback/feedback.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [FeedbackModule, NotificationsModule],
  controllers: [SaleController],
  providers: [SaleService, PrismaService, CloudinaryService],
})
export class SaleModule {}
