import { Module } from '@nestjs/common';
import { ScopesService } from './scopes.service';
import { ScopesController } from './scopes.controller';
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [ScopesController],
  providers: [ScopesService, PrismaService],
})
export class ScopesModule {}
