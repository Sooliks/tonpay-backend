import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma.service";
import { Sale } from "@prisma/client";
import { CreateSaleDto } from "./sale.dto";


@Injectable()
export class SaleService {
  constructor(private readonly prisma: PrismaService) {}
  findAll() {
    return this.prisma.sale.findMany()
  }

  create(saleDto: CreateSaleDto, userId: string){
    return this.prisma.sale.create({
      data: {
        ...saleDto,
        userId: userId
      }
    })
  }
}
