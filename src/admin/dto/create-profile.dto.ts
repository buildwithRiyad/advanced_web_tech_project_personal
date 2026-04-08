import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';

export class CreateProfileDto {
  @IsNotEmpty()
  @Matches(/^01[3-9][0-9]{8}$/, { message: 'Phone must be a valid Bangladeshi number' })
  phone!: string;

  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;
}