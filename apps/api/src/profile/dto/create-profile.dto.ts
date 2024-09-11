import { IsNotEmpty } from 'class-validator';

export class CreateProfileDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  companyName: string;

  profilePicture: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  phone: string;
}
