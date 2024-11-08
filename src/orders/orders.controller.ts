import { Body, Controller, Get, Param, Post, Query, Request } from "@nestjs/common";
import { OrdersService } from './orders.service';
import { CreateFeedbackDto } from "../feedback/feedback.dto";
import { CancelOrderDto, ConfirmOrderDto, CreateOrderDto } from "./orders.dto";
import { Roles } from "../decorators/role.decorator";
import { Role } from "@prisma/client";

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

  @Post('confirm')
  async confirmOrder(@Request() req, @Body() dto: ConfirmOrderDto) {
    return this.ordersService.confirmOrder(dto.orderId, req.user.id)
  }

  @Roles(Role.ADMIN, Role.CREATOR)
  @Post('confirm/foradmin')
  async confirmOrderForAdmin(@Request() req, @Body() dto: ConfirmOrderDto) {
    return this.ordersService.confirmOrderForAdmins(dto.orderId, req.user.id)
  }

  @Post('cancel')
  async cancelOrder(@Request() req, @Body() dto: CancelOrderDto) {
    return this.ordersService.cancelOrder(dto.orderId, req.user.id)
  }

  @Roles(Role.ADMIN, Role.CREATOR)
  @Post('cancel/foradmin')
  async cancelOrderForAdmin(@Request() req, @Body() dto: CancelOrderDto) {
    return this.ordersService.cancelOrderForAdmins(dto.orderId, req.user.id)
  }


}
