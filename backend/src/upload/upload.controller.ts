import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { editFileName, fileFilter } from 'src/helper/file-upload.utils';
import { UserRole } from 'src/users/schema/user.schema';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: fileFilter,
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'Fayl muvaffaqiyatli yuklandi',
      filename: file.filename,
      path: `/uploads/${file.filename}`,
    };
  }

  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: fileFilter,
    }),
  )
  uploadMultipleFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    const response: any[] = [];

    files.forEach((file) => {
      const fileReponse = {
        originalname: file.originalname,
        filename: file.filename,
        path: `/uploads/${file.filename}`,
      };

      response.push(fileReponse);
    });

    return response;
  }
}
