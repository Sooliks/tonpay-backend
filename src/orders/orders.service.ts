import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from "./orders.dto";

@Injectable()
export class OrdersService {
    async createOrder(dto: CreateOrderDto){

    }
}
