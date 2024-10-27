import { Body, Controller, Get, Param, Post, Request } from "@nestjs/common";
import { OrdersService } from './orders.service';
import { CreateFeedbackDto } from "../feedback/feedback.dto";
import { CreateOrderDto } from "./orders.dto";

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto, @Request() req){
    dto.userId = req.user.id;
    return this.ordersService.createOrder(dto)
  }

  @Get('byid/:id')
  async getOrder(@Param('id') id: string) {

  }
  @Get('mysales')
  async getMySales(@Request() req) {
    return this.ordersService.getMySales(req.user.id)
  }
  @Get('mypurchases')
  async getMyPurchases(@Request() req) {
    return this.ordersService.getMyPurchases(req.user.id)
  }
}
