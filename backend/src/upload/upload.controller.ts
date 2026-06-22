import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as express from 'express';

@Controller('upload')
export class UploadController {
  @Post('single')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: express.Request,
  ) {
    if (!file) {
      throw new BadRequestException('File is empty');
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    return { url: fileUrl };
  }
}
