import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minUppercase: 1,
    minSymbols: 1,
  })
  password: string;
}
