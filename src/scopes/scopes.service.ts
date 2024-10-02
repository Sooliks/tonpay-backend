import { Injectable } from '@nestjs/common';
import { CreateScopeDto, CreateSubScopeDto } from "./scopes.dto";
import { PrismaService } from "../prisma.service";
import { ScopeType } from "@prisma/client";

@Injectable()
export class ScopesService {
  constructor(private readonly prisma: PrismaService) {}
  async createScope(scopeDto: CreateScopeDto) {
    return this.prisma.scope.create({
      data: {
        name: scopeDto.name,
        type: ScopeType[scopeDto.type]
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
  async getScopes(){
    return this.prisma.scope.findMany({
      include: {
        subScopes: true
      }
    })
  }
}
