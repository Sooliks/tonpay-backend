import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString, Max,
  MaxLength,
  Min
} from "class-validator";
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
  @Min(1)
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
export class UpdateSaleDto {
  @IsMongoId()
  id: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0.05)
  @Max(1000)
  @IsOptional()
  price?: number

  @IsOptional()
  @IsArray()
  product?: string[]

  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(1)
  currency?: number

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

  @IsBoolean()
  isDecline: boolean
}

export class SetLastWatchingSaleIdDto {
  @IsMongoId()
  saleId: string
}

export class DeleteSaleForUserDto {
  @IsMongoId()
  id: string
}

