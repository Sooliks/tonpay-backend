import { ArrayMaxSize, IsArray, IsMongoId, IsOptional, IsString } from "class-validator";

export class CreateMessageDto {
    @IsMongoId()
    recipientId: string

    @IsMongoId()
    senderId: string

    @IsString()
    message: string

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(3, { message: 'You can upload up to 3 images.' })
    files?: Express.Multer.File[];
}