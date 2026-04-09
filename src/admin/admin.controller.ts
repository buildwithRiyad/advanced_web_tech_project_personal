import { 
  Controller, Post, Get, Put, Patch, Delete, Body, Param, Query, 
  UseInterceptors, UploadedFile, BadRequestException, UseGuards 
} from '@nestjs/common';
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
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt.guard';

@Controller('admin') 
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
  ) {}

  // ================= PROFILE ROUTES =================
  @Post(':id/profile') // POST /admin/:id/profile → create profile for user
  createProfile(@Param('id') id: string, @Body(Admin_pipe) dto: CreateProfileDto) {
    return this.adminService.createProfile(id, dto);
  }

  @Get(':id/profile') // GET /admin/:id/profile → get profile of user
  getProfile(@Param('id') id: string) {
    return this.adminService.getProfile(id);
  }

  @Put(':id/profile') // PUT /admin/:id/profile → update profile of user
  updateProfile(@Param('id') id: string, @Body(Admin_pipe) dto: UpdateProfileDto) {
    return this.adminService.updateProfile(id, dto);
  }

  @Delete(':id/profile') // DELETE /admin/:id/profile → delete profile of user
  removeProfile(@Param('id') id: string) {
    return this.adminService.removeProfile(id);
  }

  // ================= BOOKING ROUTES =================
  @Post(':id/bookings') // POST /admin/:id/bookings → create booking for user
  createBooking(@Param('id') id: string, @Body(Admin_pipe) dto: CreateBookingDto) {
    return this.adminService.createBooking(id, dto);
  }

  @Get(':id/bookings') // GET /admin/:id/bookings → get all bookings of user
  getBookings(@Param('id') id: string) {
    return this.adminService.getBookings(id);
  }

  @Get(':id/bookings/:bookingId') // GET /admin/:id/bookings/:bookingId → get single booking
  getBooking(@Param('id') id: string, @Param('bookingId') bookingId: string) {
    return this.adminService.getBooking(id, bookingId);
  }

  @Put(':id/bookings/:bookingId') // PUT /admin/:id/bookings/:bookingId → update booking
  updateBooking(
    @Param('id') id: string,
    @Param('bookingId') bookingId: string,
    @Body(Admin_pipe) dto: UpdateBookingDto,
  ) {
    return this.adminService.updateBooking(id, bookingId, dto);
  }

  @Delete(':id/bookings/:bookingId') // DELETE /admin/:id/bookings/:bookingId → remove booking
  removeBooking(@Param('id') id: string, @Param('bookingId') bookingId: string) {
    return this.adminService.removeBooking(id, bookingId);
  }

  // ================= USER ROUTES =================
  @Post() // POST /admin → create user with optional NID image
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

  @Get() // GET /admin → get all users (optional role filter)
  findAll(@Query('role') role: string) {
    return this.adminService.findAll(role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all') // GET /admin/all → protected route, get all users
  findAllProtected() {
    return this.adminService.findAll();
  }

  @Get(':id') // GET /admin/:id → get user by id
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Put(':id') // PUT /admin/:id → update user by id
  update(@Param('id') id: string, @Body(Admin_pipe) dto: UpdateUserDto) {
    return this.adminService.update(id, dto);
  }

  @Patch(':id/role') // PATCH /admin/:id/role → assign role to user
  assignRole(@Param('id') id: string, @Body(Admin_pipe) dto: AssignRoleDto) {
    return this.adminService.assignRole(id, dto);
  }

  @Delete(':id') // DELETE /admin/:id → remove user
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }

  // ================= LOGS & OTHER ROUTES =================
  @Get('logs/all') // GET /admin/logs/all → get all logs
  logs() {
    return this.adminService.logs();
  }

  @Post('login') // POST /admin/login → login route, returns JWT
  login(@Body() body: { email: string, password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('backup') // POST /admin/backup → backup database
  backup() {
    return this.adminService.backup();
  }
}