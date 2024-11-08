import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateFeedbackDto } from "./feedback.dto";
import { Feedback } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService, private notificationsService: NotificationsService) {}
  async create(feedbackDto: CreateFeedbackDto, userId: string){
    const order = await this.prisma.order.findUnique({
      where: {
        customerId: userId,
        id: feedbackDto.orderId
      },
      include: {
        feedback: true,
        seller: {
          include: {
            myFeedbacks: true
          }
        }
      }
    })
    if(!order){
      throw new NotFoundException("No order found")
    }
    if(order.isCancelled){
      throw new BadRequestException('Order was cancelled')
    }
    if(order.feedback){
      throw new NotFoundException("A review has already been left for this order")
    }
    await this.notificationsService.notifyUser(order.sellerId, `You have received a new feedback`, true)
    const feedback = await this.prisma.feedback.create({
      data: {
        orderId: order.id,
        text: feedbackDto.text,
        recipientId: order.sellerId,
        userId: userId,
        rate: feedbackDto.rate
      }
    })
    const avgRate = await this.getAverageRating([...order.seller.myFeedbacks, feedback]);
    await this.prisma.user.update({where: {id: order.sellerId}, data: {averageRating: avgRate}})
    return feedback;
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
  async getFeedbacksByUserId(userId: string, count: number, skip: number){
    return this.prisma.feedback.findMany({
      where: {recipientId: userId},
      include: {user: true, order: {include: {sale: true}}},
      take: Number(count),
      skip: Number(skip),
      orderBy: {id: 'desc'}
    });
  }
}
