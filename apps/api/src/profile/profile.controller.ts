import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Next,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { NextFunction, Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as path from 'path';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @UseInterceptors(
    //utk upload image
    FileInterceptor('file', {
      //yg ditulis di bagian form utk field adalah file yg diatas
      storage: multer.diskStorage({
        destination: (req, file, callback) => {
          const fileDest = path.join(__dirname, '../../public/profile');
          callback(null, fileDest);
        },
        filename: (req, file, callback) => {
          const existName = file.originalname.split('.');
          const extension = existName[existName.length - 1];
          callback(null, `MEDIA${Date.now()}.${extension}`);
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProfileDto: CreateProfileDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.profileService.create(createProfileDto, req, res, next);
  }

  @Get()
  getUserProfile(@Res() res: Response, @Next() next: NextFunction) {
    return this.profileService.getUserProfile(res, next);
  }

  @Patch()
  @UseInterceptors(
    //utk upload image
    FileInterceptor('file', {
      //yg ditulis di bagian form utk field adalah file yg diatas
      storage: multer.diskStorage({
        destination: (req, file, callback) => {
          const fileDest = path.join(__dirname, '../../public/profile');
          callback(null, fileDest);
        },
        filename: (req, file, callback) => {
          const existName = file.originalname.split('.');
          const extension = existName[existName.length - 1];
          callback(null, `MEDIA${Date.now()}.${extension}`);
        },
      }),
    }),
  )
  update(
    @UploadedFile() file: Express.Multer.File,
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.profileService.update(updateProfileDto, req, res, next);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profileService.remove(+id);
  }
}
