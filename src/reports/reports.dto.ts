import { IsMongoId, IsString } from "class-validator";

export class CreateReportDto {
    @IsMongoId()
    orderId: string;

    @IsString()
    text: string
}