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
        if(sale.price !== dto.price) {
            throw new BadRequestException("The price has changed")
        }
        if(sale.currency){
            if(sale.currency < dto.count){
                throw new BadRequestException("The seller cannot sell that much currency")
            }
        }
        if(sale.product.length > 0) {
            if(dto.count > 1){
                throw new BadRequestException("You can't buy multiple products with auto-delivery at once")
            }
        }
        await this.moneyService.minusMoney(dto.userId, sale.price * dto.count)
        try {
            const products = sale.product;

            const product: string | undefined = products.pop();
            if (product) {
                const updatedSale = await this.prisma.sale.update({
                    where: { id: sale.id },
                    data: {
                        product: products
                    }
                })
                if (updatedSale.product.length === 0) {
                    await this.notificationsService.notifyUser(sale.userId, `Your sale "${sale.title}" has run out of items. Add new products or leave it empty and submit it for re-moderation.`, true)
                    await this.prisma.sale.update({ where: { id: sale.id }, data: { isPublished: false } })
                }
            }

            const message = await this.chatService.createMessage({
                recipientId: dto.userId,
                senderId: sale.userId,
                message: `The order has been created, confirm only after the order is fully completed. Don't forget to confirm it on the order page. ${product ? `\n\n\n\nAuto delivery: ${product}` : ''} \n\n\n Count: ${dto.count}`
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
                    amount: sale.price * dto.count,
                    product: product,
                    sellerId: sale.userId,
                    count: dto.count
                }
            })
            return {
                order: order,
                chatId: message.chatId
            }
        }catch (e) {
            await this.moneyService.plusMoney(dto.userId, sale.price * dto.count)
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
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                sale: true,
                seller: true,
                customer: true,
                feedback: true
            }
        })
        delete order.product
        return order;
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
        await this.moneyService.plusMoney(order.sellerId, order.amount)
        await this.notificationsService.notifyUser(order.sellerId, `The user has confirmed the order #${order.id}`, true)
        await this.chatService.createMessage({
            recipientId: order.sellerId,
            senderId: order.customerId,
            message: `Order #${order.id} has been confirmed`
        }, true)
        return order;
    }
    async confirmOrderForAdmins(orderId: string, adminId: string) {
        let order = await this.prisma.order.findUnique({where: {id: orderId}});
        if(!order){
            throw new NotFoundException("No order found")
        }
        if(order.isCompleted || order.isCancelled){
            throw new NotFoundException("The order has already been cancelled or confirmed")
        }
        order = await this.prisma.order.update({where: {id: orderId}, data: {isCompleted: true}})
        await this.moneyService.plusMoney(order.sellerId, order.amount)
        await this.notificationsService.notifyUser(order.sellerId, `The order #${order.id} has been confirmed by the administrator.`, true)
        await this.notificationsService.notifyUser(order.customerId, `The order #${order.id} has been confirmed by the administrator.`, true)
        return order;
    }

    async cancelOrder(orderId: string, userId: string) {
        let order = await this.prisma.order.findUnique({where: {id: orderId, sellerId: userId}});
        if(!order){
            throw new NotFoundException("No order found")
        }
        if(order.isCompleted || order.isCancelled){
            throw new NotFoundException("The order has already been cancelled or confirmed")
        }
        order = await this.prisma.order.update({
            where: {sellerId: userId, id: orderId},
            data: {
                isCancelled: true
            }
        })
        await this.moneyService.plusMoney(order.customerId, order.amount)
        await this.notificationsService.notifyUser(order.customerId, `The user has cancelled the order #${order.id}`, true)
        await this.chatService.createMessage({
            recipientId: order.customerId,
            senderId: order.sellerId,
            message: `Order #${order.id} has been cancelled`
        }, true)
        return order;
    }
    async cancelOrderForAdmins(orderId: string, adminId: string) {
        let order = await this.prisma.order.findUnique({where: {id: orderId}});
        if(!order){
            throw new NotFoundException("No order found")
        }
        if(order.isCompleted || order.isCancelled){
            throw new NotFoundException("The order has already been cancelled or confirmed")
        }
        order = await this.prisma.order.update({where: {id: orderId}, data: {isCancelled: true}})
        await this.moneyService.plusMoney(order.customerId, order.amount)
        await this.notificationsService.notifyUser(order.customerId, `The order #${order.id} has been cancelled by the administrator.`, true)
        await this.notificationsService.notifyUser(order.sellerId, `The order #${order.id} has been cancelled by the administrator.`, true)
        return order;
    }
}
