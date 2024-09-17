import { Module, ValidationPipe } from "@nestjs/common";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SaleModule } from './sale/sale.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from "@nestjs/core";

@Module({
  imports: [SaleModule, AuthModule, ConfigModule.forRoot({
    isGlobal: true
  })],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }],
})
export class AppModule {}
