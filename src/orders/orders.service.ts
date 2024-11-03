import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateOrderDto } from "./orders.dto";
import { PrismaService } from "../prisma.service";
import { MoneyService } from "../money/money.service";
import { ChatService } from "../chat/chat.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService, private readonly moneyService: MoneyService, private readonly chatService: ChatService, private readonly notificationsService: NotificationsService) {}
    async createOrder(dto: CreateOrderDto) {
        const sale = await this.prisma.sale.findUnique({ where: { id: dto.saleId } })
        if (!sale) {
            throw new NotFoundException("No sale found")
        }
        if (sale.isModerating || !sale.isPublished) {
            throw new BadRequestException("No sale found")
        }
        if (sale.userId === dto.userId) {
            throw new BadRequestException("You can't buy your own product")
        }
        await this.moneyService.minusMoney(dto.userId, sale.price)
        try {
            const product: string | undefined = sale.product.at(-1);
            if (product) {
                const products = sale.product.splice(sale.product.length - 1, 1);
                const updatedSale = await this.prisma.sale.update({
                    where: { id: sale.id },
                    data: {
                        product: { set: products }
                    }
                })
                if (updatedSale.product.length === 0) {
                    await this.prisma.sale.update({ where: { id: sale.id }, data: { isPublished: false } })
                }
            }
            const message = await this.chatService.createMessage({
                recipientId: dto.userId,
                senderId: sale.userId,
                message: `The order has been created, confirm only after the order is fully completed. Don't forget to confirm it on the order page. ${product ? `\nAuto delivery: ${product}` : ''}`
            }, true)
            if (sale.autoMessage) {
                await this.chatService.createMessage({
                    recipientId: dto.userId,
                    senderId: sale.userId,
                    message: sale.autoMessage
                })
            }
            await this.notificationsService.notifyUser(sale.userId, 'You have a new order', true)
            const order = await this.prisma.order.create({
                data: {
                    saleId: sale.id,
                    customerId: dto.userId,
                    amount: sale.price,
                    product: product,
                    sellerId: sale.userId
                }
            })
            return {
                order: order,
                chatId: message.chatId
            }
        }catch (e) {
            await this.moneyService.plusMoney(dto.userId, sale.price)
            throw new BadRequestException("Unexpected error")
        }
    }
    async getMyPurchases(userId: string, count: number, skip?: number) {
        return this.prisma.order.findMany({
            where: {customerId: userId},
            take: Number(count),
            skip: Number(skip),
            include: {
                sale: true
            },
            orderBy: {createdAt: 'desc'}
        })
    }
    async getMySales(userId: string, count: number, skip?: number) {
        return this.prisma.order.findMany({
            where: {sellerId: userId},
            take: Number(count),
            skip: Number(skip),
            include: {
                sale: true
            },
            orderBy: {createdAt: 'desc'}
        })
    }
    async getOrderById(orderId: string){
        return this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                sale: true,
                seller: true,
                customer: true,
                feedback: true
            }
        })
    }
    async confirmOrder(orderId: string, userId: string) {
        let order = await this.prisma.order.findUnique({where: {id: orderId, customerId: userId}});
        if(!order){
            throw new NotFoundException("No order found")
        }
        if(order.isCompleted || order.isCancelled){
            throw new NotFoundException("The order has already been cancelled or confirmed")
        }
        order = await this.prisma.order.update({
            where: {customerId: userId, id: orderId},
            data: {
                isCompleted: true
            }
        })
        if(!order){
            throw new NotFoundException("No order found")
        }
        await this.moneyService.plusMoney(order.sellerId, order.amount)
        await this.notificationsService.notifyUser(order.sellerId, `The user has confirmed the order #${order.id}`, true)
        await this.chatService.createMessage({
            recipientId: order.sellerId,
            senderId: order.customerId,
            message: `Order ${order.id} has been confirmed`
        }, true)
        return order;
    }
}
