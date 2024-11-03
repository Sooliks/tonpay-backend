import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfirmReportDto, CreateReportDto, GetChatReportDto, TakeReportDto } from "./reports.dto";
import { PrismaService } from "../prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { Role } from "@prisma/client";

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService, private readonly notificationsService: NotificationsService) {}
    async createReport(dto: CreateReportDto, userId: string){
        const order = await this.prisma.order.findUnique({where:{id: dto.orderId}})
        if(!order){
            throw new NotFoundException("Order not found")
        }
        if(order.isCompleted){
            throw new BadRequestException("Order already completed")
        }
        if(order.isCancelled){
            throw new NotFoundException("Order already cancelled")
        }
        const countReports = await this.prisma.report.count({
            where: {
                orderId: dto.orderId,
                userId: userId
            }
        })
        if(countReports > 5){
            throw new BadRequestException("The maximum number of reposts has been left for this order")
        }
        const admins = await this.prisma.user.findMany({where: {OR: [{role: Role.ADMIN}, {role: Role.CREATOR}]}})
        admins.map(async admin => {
            await this.notificationsService.notifyUser(admin.id, 'Admin notify: check new report', true)
        })
        return this.prisma.report.create({
            data: {
                userId: userId,
                text: dto.text,
                orderId: dto.orderId
            }
        })
    }
    async takeReport(dto: TakeReportDto, adminId: string){
        const report = await this.prisma.report.findUnique({where: {id: dto.reportId}})
        if(!report.adminId || report.adminId === adminId) {
            return this.prisma.report.update({
                where: { id: dto.reportId },
                data: {
                    adminId: adminId
                }
            })
        }
        throw new BadRequestException('The report has already been taken by another administrator')
    }
    async confirmReport(dto: ConfirmReportDto, adminId: string){
        await this.takeReport(dto, adminId)
        return this.prisma.report.update({
            where: {id: dto.reportId, adminId: adminId},
            data: {
                isCompleted: true
            },
            include: {user: true}
        })
    }
    async getAllReports(isCompleted: boolean, count?: number, skip?: number){
        return this.prisma.report.findMany({
            where: {
                isCompleted: isCompleted,
            },
            include: {
                user: true,
                admin: true
            },
            take: count ? Number(count) : undefined,
            skip: skip ? Number(skip) : undefined,
            orderBy: {createdAt: isCompleted ? 'desc' : 'asc'}
        });
    }
    async getChat(dto: GetChatReportDto, adminId: string){
        await this.takeReport(dto, adminId)
        const report = await this.prisma.report.findUnique({
            where: {
                id: dto.reportId
            },
            include: {
                order: true
            }
        })
        if(!report){
            throw new NotFoundException("Report not found")
        }
        const chat = await this.prisma.chat.findFirst({
            where: {
                users: {
                    some: { userId: report.order.sellerId },
                },
                AND: {
                    users: {
                        some: { userId: report.order.customerId },
                    }
                }
            }
        });
        if(!chat){
            throw new NotFoundException("Chat not found")
        }
        const isAdminInChat = await this.prisma.userChat.findFirst({
            where: {
                chatId: chat.id,
                userId: adminId,
            }
        });
        if (!isAdminInChat) {
            await this.prisma.userChat.create({
                data: {
                    chatId: chat.id,
                    userId: adminId
                }
            });
        }
        return chat.id;
    }
}
