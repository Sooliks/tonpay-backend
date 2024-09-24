import { Body, Controller, Get, Post, Request } from "@nestjs/common";
import { AuthService } from './auth.service';
import { PublicRoute } from "../decorators/public-route.decorator";
import { Role } from "@prisma/client";
import { Roles } from "../decorators/role.decorator";


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("login")
  @PublicRoute()
  async login(@Body() body: { initData: string, refId?: string }) {
    console.log('1')
    return await this.authService.login(body.initData, body.refId)
  }
  @Get("me")
  async getCurrentUser(@Request() req: { id: string }) {
    console.log('2')
    return await this.authService.getUserById(req.id)
  }
}
