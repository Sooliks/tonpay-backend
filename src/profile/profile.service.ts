import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma.service";
import { FeedbackService } from "../feedback/feedback.service";


@Injectable()
export class ProfileService {
    constructor(private readonly prisma: PrismaService, private readonly feedbackService: FeedbackService) {}
    async getUserById(id: string){
        let user: any = await this.prisma.user.findUnique({
            where: {id: id},
            select: {
                id: true,
                isBanned: true,
                isPremium: true,
                lastOnline: true,
                refId: true,
                photoUrl: true,
                role: true,
                nickname: true
            }
        })
        const feedbacks = await this.prisma.feedback.findMany({
            where: {
                sale: {
                    userId: id
                }
            },
            include: {sale: true}
        })
        if (feedbacks.length > 0) {
            return {...user, rate: await this.feedbackService.getAverageRating(feedbacks)};
        } else {
            return {...user, rate: undefined};
        }
    }
}
