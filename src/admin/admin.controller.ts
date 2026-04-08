import { Controller, Post, Get, Put, Patch, Delete, Body, Param, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { AdminService } from './admin.service';
import { CreateUserDto, UpdateUserDto, AssignRoleDto } from './dto/admin.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Admin_pipe } from './pipes/admin_pipe.pipe';


@Controller('admin') 
export class AdminController {
  constructor(private readonly adminService: AdminService) {}


  @Post(':id/profile')
createProfile(@Param('id') id: string, @Body(Admin_pipe) dto: CreateProfileDto) {
return this.adminService.createProfile(id, dto)
}

  @Get(':id/profile')
getProfile(@Param('id') id: string) {
return this.adminService.getProfile(id)
}

  @Put(':id/profile')
updateProfile(@Param('id') id: string, @Body(Admin_pipe) dto: UpdateProfileDto) {
return this.adminService.updateProfile(id, dto)
}

  @Delete(':id/profile')
removeProfile(@Param('id') id: string) {
return this.adminService.removeProfile(id)
}


@Post(':id/bookings')
createBooking(@Param('id') id: string, @Body(Admin_pipe) dto: CreateBookingDto) {
return this.adminService.createBooking(id, dto)
}


@Get(':id/bookings')
getBookings(@Param('id') id: string) {
return this.adminService.getBookings(id)
}

@Get(':id/bookings/:bookingId')
getBooking(@Param('id') id: string, @Param('bookingId') bookingId: string) {
return this.adminService.getBooking(id, bookingId)
}

@Put(':id/bookings/:bookingId')
updateBooking(
  @Param('id') id: string,
  @Param('bookingId') bookingId: string,
  @Body(Admin_pipe) dto: UpdateBookingDto,
) {
return this.adminService.updateBooking(id, bookingId, dto)
}

@Delete(':id/bookings/:bookingId')
removeBooking(@Param('id') id: string, @Param('bookingId') bookingId: string) {
return this.adminService.removeBooking(id, bookingId)
}

 @Post()
@UseInterceptors(FileInterceptor('nidImage', {
  storage: diskStorage({
    destination: join(process.cwd(), 'uploads/nid'),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = file.originalname.split('.').pop();
      cb(null, `nid-${uniqueSuffix}.${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter: (_req, file, cb) => {
    ['image/jpeg', 'image/png'].includes(file.mimetype)
      ? cb(null, true)
      : cb(new BadRequestException('Only JPEG/PNG allowed'), false);
  },
}))
create(@Body(Admin_pipe) dto: CreateUserDto, @UploadedFile() nidImage?: Express.Multer.File) {
  return this.adminService.create(dto, nidImage);
}

  
  @Get()
  findAll(@Query('role') role: string) {
    return this.adminService.findAll(role);
  }

  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  
  @Put(':id')
  update(@Param('id') id: string, @Body(Admin_pipe) dto: UpdateUserDto) {
    return this.adminService.update(id, dto);
  }


  @Patch(':id/role')
  assignRole(@Param('id') id: string, @Body(Admin_pipe) dto: AssignRoleDto) {
    return this.adminService.assignRole(id, dto);
  }

  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }

  
  @Get('logs/all')
  logs() {
    return this.adminService.logs();
  }


  @Post('backup')
  backup() {
    return this.adminService.backup();
  }
}