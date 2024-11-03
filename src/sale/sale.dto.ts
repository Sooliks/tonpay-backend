import { ArrayMaxSize, IsArray, IsMongoId, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";
import { Transform } from "class-transformer";
export class CreateSaleDto {
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0.05)
  price: number

  @IsOptional()
  @IsArray()
  product?: string[]

  @IsString()
  title: string

  @IsString()
  @MaxLength(500)
  description: string

  @IsMongoId()
  subScopeId: string

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0.05)
  currency?: number

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3, { message: 'You can upload up to 3 images.' })
  files?: Express.Multer.File[];

  @IsOptional()
  @IsString()
  @MaxLength(300)
  autoMessage?: string;
}

export class DeleteSaleForAdminDto {
  @IsMongoId()
  id: string

  @IsOptional()
  @IsString()
  reason?: string
}

export class SetLastWatchingSaleIdDto {
  @IsMongoId()
  saleId: string
}

