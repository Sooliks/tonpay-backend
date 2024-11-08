import { IsMongoId, IsNumber, IsOptional } from "class-validator";

export class CreateOrderDto {
    @IsOptional()
    @IsMongoId()
    userId?: string

    @IsMongoId()
    saleId: string

    @IsNumber()
    price: number
}

export class ConfirmOrderDto {
    @IsMongoId()
    orderId: string
}

export class CancelOrderDto extends ConfirmOrderDto {}