import { Injectable } from '@nestjs/common';
import { CreateScopeDto, CreateSubScopeDto } from "./scopes.dto";
import { PrismaService } from "../prisma.service";

@Injectable()
export class ScopesService {
  constructor(private readonly prisma: PrismaService) {}
  async createScope(scopeDto: CreateScopeDto) {
    return this.prisma.scope.create({
      data: {
        name: scopeDto.name,
        type: scopeDto.type
      }
    })
  }
  async createSubScope(scopeDto: CreateSubScopeDto) {
    return this.prisma.subScope.create({
      data: {
        name: scopeDto.name,
        scopeId: scopeDto.scopeId
      }
    })
  }
}
