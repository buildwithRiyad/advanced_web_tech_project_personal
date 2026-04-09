import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin_pipe } from './pipes/admin_pipe.pipe';
import {TypeOrmModule} from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Booking } from './entities/booking.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports:[TypeOrmModule.forFeature([User,Profile,Booking]), AuthModule],
  controllers: [AdminController],
  providers: [AdminService, Admin_pipe],
})
export class AdminModule {}