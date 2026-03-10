import { IsString, IsEmail, IsIn, IsNotEmpty, Matches, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @Matches(/^[A-Za-z\s]+$/, { message: 'Name must contain alphabets only' })
  name: string;




  @IsNotEmpty()
  @IsEmail({}, { message: 'Email must contain @' })
  @Matches(/\.xyz$/i, { message: 'Email domain must be .xyz' })
  email: string;




  @IsNotEmpty()
 @Matches(/^[A-Za-z0-9_@]{8,}$/, { 
  message: 'Password must be at least 8 characters and contain only letters, numbers, underscore (_) or @' })
  password: string;

  @IsIn(['manager', 'receptionist'])
  role: 'manager' | 'receptionist';

  @IsNotEmpty()
  @Matches(/^\d{13}$|^\d{17}$/, { message: 'iNVALID' })
  nidNumber: string;
}

export class UpdateUserDto {
  @IsOptional()
  @Matches(/^[A-Za-z\s]+$/, { message: 'Name must contain alphabets only' })
  name?: string;

  @IsOptional()
  @IsEmail()
  @Matches(/\.xyz$/i, { message: 'Email domain must be .xyz' })
  email?: string;

  @IsOptional()
  @Matches(/^[A-Za-z0-9_@]{8,}$/, { message: 'Password must be at least 8 characters and contain only letters (A-Z, a-z), numbers (0-9), underscore (_) or @' })
  password?: string;

  @IsOptional()
  @IsIn(['manager', 'receptionist'])
  role?: 'manager' | 'receptionist';

  @IsOptional()
  @Matches(/^\d{13}$|^\d{17}$/, { message: 'NID must be 13 or 17 digits' })
  nidNumber?: string;
}

export class AssignRoleDto {
  @IsNotEmpty()
  @IsIn(['manager', 'receptionist'])
  role: 'manager' | 'receptionist';
}