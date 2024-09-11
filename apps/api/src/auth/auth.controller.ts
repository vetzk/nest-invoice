import { Controller, Get, Post, Body, Patch, Res, Next } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login-dto';
import { NextFunction, Response } from 'express';
import { ForgotPassDto } from './dto/forgot-pass.dto';
import { ResetPassDto } from './dto/reset-pass.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body() createAuthDto: CreateAuthDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.authService.register(createAuthDto, res, next);
  }

  @Patch('verify')
  verifyEmail(@Res() res: Response, @Next() next: NextFunction) {
    return this.authService.verifyEmail(res, next);
  }
  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.authService.login(loginDto, res, next);
  }

  @Get('keep-login')
  keepLogin(@Res() res: Response, @Next() next: NextFunction) {
    return this.authService.keepLogin(res, next);
  }

  @Post('forgot-password')
  forgotPassword(
    @Body() forgotPassDto: ForgotPassDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.authService.forgotPassword(forgotPassDto, res, next);
  }
  @Patch('reset-password')
  resetPassword(
    @Body() resetPassDto: ResetPassDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.authService.resetPassword(resetPassDto, res, next);
  }

  @Post('logout')
  logout(@Res() res: Response, @Next() next: NextFunction) {
    return this.authService.logout(res, next);
  }
}
