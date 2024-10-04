import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Sale } from "@prisma/client";
import { CreateSaleDto } from "./sale.dto";


@Injectable()
export class SaleService {
  constructor(private readonly prisma: PrismaService) {}
  findAll(count: number, userId?: string, skip?: number) {
    return this.prisma.sale.findMany({
      where: {
        userId: userId
      },
      take: count,
      skip: skip,
      include: {
        feedbacks: true
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
        title: saleDto.title
      }
    })
  }
}
