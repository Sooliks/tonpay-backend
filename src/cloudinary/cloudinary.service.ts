import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { ConfigService } from "@nestjs/config";
import { CloudinaryStorage } from "multer-storage-cloudinary";

@Injectable()
export class CloudinaryService {
    private storage: CloudinaryStorage;
    constructor(private readonly configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
        this.storage = new CloudinaryStorage({
            cloudinary,
            params: {
                folder: 'tonpay',
                format: async (req, file) => 'png', // Укажите формат изображений
                public_id: (req, file) => file.originalname.split('.')[0], // Имя файла
            } as any,
        });
    }
    getStorage() {
        return this.storage;
    }
    async uploadImage(file: Express.Multer.File, folderName: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: folderName },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            ).end(file.buffer);
        });
    }
    async deleteImage(publicId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
    }
}
