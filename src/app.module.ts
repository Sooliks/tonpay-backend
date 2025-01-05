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
import { OrdersModule } from './orders/orders.module';
import { ProfileModule } from './profile/profile.module';
import { MoneyModule } from './money/money.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { ChatModule } from './chat/chat.module';
import { ChatSocketModule } from './chat-socket/chat-socket.module';
import { ReportsModule } from './reports/reports.module';
import { TasksModule } from './tasks/tasks.module';
import { ReferralsModule } from './referrals/referrals.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [SaleModule, AuthModule, ConfigModule.forRoot({
    isGlobal: true
  }), ScopesModule, FeedbackModule, TonModule, RolesModule, StatsModule, CloudinaryModule, OrdersModule, ProfileModule, MoneyModule, NotificationsModule, TelegramBotModule, ChatModule, ChatSocketModule, ReportsModule, TasksModule, ReferralsModule, SettingsModule],
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
