import { IsInt, IsMongoId, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateFeedbackDto {
  @IsMongoId()
  saleId: string

  @IsInt()
  @Max(5)
  @Min(1)
  rate: number

  @IsOptional()
  @IsString()
  text?:string
}