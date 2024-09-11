import { sign } from 'jsonwebtoken';

export const createToken = (data: any, expiresIn: string) => {
  return sign(
    data,
    process.env.TOKEN_KEY || 'f9c320c6-176a-4937-b1fd-a0b529e1fa1d',
    {
      expiresIn: expiresIn || '1h',
    },
  );
};
