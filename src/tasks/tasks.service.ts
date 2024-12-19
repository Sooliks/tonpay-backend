import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { TaskType } from "../types/tasks";
import { TelegramBotService } from "../telegram-bot/telegram-bot.service";
import { CheckCompleteTaskDto } from "./tasks.dto";
import { MoneyService } from "../money/money.service";
import { ReferralsService } from "../referrals/referrals.service";

@Injectable()
export class TasksService {
    private readonly tasks: TaskType[];
    constructor(private readonly prisma: PrismaService, private readonly telegramBotService: TelegramBotService, private readonly moneyService: MoneyService, private readonly referralsService: ReferralsService) {
        this.tasks = [
            {
                id: 0,
                name: 'Subscribe to our channel',
                reward: 0.04,
                check: async (userId: string) => {
                    const user = await this.prisma.user.findUnique({where: {id: userId}})
                    if(!user){
                        throw new NotFoundException('User not found');
                    }
                    return await this.telegramBotService.isUserSubscribed(user.telegramId)
                },
                isComplete: false,
                link: 'https://t.me/payonton'
            },
            {
                id: 1,
                name: 'Have more than 10 TON on your balance',
                reward: 0.1,
                check: async (userId: string) => {
                    const user = await this.prisma.user.findUnique({where: {id: userId}})
                    if(!user) throw new NotFoundException('User not found');
                    return user.money > 10
                },
                isComplete: false
            },
            {
                id: 2,
                name: 'Invite 5 friends',
                reward: 0.3,
                check: async (userId: string) => {
                    const count = await this.referralsService.getCountReferrals(userId);
                    return count >= 5;
                },
                isComplete: false
            },
            {
                id: 3,
                name: 'Invite 20 friends',
                reward: 1,
                check: async (userId: string) => {
                    const count = await this.referralsService.getCountReferrals(userId);
                    return count >= 20;
                },
                isComplete: false
            },
            {
                id: 4,
                name: 'Subscribe to our streamer',
                reward: 0.02,
                check: async (userId: string) => {
                    const user = await this.prisma.user.findUnique({where: {id: userId}})
                    if(!user)throw new NotFoundException('User not found');
                    return await this.telegramBotService.isUserSubscribed(user.telegramId, "-1002170458600")
                },
                isComplete: false,
                link: 'https://t.me/payonton'
            }
        ]
    }
    async getTasks(userId: string) {
        const prismaTasks = await this.prisma.task.findMany({
            where: {userId: userId}
        })
        const _tasks = this.tasks;
        for (let i = 0; i < _tasks.length; i++){
            if(prismaTasks.find(t=>t.idTaskInCode === _tasks[i].id)){
                _tasks[i].isComplete = prismaTasks.find(t=>
                    t.idTaskInCode === _tasks[i].id)?.isComplete || false;
            }
        }
        const newArrayOfObjects = _tasks.map(({check, ...rest }) => rest);
        return newArrayOfObjects;
    }
    async checkCompleteTask(dto: CheckCompleteTaskDto, userId: string) {
        const task = this.tasks.find(t=>t.id === dto.idTask);
        if (!task) {
            throw new NotFoundException('Task not found');
        }
        const result = await task.check(userId)
        if(result){
            const prismaTask = await this.prisma.task.findFirst({
                where: {
                    userId: userId,
                    idTaskInCode: task.id
                }
            })
            if(prismaTask){
                if(prismaTask.isComplete === true){
                    throw new BadRequestException('The task has already been completed')
                }
                await this.prisma.task.update({
                    where: {id: prismaTask.id},
                    data: {
                        isComplete: true
                    }
                })
            }else {
                await this.prisma.task.create({
                    data: {
                        isComplete: true,
                        user: {
                            connect: {id: userId}
                        },
                        idTaskInCode: task.id
                    }
                })
            }
            await this.moneyService.plusMoney(userId, task.reward)
        }else {
            throw new BadRequestException('The task has not been completed')
        }
    }
}
