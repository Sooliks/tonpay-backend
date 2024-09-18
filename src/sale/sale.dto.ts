import { IsArray, IsInt, IsMongoId, IsNumber, IsString, Min } from "class-validator";

export class CreateSaleDto {
  @Min(0.25)
  @IsNumber()
  price: number

  @Min(1)
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

export type UpdateSaleDto = Partial<CreateSaleDto>;