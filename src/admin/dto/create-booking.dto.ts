import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  roomNumber!: string;

  @IsNotEmpty()
  @IsDateString({}, { message: 'checkIn must be a valid date string' })
  checkIn!: string;

  @IsNotEmpty()
  @IsDateString({}, { message: 'checkOut must be a valid date string' })
  checkOut!: string;

  @IsOptional()
  @IsString()
  roomType?: string;
}