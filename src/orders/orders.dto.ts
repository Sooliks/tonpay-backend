import { IsMongoId, IsNumber, IsOptional, Min } from "class-validator";

export class CreateOrderDto {
    @IsOptional()
    @IsMongoId()
    userId?: string

    @IsMongoId()
    saleId: string

    @IsNumber()
    price: number

    @IsNumber()
    @Min(1)
    count: number
}
export class ConfirmOrderDto {
    @IsMongoId()
    orderId: string
}

export class CancelOrderDto extends ConfirmOrderDto {}