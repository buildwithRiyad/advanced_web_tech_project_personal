import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { Booking } from '../admin/entities/booking.entity';
import { Profile } from '../admin/entities/profile.entity';
import { User } from '../admin/entities/user.entity';
import { AuthModule } from '../admin/auth/auth.module'; // reuse JWT logic

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Profile, User]),
    AuthModule, // provides JwtAuthGuard and AuthService
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}