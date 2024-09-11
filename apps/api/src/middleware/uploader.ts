import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as multer from 'multer';
import * as path from 'path';

@Injectable()
export class UploaderService {
  private mainDir = path.join(__dirname, '../../public');

  public getMulterInstance(dirname: string | null, prefixName?: string) {
    const storage = multer.diskStorage({
      destination: (
        req: Request,
        file: Express.Multer.File,
        callback: (error: Error | null, destination: string) => void,
      ) => {
        const fileDest = dirname
          ? path.join(this.mainDir, dirname)
          : this.mainDir;
        callback(null, fileDest);
      },
      filename: (
        req: Request,
        file: Express.Multer.File,
        callback: (error: Error | null, destination: string) => void,
      ) => {
        const existName = file.originalname.split('.');
        const extension = existName[existName.length - 1];
        callback(null, `${prefixName || 'MEDIA'}${Date.now()}.${extension}`);
      },
    });

    const fileFilter = (
      req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      const allowedTypes = /jpeg|jpg|png/;
      const extName = allowedTypes.test(
        path.extname(file.originalname).toLowerCase(),
      );
      const mimeType = allowedTypes.test(file.mimetype);

      if (extName && mimeType) {
        callback(null, true);
      } else {
        callback(
          new Error('Only .jpg, .jpeg, and .png files are allowed'),
          false,
        );
      }
    };

    return multer({
      storage,
      limits: { fileSize: 1 * 1024 * 1024 }, // 1MB file size limit
      fileFilter,
    });
  }
}
