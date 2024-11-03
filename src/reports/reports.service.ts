import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfirmReportDto, CreateReportDto, TakeReportDto } from "./reports.dto";
import { PrismaService } from "../prisma.service";

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService){}
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
        return this.prisma.report.create({
            data: {
                userId: userId,
                text: dto.text,
                orderId: dto.orderId
            }
        })
    }
    async takeReport(dto: TakeReportDto, adminId: string){
        return this.prisma.report.update({
            where: {id: dto.reportId},
            data: {
                adminId: adminId
            }
        })
    }
    async confirmReport(dto: ConfirmReportDto, adminId: string){
        return this.prisma.report.update({
            where: {id: dto.reportId, adminId: adminId},
            data: {
                isCompleted: true
            }
        })
    }
    async getAllReports(isCompleted: boolean){
        return this.prisma.report.findMany({
            where: {
                isCompleted: isCompleted,
            }
        });
    }
}
