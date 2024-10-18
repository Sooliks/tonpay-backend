import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaService } from "../prisma.service";
import { FeedbackService } from "../feedback/feedback.service";

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService, FeedbackService],
})
export class ProfileModule {}
