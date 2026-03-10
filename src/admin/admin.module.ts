import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin_pipe } from './pipes/admin_pipe.pipe';

@Module({
  controllers: [AdminController],
  providers: [AdminService, Admin_pipe],
})
export class AdminModule {}