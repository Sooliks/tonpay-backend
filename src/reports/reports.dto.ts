import { IsMongoId, IsString, Length, MaxLength } from "class-validator";

export class CreateReportDto {
    @IsMongoId()
    orderId: string;

    @IsString()
    @MaxLength(200)
    text: string
}

export class TakeReportDto {
    @IsMongoId()
    reportId: string;
}

export class ConfirmReportDto extends TakeReportDto {}
export class GetChatReportDto extends TakeReportDto {}