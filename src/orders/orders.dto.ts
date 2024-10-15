import { IsMongoId } from "class-validator";

export class CreateOrderDto {
    @IsMongoId()
    userId: string

    @IsMongoId()
    saleId: string
}