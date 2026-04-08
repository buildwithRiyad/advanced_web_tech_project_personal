import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateBookingDto {
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @IsOptional()
  @IsDateString({}, { message: 'checkIn must be a valid date string' })
  checkIn?: string;

  @IsOptional()
  @IsDateString({}, { message: 'checkOut must be a valid date string' })
  checkOut?: string;

  @IsOptional()
  @IsString()
  roomType?: string;
}
