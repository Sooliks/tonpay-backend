import { ArrayMaxSize, IsArray, IsMongoId, IsOptional, IsString } from "class-validator";

export class CreateMessageDto {
    @IsMongoId()
    recipientId: string

    @IsMongoId()
    senderId: string

    @IsOptional()
    @IsString()
    message?: string

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(2, { message: 'You can upload up to 2 images.' })
    files?: Express.Multer.File[];
}