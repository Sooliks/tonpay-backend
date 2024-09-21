import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateFeedbackDto } from "./feedback.dto";

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}
  async create(feedbackDto: CreateFeedbackDto, userId: string){
    const findFeedback = await this.prisma.feedback.findFirst({
      where: {userId: userId, saleId: feedbackDto.saleId}
    })
    if(findFeedback){
      throw new BadRequestException('A review has already been left for this product')
    }
    return this.prisma.feedback.create({
      data: { ...feedbackDto, userId: userId }
    })
  }

  async delete(feedbackId: string) {
    return this.prisma.feedback.delete({
      where: {id: feedbackId}
    })
  }
}
