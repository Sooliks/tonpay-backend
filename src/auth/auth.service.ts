import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { parse, User, validate } from "@telegram-apps/init-data-node";
import { PrismaService } from "../prisma.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService,private readonly jwtService: JwtService) {}
  async login(initData: string) {
    const botToken = this.configService.get<string>('TELEGRAMBOT_TOKEN')

    try {
      validate(initData, botToken, {
        expiresIn: 10000,
      })

      const parsedData = parse(initData)
      const user = await this.findOrCreateUser(parsedData.user.id, parsedData.user.username)
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
  async findOrCreateUser(telegramId: number, nickname: string) {
    let user = await this.prisma.user.findUnique({
      where: {telegramId: telegramId}
    })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId: telegramId,
          nickname: nickname
        }
      })
    }
    return user
  }
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({where: {id: id}})
    if (!user) {
      throw new NotFoundException()
    }
    return user
  }
}
