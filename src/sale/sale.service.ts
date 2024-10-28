import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateSaleDto, DeleteSaleForAdminDto } from "./sale.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { FeedbackService } from "../feedback/feedback.service";
@Injectable()
export class SaleService {
  constructor(private readonly prisma: PrismaService, private readonly cloudinary: CloudinaryService, private readonly feedbackService: FeedbackService) {}
  async findAllBySubScopeId(id: string, count: number, skip?: number){
    return this.prisma.sale.findMany({
      where: { subScopeId: id, isModerating: false, isPublished: true},
      include: {
        feedbacks: true,
        subScope: {
          include: {
            scope: true
          }
        },
        user: true
      },
      orderBy: [{id: 'desc'}],
      take: Number(count),
      skip: skip ? Number(skip) : undefined
    })
  }
  async getSaleById(id: string){
    const sale = await this.prisma.sale.findUnique({
      where: {id: id},
      include: {
        feedbacks: true,
        subScope: {
          include: {
            scope: true
          }
        },
        user: {
          include: {feedbacks: true}
        }
      }
    })
    const user = {...sale.user, rate: await this.feedbackService.getAverageRating(sale.user.feedbacks)}
    sale.user = user
    return sale
  }
  async findAllByUserId(userId: string) {
    return this.prisma.sale.findMany({
      where: { userId: userId },
      include: {
        feedbacks: true,
        subScope: {
          include: {
            scope: true
          }
        },
        user: true
      },
      orderBy: [{id: 'desc'}]
    })
  }
  async findAllOnModerating() {
    return this.prisma.sale.findMany({
      where: { isModerating: true },
      include: {
        feedbacks: true,
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
    return this.prisma.sale.delete({where: {id: dto.id}})
  }

  async create(saleDto: CreateSaleDto, userId: string){
    const count = await this.prisma.sale.count({where: {userId: userId}})
    const user = await this.prisma.user.findUnique({where: {id: userId}})
    if(!user)throw new BadRequestException('Not found user')
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
        currency: saleDto.currency ? Number(saleDto.currency) : undefined
      }
    })
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
    if(!sale)throw new BadRequestException('Not found sale')
    return this.prisma.user.update({where: {id: userId}, data: {lastWatchingSaleId: saleId}})
  }
}
