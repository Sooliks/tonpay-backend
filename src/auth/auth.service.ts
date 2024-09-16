import { Injectable, UnauthorizedException } from "@nestjs/common";
import { parse, User, validate } from "@telegram-apps/init-data-node";

@Injectable()
export class AuthService {
  async login(initData: string) {
    const botToken = "6469404945:AAEC3hLqARPoKiz7RsLcUolYhk8CViVv318"

    try {
      validate(initData, botToken, {
        expiresIn: 300,
      })

      const parsedData = parse(initData)

      return {
        user: parsedData.user as User,
        token: "secret-token"
      }
    } catch (e) {
      throw new UnauthorizedException()
    }
  }
}
