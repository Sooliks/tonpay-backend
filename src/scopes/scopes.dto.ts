import { IsBoolean, IsMongoId, IsString } from "class-validator";
export class CreateScopeDto {
  @IsString()
  name: string

  @IsString()
  type: 'pc_games' | 'mobile_games' | 'tg_mini_app_game' | 'social_network'
}
export class CreateSubScopeDto {
  @IsString()
  name: string

  @IsMongoId()
  scopeId: string

  @IsBoolean()
  isCurrency: boolean
}