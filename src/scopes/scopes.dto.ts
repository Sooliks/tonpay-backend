import { IsMongoId, IsString } from "class-validator";
export class CreateScopeDto {
  @IsString()
  name: string
}
export class CreateSubScopeDto extends CreateScopeDto{
  @IsMongoId()
  scopeId: string
}