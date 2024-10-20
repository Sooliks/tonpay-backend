import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from "./auth.guard";
import { APP_GUARD } from "@nestjs/core";
import { PrismaService } from "../prisma.service";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_CONSTANTS,
      signOptions: { expiresIn: "1h" },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService,{
    provide: APP_GUARD,
    useClass: AuthGuard,
  }, PrismaService, ConfigService],

})
export class AuthModule {}
