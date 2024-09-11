import { Injectable, Next, Req, Res } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NextFunction, Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}
  async create(
    createProfileDto: CreateProfileDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const { firstName, lastName, companyName, address, phone } =
      createProfileDto;

    try {
      const findUser = await this.prisma.user.findUnique({
        where: {
          identificationId: res.locals.decrypt.identificationId,
        },
      });

      if (!findUser) {
        return res.status(404).send({
          success: false,
          message: 'User not found',
        });
      }

      const createProfile = await this.prisma.userprofile.create({
        data: {
          userId: findUser.id,
          address,
          firstName,
          lastName,
          companyName,
          profilePicture: `/assets/profile/${req.file.filename}`,
          phone,
          isCreated: true,
        },
      });

      return res.status(200).send({
        success: true,
        message: 'Create profile success',
        result: createProfile,
      });
    } catch (error) {
      console.log(error);
      next({ success: false, message: 'Cannot create your profile', error });
    }
  }

  async getUserProfile(@Res() res: Response, @Next() next: NextFunction) {
    try {
      const findUser = await this.prisma.user.findUnique({
        where: {
          identificationId: res.locals.decrypt.identificationId,
        },
      });

      const findProfile = await this.prisma.userprofile.findFirst({
        where: {
          userId: findUser?.id,
        },
      });

      if (!findProfile) {
        return res.status(404).send({
          success: false,
          message: 'Profile not found',
        });
      }

      return res.status(200).send({
        success: true,
        message: 'Profile found',
        result: findProfile,
      });
    } catch (error) {
      console.log(error);
      next({ success: false, message: 'Cannot get profile', error });
    }
  }

  async update(
    updateProfileDto: UpdateProfileDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const { firstName, lastName, companyName, address, phone } =
      updateProfileDto;

    try {
      const findUser = await this.prisma.user.findUnique({
        where: {
          identificationId: res.locals.decrypt.identificationId,
        },
      });

      if (!findUser) {
        return res.status(404).send({
          success: false,
          message: 'Token or user cannot be found',
        });
      }

      const findProfile = await this.prisma.userprofile.findFirst({
        where: {
          userId: findUser.id,
        },
      });

      if (findProfile.profilePicture) {
        const oldImagePath = path.join(
          __dirname,
          '../../public',
          findProfile.profilePicture,
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      const updatedProfile = await this.prisma.userprofile.update({
        data: {
          address: address ? address : findProfile.address,
          firstName: firstName ? firstName : findProfile.firstName,
          lastName: lastName ? lastName : findProfile.lastName,
          phone: phone ? phone : findProfile.phone,
          companyName: companyName ? companyName : findProfile.companyName,
          profilePicture: req.file
            ? `/assets/profile/${req.file.filename}`
            : findProfile.profilePicture,
        },
        where: {
          id: findProfile.id,
        },
      });

      return res.status(200).send({
        success: false,
        message: 'Update profile success',
        result: updatedProfile,
      });
    } catch (error) {
      console.log(error);
      next({ success: false, message: 'Cannot update profile', error });
    }
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
