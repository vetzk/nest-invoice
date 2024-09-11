import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ResetPassDto {
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @IsNotEmpty()
  confirmPassword: string;
}
