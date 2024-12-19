import { IsMongoId, IsString } from "class-validator";

export class TonMongoIdDto {
    @IsMongoId()
    @IsString()
    userId: string;
}