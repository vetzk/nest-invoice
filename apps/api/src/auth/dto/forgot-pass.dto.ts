import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPassDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
