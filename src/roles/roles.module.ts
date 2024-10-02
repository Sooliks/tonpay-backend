import { Module } from '@nestjs/common';
import { APP_GUARD } from "@nestjs/core";
import { PrismaService } from "../prisma.service";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { RolesGuard } from "./roles.guard";


@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: process.env.JWT_CONSTANTS,
            signOptions: { expiresIn: "1h" },
        })
    ],
    controllers: [],
    providers: [{
        provide: APP_GUARD,
        useClass: RolesGuard,
    }, PrismaService, ConfigService],

})
export class RolesModule {}
