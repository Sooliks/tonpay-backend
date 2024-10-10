import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ScopesService } from './scopes.service';
import { Roles } from "../decorators/role.decorator";
import { Role } from "@prisma/client";
import { CreateScopeDto, CreateSubScopeDto } from "./scopes.dto";
import { PublicRoute } from "../decorators/public-route.decorator";


@Controller('scopes')
export class ScopesController {
  constructor(private readonly scopesService: ScopesService) {}
  @Post("create")
  @Roles(Role.ADMIN, Role.CREATOR)
  async createScope(@Body() dto: CreateScopeDto) {
    return this.scopesService.createScope(dto);
  }
  @Post("createsubscope")
  @Roles(Role.ADMIN, Role.CREATOR)
  async createSubScope(@Body() dto: CreateSubScopeDto) {
    return this.scopesService.createSubScope(dto);
  }
  @PublicRoute()
  @Get()
  async getScopes(@Query('type') type?: string){
    return this.scopesService.getScopes(type);
  }
}
