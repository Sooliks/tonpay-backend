import { Module, ValidationPipe } from "@nestjs/common";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SaleModule } from './sale/sale.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { RolesGuard } from "./roles/roles.guard";
import { ScopesModule } from './scopes/scopes.module';
import { FeedbackModule } from './feedback/feedback.module';
import { TonModule } from './ton/ton.module';
import { RolesModule } from "./roles/roles.module";
import { PrismaService } from "./prisma.service";
import { StatsModule } from './stats/stats.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [SaleModule, AuthModule, ConfigModule.forRoot({
    isGlobal: true
  }), ScopesModule, FeedbackModule, TonModule, RolesModule, StatsModule, CloudinaryModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    PrismaService
  ]
})
export class AppModule {}
