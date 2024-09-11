import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create-profile.dto';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
/*
The UpdateProfileDto class will have the same fields as CreateProfileDto
but all of these fields will be optional. */
