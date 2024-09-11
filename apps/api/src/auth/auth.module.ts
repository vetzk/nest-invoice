import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerifyToken } from 'src/middleware/verifyToken';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    {
      //ini utk rate limiting yg ketika diklik berulang kali secara cepat supaya terhindar dari bug
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    //utk penggunaan middleware verify token
    consumer
      .apply(VerifyToken)
      .forRoutes(
        { path: 'auth/keep-login', method: RequestMethod.GET },
        { path: 'auth/verify', method: RequestMethod.PATCH },
        { path: 'auth/reset-password', method: RequestMethod.PATCH },
      );
  }
}
