import { IsMongoId, IsString } from "class-validator";

export class CreateMessageDto {
    @IsMongoId()
    recipientId: string

    @IsString()
    message: string
}