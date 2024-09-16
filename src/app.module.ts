import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SaleModule } from './sale/sale.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [SaleModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
