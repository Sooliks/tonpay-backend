import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateFeedbackDto } from "./feedback.dto";
import { Feedback } from "@prisma/client";

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}
  async create(feedbackDto: CreateFeedbackDto, userId: string){
    const order = await this.prisma.order.findUnique({
      where: {
        customerId: userId,
        id: feedbackDto.orderId
      },
      include: {feedback: true}
    })
    if(!order){
      throw new NotFoundException("No order found")
    }
    if(order.feedback){
      throw new NotFoundException("A review has already been left for this order")
    }
    return this.prisma.feedback.create({
      data: {
        orderId: order.id,
        text: feedbackDto.text,
        recipientId: order.sellerId,
        userId: userId,
        rate: feedbackDto.rate
      }
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
  async getFeedbacksByUserId(userId: string){
    return this.prisma.feedback.findMany({where: {recipientId: userId}});
  }
}
