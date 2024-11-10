import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { parse, validate } from "@telegram-apps/init-data-node";
import { PrismaService } from "../prisma.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { TelegramBotService } from "../telegram-bot/telegram-bot.service";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService,private readonly jwtService: JwtService, private readonly telegramBotService: TelegramBotService) {}
  async login(initData: string, refId?: string) {
    const botToken = this.configService.get<string>('TELEGRAMBOT_TOKEN')

    try {
      /*validate(initData, botToken, {
        expiresIn: 10000,
      })*/

      const parsedData = parse(initData)
      const user = await this.findOrCreateUser(parsedData.user.id, parsedData.user.username, refId, parsedData.user.languageCode)
      if(user.isBanned === true) {
        throw new UnauthorizedException('You banned')
      }
      const payload = { id: user.id }
      return {
        user: user,
        token: await this.jwtService.signAsync(payload)
      }
    } catch (e) {
      console.log(e)
      throw new UnauthorizedException()
    }
  }
  async getAvatarUrl(telegramId: number): Promise<string | null> {
    try {
      const botToken = this.configService.get<string>('TELEGRAMBOT_TOKEN');
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${telegramId}`);
      const data = await response.json();
      if (data.ok && data.result.total_count > 0) {
        const fileId = data.result.photos[0][0].file_id;
        const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
        const fileData = await fileResponse.json();
        if (fileData.ok) {
          const filePath = fileData.result.file_path;
          return `https://api.telegram.org/file/bot${botToken}/${filePath}`;
        } else {
          throw new Error('Не удалось получить file_path');
        }
      } else {
        console.log('Аватарки не найдены.');
        return null;
      }
    } catch (error) {
      console.error('Ошибка при получении аватарки:', error);
    }
  };
  async findOrCreateUser(telegramId: number, nickname: string, refId?: string, languageCode?: string) {
    let user = await this.prisma.user.findUnique({
      where: {telegramId: telegramId}
    })
    if (!user) {
      let avatarUrl: string | undefined | null = undefined;
      try {
        avatarUrl = await this.getAvatarUrl(telegramId) || undefined;
      }catch (e) {

      }
      user = await this.prisma.user.create({
        data: {
          telegramId: telegramId,
          nickname: nickname,
          refId: refId,
          photoUrl: avatarUrl,
          languageCode: languageCode
        }
      })
    }
    return user
  }
  async getUserById(id: string, initData: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: id }})
      if (!user) {
        throw new NotFoundException()
      }
      const currentDate = new Date();
      const parsedData = parse(initData)
      await this.prisma.user.update({
        where: {id: id},
        data: {
          lastOnline: currentDate,
          photoUrl: await this.getAvatarUrl(parsedData.user.id),
          languageCode: parsedData.user.languageCode,
          isSubscribed: await this.telegramBotService.isUserSubscribed(user.telegramId)
        }
      })
      return user
    }catch (e) {
      throw new UnauthorizedException()
    }
  }
}
