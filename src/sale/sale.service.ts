import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateSaleDto, DeleteSaleForAdminDto, UpdateSaleDto } from "./sale.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { FeedbackService } from "../feedback/feedback.service";
import { NotificationsService } from "../notifications/notifications.service";
import { TelegramBotService } from "../telegram-bot/telegram-bot.service";
@Injectable()
export class SaleService {
  constructor(private readonly prisma: PrismaService, private readonly cloudinary: CloudinaryService, private readonly feedbackService: FeedbackService, private readonly notificationsService: NotificationsService, private readonly telegramBotService: TelegramBotService) {}
  async findAllBySubScopeId(id: string, count: number, skip?: number, search?: string){
    const whereCondition: any = {
      subScopeId: id,
      isModerating: false,
      isPublished: true,
    };
    if (search) {
      whereCondition.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }
    const sales = await this.prisma.sale.findMany({
      where: whereCondition,
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
      const { product, autoMessage, ...saleWithoutProduct } = sale;
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
    delete sale.autoMessage;
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
        product: true,
        userId: true
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
    const sale = await this.prisma.sale.findUnique({where: {id: dto.id}, include: {user: true}})
    if(!sale){
      throw new NotFoundException("Sale not found")
    }
    if(dto.isDecline){
      const textNotify = dto.reason ? `Your sale "${sale.title}" did not pass moderation and was declined for a reason: ${dto.reason}` : `Your sale "${sale.title}" did not pass moderation and was decline.`;
      await this.telegramBotService.sendMessage(sale.user.telegramId, textNotify)
      return this.prisma.sale.update({
        where: { id: dto.id },
        data: {
          isModerating: false,
          isPublished: false
        }
      })
    }else {
      if (sale.screenUrls.length > 0) {
        sale.screenUrls.map(async screen => {
          await this.cloudinary.deleteImage(screen)
        })
      }
      const textNotify = dto.reason ? `Your sale "${sale.title}" did not pass moderation and was deleted for a reason: ${dto.reason}` : `Your sale "${sale.title}" did not pass moderation and was deleted.`;
      await this.telegramBotService.sendMessage(sale.user.telegramId, textNotify)
      return this.prisma.sale.delete({ where: { id: dto.id } })
    }
  }

  async update(saleDto: UpdateSaleDto, userId: string){
    const orders = await this.prisma.order.findMany({where: {saleId: saleDto.id, isCompleted: false, isCancelled: false}})
    if(orders.length > 0){
      throw new BadRequestException('You cannot edit a sale with an active order')
    }
    return this.prisma.sale.update({
      where: {
        userId: userId,
        id: saleDto.id
      },
      data: {
        price: saleDto.price,
        product: saleDto.product,
        title: saleDto.title,
        description: saleDto.description,
        currency: saleDto.currency,
        autoMessage: saleDto.autoMessage,
        isPublished: false,
        isModerating: true
      }
    })
  }

  async create(saleDto: CreateSaleDto, userId: string){
    const count = await this.prisma.sale.count({where: {userId: userId}})
    const user = await this.prisma.user.findUnique({where: {id: userId}})
    if(!user)throw new BadRequestException('Not found user')
    if(user.isBanned){

    }
    if(!user.isPremium){
      if(count >= 10){
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
    if (elapsedTime >= FOUR_HOURS_IN_MS) {
      return null;
    }
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

  async deleteForUser(saleId: string, userId: string) {
    const orders = await this.prisma.order.findMany({where: {saleId: saleId, isCompleted: false, isCancelled: false}})
    if(orders.length > 0){
      throw new BadRequestException('You cannot delete a sale with an active order')
    }
    const sale = await this.prisma.sale.findUnique({where: {id: saleId}})
    if (sale.screenUrls.length > 0) {
      sale.screenUrls.map(async screen => {
        await this.cloudinary.deleteImage(screen)
      })
    }
    return this.prisma.sale.delete({ where: { id: saleId, userId: userId } })
  }

  async getLastSales() {
    const sales = await this.prisma.sale.findMany({
      where: {
        isPublished: true,
        isModerating: false
      },
      orderBy: [{ lastUp: 'desc' }],
      take: 20,
      include: {
        subScope: {
          include: {
            scope: true,
          },
        },
        user: true,
      }
    })
    const salesWithoutProduct = sales.map((sale) => {
      const { product, autoMessage, ...saleWithoutProduct } = sale;
      return saleWithoutProduct;
    });
    return salesWithoutProduct;
  }
}
