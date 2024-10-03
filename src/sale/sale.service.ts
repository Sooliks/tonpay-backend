import { Injectable } from '@nestjs/common';
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
      skip: skip
    })
  }

  create(saleDto: CreateSaleDto, userId: string){
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
