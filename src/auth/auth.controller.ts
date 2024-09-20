import { Body, Controller, Get, Header, Post, Request } from "@nestjs/common";
import { AuthService } from './auth.service';
import { PublicRoute } from "../decorators/public-route.decorator";


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post("login")
  @PublicRoute()
  async login(@Body() body: { initData: string }) {
    return await this.authService.login(body.initData)
  }
  @Get("me")
  async getCurrentUser(@Request() req: { id: string }) {
    return await this.authService.getUserById(req.id)
  }
}
