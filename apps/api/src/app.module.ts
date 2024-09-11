import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { PrismaService } from './prisma/prisma.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        ttl: 300,
        limit: 5,
      },
    ]),
    ProfileModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    AuthService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
