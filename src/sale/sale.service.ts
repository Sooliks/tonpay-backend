import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateSaleDto, DeleteSaleForAdminDto } from "./sale.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { FeedbackService } from "../feedback/feedback.service";
import { NotificationsService } from "../notifications/notifications.service";
@Injectable()
export class SaleService {
  constructor(private readonly prisma: PrismaService, private readonly cloudinary: CloudinaryService, private readonly feedbackService: FeedbackService, private readonly notificationsService: NotificationsService) {}
  async findAllBySubScopeId(id: string, count: number, skip?: number){
    const sales = await this.prisma.sale.findMany({
      where: { subScopeId: id, isModerating: false, isPublished: true },
      include: {
        subScope: {
          include: {
            scope: true,
          },
        },
        user: true,
      },
      orderBy: [{ lastUp: 'desc' }],
      take: Number(count),
      skip: skip ? Number(skip) : undefined,
    });
    // Удаляем поле product у каждой записи
    const salesWithoutProduct = sales.map((sale) => {
      const { product, ...saleWithoutProduct } = sale;
      return saleWithoutProduct;
    });
    return salesWithoutProduct;
  }
  async getSaleById(id: string){
    const sale = await this.prisma.sale.findUnique({
      where: {id: id},
      include: {
        subScope: {
          include: {
            scope: true
          }
        },
        user: {
          include: {myFeedbacks: true}
        }
      }
    })
    const user = {...sale.user, averageRating: await this.feedbackService.getAverageRating(sale.user.myFeedbacks)}
    sale.user = user
    delete sale.product;
    return sale
  }
  async findAllByUserId(userId: string, isPublished?: boolean) {
    return this.prisma.sale.findMany({
      where: { userId: userId, isPublished: isPublished },
      select: {
        id: true,
        createdAt: true,
        user: true,
        price: true,
        isPublished: true,
        isModerating: true,
        subScopeId: true,
        subScope: {
          include: {
            scope: true,
          },
        },
        adminId: true,
        title: true,
        description: true,
        currency: true,
        screenUrls: true,
        orders: true,
        lastUp: true,
        autoMessage: true,
      },
      orderBy: [{lastUp: 'desc'}]
    })
  }
  async findAllOnModerating() {
    return this.prisma.sale.findMany({
      where: { isModerating: true },
      include: {
        subScope: {
          include: {
            scope: true
          }
        },
        user: true
      }
    })
  }

  async delete(dto: DeleteSaleForAdminDto){
    const sale = await this.prisma.sale.findUnique({where: {id: dto.id}})
    if(sale.screenUrls.length > 0){
      sale.screenUrls.map(async screen => {
        await this.cloudinary.deleteImage(screen)
      })
    }
    const textNotify = dto.reason ? `Your sale "${sale.title}" did not pass moderation and was deleted for a reason: ${dto.reason}` : `Your sale "${sale.title}" did not pass moderation and was deleted.`;
    await this.notificationsService.notifyUser(sale.userId, textNotify, true)
    return this.prisma.sale.delete({where: {id: dto.id}})
  }

  async create(saleDto: CreateSaleDto, userId: string){
    const count = await this.prisma.sale.count({where: {userId: userId}})
    const user = await this.prisma.user.findUnique({where: {id: userId}})
    if(!user)throw new BadRequestException('Not found user')
    if(user.isBanned){

    }
    if(!user.isPremium){
      if(count >= 5){
        throw new BadRequestException('For users without a premium, the number of sales is limited')
      }
    }
    const sale = await this.prisma.sale.create({
      data: {
        price: Number(saleDto.price),
        userId: userId,
        product: saleDto.product,
        description: saleDto.description,
        subScopeId: saleDto.subScopeId,
        title: saleDto.title,
        currency: saleDto.currency ? Number(saleDto.currency) : undefined,
        autoMessage: saleDto.autoMessage
      }
    })
    await this.prisma.user.update({where: {id: user.id}, data: {lastUpSales: new Date()}})
    let screenUrls: string[] = []
    for (let i = 0; i < saleDto.files.length; i++){
      const res =  await this.cloudinary.uploadImage(saleDto.files[i], `/tonpay/sale/${sale.id}`)
      screenUrls = [...screenUrls, res.public_id]
    }
    if(screenUrls.length > 0) await this.prisma.sale.update({where: {id: sale.id}, data: {screenUrls: screenUrls}})
    return sale;
  }

  async publish(idSale: string){
    return this.prisma.sale.update({
      where: {id: idSale},
      data: {
        isModerating: false,
        isPublished: true
      }
    })
  }
  async setLastWatchingSaleId(saleId: string, userId: string) {
    const sale = await this.prisma.sale.findUnique({where: {id: saleId, isPublished: true}})
    if(!sale){
      return
    }
    return this.prisma.user.update({where: {id: userId}, data: {lastWatchingSaleId: saleId}})
  }
  private timeUntilFourHoursPassed(startDate?: Date): { hours: number; minutes: number; seconds: number } | null {
    if(!startDate){
      return null;
    }
    const FOUR_HOURS_IN_MS = 4 * 60 * 60 * 1000; // 4 часа в миллисекундах
    const currentDate = new Date();
    const elapsedTime = currentDate.getTime() - startDate.getTime();

    // Если прошло 4 часа или более, возвращаем null
    if (elapsedTime >= FOUR_HOURS_IN_MS) {
      return null;
    }

    // Иначе считаем оставшееся время до 4 часов
    const remainingTime = FOUR_HOURS_IN_MS - elapsedTime;
    const hours = Math.floor(remainingTime / (60 * 60 * 1000));
    const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

    return { hours, minutes, seconds };
  }

  async upSales(userId: string) {
    const user = await this.prisma.user.findUnique({where: {id: userId}})
    if(!user){
      throw new NotFoundException('User not found')
    }
    const timeRemaining = this.timeUntilFourHoursPassed(user.lastUpSales);
    if (timeRemaining) {
      throw new BadRequestException(`${timeRemaining.hours} hours ${timeRemaining.minutes} min left`);
    } else {
      await this.prisma.sale.updateMany({
        where: {userId: user.id},
        data: {
          lastUp: new Date()
        }
      })
      return this.prisma.user.update({where: {id: user.id}, data: {lastUpSales: new Date()}})
    }
  }
}
