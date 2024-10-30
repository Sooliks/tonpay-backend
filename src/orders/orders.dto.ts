import { IsMongoId, IsOptional } from "class-validator";

export class CreateOrderDto {
    @IsOptional()
    @IsMongoId()
    userId?: string

    @IsMongoId()
    saleId: string
}

export class ConfirmOrderDto {
    @IsMongoId()
    orderId: string
}