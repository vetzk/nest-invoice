import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerifyToken } from 'src/middleware/verifyToken';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService],
})
export class ProfileModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyToken)
      .forRoutes(
        { path: 'profile', method: RequestMethod.POST },
        { path: 'profile', method: RequestMethod.GET },
        { path: 'profile', method: RequestMethod.PATCH },
      );
  }
}
