import { Body, Controller, Post, Request } from "@nestjs/common";
import { OrdersService } from './orders.service';
import { CreateFeedbackDto } from "../feedback/feedback.dto";
import { CreateOrderDto } from "./orders.dto";

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create')
  async createOrder(@Body() dto: CreateOrderDto, @Request() req){
    dto.userId = req.user.id;
    return this.ordersService.createOrder(dto)
  }
}
