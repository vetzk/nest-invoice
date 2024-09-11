import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

@Injectable()
export class VerifyToken implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.header('Authorization')?.split(' ')[1];
      console.log(token);

      if (!token) {
        throw {
          rc: 404,
          message: 'Token does not exist',
        };
      }

      const checkToken = verify(
        token,
        process.env.TOKEN_KEY || 'f9c320c6-176a-4937-b1fd-a0b529e1fa1d',
      );
      res.locals.decrypt = checkToken;
      next();
    } catch (error) {
      console.log(error);

      next({ success: false, message: 'Cannot verify your token', error });
    }
  }
}
