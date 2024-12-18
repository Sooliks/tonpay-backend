import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma.service";
import { TaskType } from "../types/tasks";
import { TelegramBotService } from "../telegram-bot/telegram-bot.service";

@Injectable()
export class TasksService {
    private readonly tasks: TaskType[];

    constructor(private readonly prisma: PrismaService, private readonly telegramBotService: TelegramBotService) {
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
}
