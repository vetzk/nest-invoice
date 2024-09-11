import { Injectable, Next, Res } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuid } from 'uuid';
import { hashPassword } from 'src/utils/hash';
import { createToken } from 'src/utils/jwt';
import { LoginDto } from './dto/login-dto';
import { compareSync } from 'bcrypt';
import { NextFunction, Response } from 'express';
import { ForgotPassDto } from './dto/forgot-pass.dto';
import { sendEmail } from 'src/utils/emailResetPass';
import { ResetPassDto } from './dto/reset-pass.dto';
import { sendEmailVerify } from 'src/utils/verifyEmail';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async register(
    createAuthDto: CreateAuthDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const { email, username, password, confirmPassword } = createAuthDto;
    try {
      const findEmailExist = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (findEmailExist) {
        return res.status(401).send({
          success: false,
          message: 'Email already exists',
        });
      }

      const findUsername = await this.prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (findUsername) {
        return res.status(401).send({
          success: false,
          message: 'Username already exists',
        });
      }

      if (password !== confirmPassword) {
        return res.status(401).send({
          success: false,
          message: "Password doesn't match",
        });
      }

      const idCode = 'USER-' + uuid();

      const user = this.prisma.user.create({
        data: {
          email,
          username,
          password: await hashPassword(password),
          identificationId: idCode,
        },
      });

      console.log(user);

      const token = createToken(
        {
          identificationId: (await user).identificationId,
          email: (await user).email,
        },
        '24h',
      );

      await sendEmailVerify((await user).email, 'Verify Email', null, {
        email: (await user).email,
        token,
      });

      return res.status(200).send({
        success: true,
        message: 'Success create account. Please verify your email',
        result: { token, identificationId: (await user).identificationId },
      });
    } catch (error) {
      console.log(error);
      next({ success: false, message: 'Cannot register', error });
    }
  }

  async verifyEmail(@Res() res: Response, @Next() next: NextFunction) {
    try {
      await this.prisma.user.update({
        where: {
          identificationId: res.locals.decrypt.identificationId,
        },
        data: {
          isVerified: true,
        },
      });

      return res.status(200).send({
        success: true,
        message: 'Your email has been verified',
      });
    } catch (error) {
      console.log(error);
      next({ success: false, message: 'Cannot verify email', error });
    }
  }
  async login(
    loginDto: LoginDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const { username, password } = loginDto;

    const BLOCK_TIME = 5 * 60 * 1000;
    try {
      const findUser = await this.prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (!findUser) {
        return res.status(404).send({
          success: false,
          message: "Username doesn't exist",
        });
      }

      const currentTime = new Date().getTime();
      const lastLoginAttemptTime = new Date(
        findUser.lastLoginAttempt,
      ).getTime();

      console.log(
        findUser.isBlocked && currentTime - lastLoginAttemptTime >= BLOCK_TIME,
      );
      if (
        findUser.isBlocked &&
        currentTime - lastLoginAttemptTime >= BLOCK_TIME
      ) {
        const updatedTime = await this.prisma.user.update({
          where: {
            username,
          },
          data: {
            loginAttempt: 0,
            isBlocked: false,
          },
        });
        console.log(updatedTime);

        findUser.isBlocked = false;
        findUser.loginAttempt = 0;
      }

      if (findUser.isBlocked) {
        if (currentTime - lastLoginAttemptTime < BLOCK_TIME) {
          const timeLeftUntilLogin =
            BLOCK_TIME - (currentTime - lastLoginAttemptTime);
          const timeInMinutes = Math.ceil(timeLeftUntilLogin / (60 * 1000));
          return res.status(403).send({
            success: false,
            message: `Too many login attempts. Try again in ${timeInMinutes} minutes`,
          });
        }
      }

      const comparePassword = compareSync(password, findUser.password);
      if (!comparePassword) {
        const userLoginAttempt = await this.prisma.user.update({
          where: {
            username,
          },
          data: {
            loginAttempt: findUser.loginAttempt + 1,
            lastLoginAttempt: new Date(),
          },
        });

        if (findUser.loginAttempt >= 5) {
          await this.prisma.user.update({
            where: {
              username,
            },
            data: {
              isBlocked: true,
              lastLoginAttempt: new Date(),
            },
          });

          return res.status(403).send({
            success: false,
            message:
              'Too many login attempts. You can try again after 5 minutes',
          });
        }
        return res.status(401).send({
          success: false,
          message: 'Wrong password',
          result: userLoginAttempt,
        });
      }

      await this.prisma.user.update({
        where: {
          username,
        },
        data: {
          loginAttempt: 0,
          lastLoginAttempt: new Date(),
          isBlocked: false,
        },
      });
      const token = createToken(
        {
          identificationId: findUser.identificationId,
          email: findUser.email,
        },
        '24h',
      );
      const findProfile = await this.prisma.userprofile.findFirst({
        where: {
          userId: findUser.id,
        },
      });

      return res.status(200).send({
        success: true,
        result: {
          identificationId: findUser.identificationId,
          profilePicture: findProfile?.profilePicture,
          token,
        },
      });
    } catch (error) {
      console.log(error);
      next({ success: false, message: 'Failed to login', error });
    }
  }

  async keepLogin(@Res() res: Response, @Next() next: NextFunction) {
    console.log(res.locals.decrypt);

    try {
      const findUser = await this.prisma.user.findUnique({
        where: {
          identificationId: res.locals.decrypt.identificationId,
        },
      });

      console.log(findUser);

      if (!findUser) {
        return res.status(404).send({
          success: false,
          message: 'Cannot find user',
        });
      }

      // const findProfile = await this.prisma.userprofile.findFirst({
      //   where: {
      //     userId: findUser.id,
      //   },
      // });

      // console.log(findProfile);

      // if (!findProfile) {
      //   return res.status(404).send({
      //     success: false,
      //     message: 'Cannot find user profile',
      //   });
      // }

      const token = createToken(
        {
          identificationId: findUser.identificationId,
          email: findUser.email,
        },
        '24h',
      );

      return res.status(200).send({
        success: true,
        result: {
          identificationId: findUser.identificationId,
          // profilePicture: findProfile.profilePicture,
          token,
        },
      });
    } catch (error) {
      console.log(error);
      next({ success: false, message: 'Cannot login', error });
    }
  }

  async forgotPassword(
    forgotPassDto: ForgotPassDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const { email } = forgotPassDto;
    try {
      const findEmail = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!findEmail) {
        return res.status(404).send({
          success: false,
          message: "Email doesn't exist",
        });
      }

      const token = createToken(
        {
          email: findEmail.email,
          identificationId: findEmail.identificationId,
          username: findEmail.username,
        },
        '20m',
      );

      await sendEmail(findEmail.email, 'Password Reset', null, {
        email: findEmail.email,
        token,
      });

      return res.status(200).send({
        success: true,
        message: 'Account exist. Please reset your password',
        result: { token },
      });
    } catch (error) {
      console.log(error);
      next({ success: false, message: 'Cannot do the forgot password method' });
    }
  }

  async resetPassword(
    resetPassDto: ResetPassDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const { password, confirmPassword } = resetPassDto;
    try {
      if (password !== confirmPassword) {
        return res.status(401).send({
          success: false,
          message: "Password doesn't match",
        });
      }

      await this.prisma.user.update({
        data: {
          password: await hashPassword(password),
        },
        where: {
          identificationId: res.locals.decrypt.identificationId,
        },
      });

      return res.status(200).send({
        success: true,
        message: 'Reset password success',
      });
    } catch (error) {
      console.log(error);
      next({ success: false, message: 'Cannot reset your password', error });
    }
  }

  async logout(@Res() res: Response, @Next() next: NextFunction) {
    try {
      return res.status(200).send({
        success: true,
        message: 'Logout success',
      });
    } catch (error) {
      console.log(error);
      next({
        success: false,
        message: 'Cannot logout',
      });
    }
  }
}
