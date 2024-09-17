import { IsArray, IsInt, IsMongoId, IsNumber, IsString } from "class-validator";

export class CreateSaleDto {
  @IsNumber()
  price: number

  @IsInt()
  count?: number

  @IsArray()
  product: string[]

  @IsString()
  title: string

  @IsString()
  description: string

  @IsMongoId()
  scopeId: string

  @IsMongoId()
  subScopeId: string
}