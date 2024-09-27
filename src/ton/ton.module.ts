import { Module } from '@nestjs/common';
import { TonService } from './ton.service';
import { TonController } from './ton.controller';
import { PrismaService } from "../prisma.service";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [TonController],
  providers: [TonService, PrismaService, ConfigService]
})
export class TonModule {}
