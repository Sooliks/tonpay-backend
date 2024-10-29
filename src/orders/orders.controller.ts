import { Body, Controller, Get, Param, Post, Query, Request } from "@nestjs/common";
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
  @Get('mysales')
  async getMySales(@Query('count') count: number, @Request() req, @Query('skip') skip?: number) {
    return this.ordersService.getMySales(req.user.id, count, skip)
  }
  @Get('mypurchases')
  async getMyPurchases(@Query('count') count: number, @Request() req, @Query('skip') skip?: number) {
    return this.ordersService.getMyPurchases(req.user.id, count, skip)
  }
  @Get('byid/:id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }
}
