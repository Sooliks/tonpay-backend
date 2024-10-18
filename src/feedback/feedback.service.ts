import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateFeedbackDto } from "./feedback.dto";
import { Feedback } from "@prisma/client";

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
  async getAverageRating(feedbacks: Feedback[]){
    const ratings = feedbacks.map(feedback => feedback.rate); // Предполагаем, что рейтинг хранится в поле `rating`
    const totalRatings = ratings.reduce((sum, rating) => sum + rating, 0);
    const averageRating = totalRatings / feedbacks.length;
    return Math.round(averageRating * 10) / 10;
  }
}
