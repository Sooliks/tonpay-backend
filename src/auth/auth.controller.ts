import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from './auth.service';
import { PublicRoute } from "../decorators/public-route.decorator";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @Post("login")
  async login(@Body() body: { initData: string }) {
    return await this.authService.login(body.initData)
  }

  @Get("me")
  async getCurrentUser() {}
}
