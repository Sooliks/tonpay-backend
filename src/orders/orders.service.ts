import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from "./orders.dto";
import { PrismaService } from "../prisma.service";

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) {}
    async createOrder(dto: CreateOrderDto){
        
    }
}
