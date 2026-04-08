import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @Matches(/^01[3-9][0-9]{8}$/, {
    message: 'Phone must be a valid Bangladeshi number',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
