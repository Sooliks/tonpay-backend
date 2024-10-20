import { Module } from '@nestjs/common';
import { MoneyService } from './money.service';
import { PrismaService } from "../prisma.service";
@Module({
  providers: [MoneyService, PrismaService],
  exports: [MoneyService]
})
export class MoneyModule {}
