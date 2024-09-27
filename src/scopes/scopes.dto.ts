import { IsEnum, IsMongoId, IsString } from "class-validator";
import { ScopeType } from "@prisma/client";
export class CreateScopeDto {
  @IsString()
  name: string

  @IsEnum(ScopeType)
  type: ScopeType
}
export class CreateSubScopeDto {
  @IsString()
  name: string

  @IsMongoId()
  scopeId: string
}