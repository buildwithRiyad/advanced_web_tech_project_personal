import {
  Controller, Post, Get, Put, Patch, Delete, Body, Param, Query,
  UseGuards, Request, UnauthorizedException
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  CreateProfileDto,
  UpdateProfileDto,
} from './dto/customer.dto';   // adjust path as needed
import { JwtAuthGuard } from '../admin/auth/jwt.guard';
import { AuthService } from '../admin/auth/auth.service';
import { Roles } from '../admin/auth/roles.decorator';
import { RolesGuard } from '../admin/auth/roles.guard';

@Controller('customer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly authService: AuthService,
  ) {}

  // ================= AUTH =================
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    // Reuse the same auth service but ensure it checks role = 'customer' if needed
    const token = await this.authService.login(body.email, body.password);
    // Optionally, verify that the user has role 'customer'
    return token;
  }

  // ================= ROOMS (static example) =================
  @Get('rooms')
  getRooms() {
    // Could also fetch from a Room entity if you have one
    return this.customerService.getAvailableRooms();
  }

  @Get('rooms/:id')
  getRoomById(@Param('id') id: string) {
    return this.customerService.getRoomById(+id);
  }


  // ================= BOOKINGS =================
  @UseGuards(JwtAuthGuard)
  @Post('bookings')
  createBooking(@Request() req, @Body() dto: CreateBookingDto) {
    const userId = req.user.id;
    return this.customerService.createBooking(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookings')
  getMyBookings(@Request() req) {
    return this.customerService.getBookingsByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookings/:id')
  getBookingById(@Request() req, @Param('id') id: string) {
    return this.customerService.getBookingById(+id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('bookings/:id')
  updateBooking(@Request() req, @Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.customerService.updateBooking(+id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('bookings/:id')
  cancelBooking(@Request() req, @Param('id') id: string) {
    return this.customerService.cancelBooking(+id, req.user.id);
  }

  // ================= PROFILE =================
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.customerService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.customerService.updateProfile(req.user.id, dto);
  }
}