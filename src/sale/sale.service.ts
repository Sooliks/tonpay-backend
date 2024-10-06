import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Sale } from "@prisma/client";
import { CreateSaleDto } from "./sale.dto";


@Injectable()
export class SaleService {
  constructor(private readonly prisma: PrismaService) {}
  findAllBySubScopeId(id: string){
    return this.prisma.sale.findMany({
      where: { subScopeId: id, isModerating: false, isPublished: true},
      include: {
        feedbacks: true,
        subScope: {
          include: {
            scope: true
          }
        }
      },
      orderBy: [{id: 'desc'}]
    })
  }
  getSaleById(id: string){
    return this.prisma.sale.findUnique({
      where: {id: id},
      include: {
        feedbacks: true,
        subScope: {
          include: {
            scope: true
          }
        }
      }
    })
  }
  findAllByUserId(userId: string) {
    return this.prisma.sale.findMany({
      where: { userId: userId },
      include: {
        feedbacks: true,
        subScope: {
          include: {
            scope: true
          }
        }
      },
      orderBy: [{id: 'desc'}]
    })
  }
  findAllOnModerating() {
    return this.prisma.sale.findMany({
      where: { isModerating: true },
      include: {
        feedbacks: true,
        subScope: {
          include: {
            scope: true
          }
        }
      }
    })
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
    return this.prisma.sale.create({
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
  }
}
