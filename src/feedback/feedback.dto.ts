import { IsInt, IsMongoId, IsString, Max, Min } from "class-validator";

export class CreateFeedbackDto {
  @IsMongoId()
  saleId: string

  @IsInt()
  @Max(10)
  @Min(1)
  rate: number

  @IsString()
  text?:string
}