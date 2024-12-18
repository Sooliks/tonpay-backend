import { Module } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [ReferralsController],
  providers: [ReferralsService, PrismaService],
})
export class ReferralsModule {}
