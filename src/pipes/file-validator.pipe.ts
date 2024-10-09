import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileValidatorPipe implements PipeTransform {
    transform(files: Express.Multer.File[], metadata: ArgumentMetadata) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded.');
        }
        files.forEach((file) => {
            if (!file.mimetype.startsWith('image/')) {
                throw new BadRequestException('Invalid file type. Only image files are allowed.');
            }
        });
        return files;
    }
}
