import { IsArray, IsInt, IsMongoId, IsNumber, IsString, Min } from "class-validator";
import { ParseFloatPipe } from "@nestjs/common";
import { Transform, Type } from "class-transformer";

export class CreateSaleDto {
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0.05)
  price: number

  @IsArray()
  product: string[]

  @IsString()
  title: string

  @IsString()
  description: string

  @IsMongoId()
  subScopeId: string
}

export type UpdateSaleDto = Partial<CreateSaleDto>;