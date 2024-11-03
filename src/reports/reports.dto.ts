import { IsMongoId, IsString } from "class-validator";

export class CreateReportDto {
    @IsMongoId()
    orderId: string;

    @IsString()
    text: string
}

export class TakeReportDto {
    @IsMongoId()
    reportId: string;
}

export class ConfirmReportDto extends TakeReportDto {}