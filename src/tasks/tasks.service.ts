import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { TaskType } from "../types/tasks";
import { TelegramBotService } from "../telegram-bot/telegram-bot.service";
import { CheckCompleteTaskDto } from "./tasks.dto";
import { MoneyService } from "../money/money.service";

@Injectable()
export class TasksService {
    private readonly tasks: TaskType[];
    constructor(private readonly prisma: PrismaService, private readonly telegramBotService: TelegramBotService, private readonly moneyService: MoneyService) {
        this.tasks = [
            {
                id: 0,
                name: 'Subscribe to our channel',
                reward: 0.05,
                check: async (telegramId: number) => await this.telegramBotService.isUserSubscribed(telegramId),
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
        const user = await this.prisma.user.findUnique({where: {id: userId}})
        if(!user){
            throw new NotFoundException('User not found');
        }
        const result = await task.check(user.telegramId)
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
