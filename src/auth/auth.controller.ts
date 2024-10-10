import { Body, Controller, Get, Post, Request } from "@nestjs/common";
import { AuthService } from './auth.service';
import { PublicRoute } from "../decorators/public-route.decorator";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("login")
  @PublicRoute()
  async login(@Body() body: { initData: string, refId?: string }) {
    return await this.authService.login(body.initData, body.refId)
  }
  @Get("me")
  async getCurrentUser(@Request() req) {
    return await this.authService.getUserById(req.user.id, req.headers.initdata)
  }
}
