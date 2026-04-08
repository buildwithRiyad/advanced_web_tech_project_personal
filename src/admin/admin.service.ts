import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Booking } from './entities/booking.entity';
import { CreateUserDto, UpdateUserDto, AssignRoleDto } from './dto/admin.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,

    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  // ---------------- CREATE USER ----------------
  async create(dto: CreateUserDto, nidImage?: Express.Multer.File) {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException(`Email ${dto.email} already exists`);
    }

    const user = this.userRepo.create({
      ...dto,
      nidImage: nidImage?.filename,
    });

    try {
      return await this.userRepo.save(user);
    } catch (error) {
      if ((error as { code?: string } | undefined)?.code === '23505') {
        throw new ConflictException(`Email ${dto.email} already exists`);
      }

      throw error;
    }
  }

  // ---------------- GET ALL USERS ----------------
  async findAll(role?: string) {
    if (role) {
      return await this.userRepo.find({
        where: { role },
        relations: ['profile', 'bookings'],
      });
    }
    return await this.userRepo.find({
      relations: ['profile', 'bookings'],
    });
  }

  // ---------------- GET ONE USER ----------------
  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id: Number(id) },
      relations: ['profile', 'bookings'],
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  // ---------------- UPDATE USER ----------------
  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return await this.userRepo.save(user);
  }

  async assignRole(id: string, dto: AssignRoleDto) {
    const user = await this.findOne(id);
    user.role = dto.role;
    return await this.userRepo.save(user);
  }

  // ---------------- DELETE USER ----------------
  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);
    return { message: 'deleted' };
  }

  // ---------------- CREATE PROFILE (One-to-One, dynamic) ----------------
  async createProfile(id: string, dto: CreateProfileDto) {
    const user = await this.findOne(id);

    const existingProfile = await this.profileRepo.findOne({
      where: { user: { id: Number(id) } },
      relations: ['user'],
    });

    if (existingProfile) {
      throw new ConflictException(`Profile already exists for user ID ${id}`);
    }

    const profile = this.profileRepo.create({
      ...dto,
      user,
    });

    return await this.profileRepo.save(profile);
  }

  async getProfile(id: string) {
    const profile = await this.profileRepo.findOne({
      where: { user: { id: Number(id) } },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user ID ${id} not found`);
    }

    return profile;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const profile = await this.getProfile(id);
    Object.assign(profile, dto);
    return await this.profileRepo.save(profile);
  }

  async removeProfile(id: string) {
    const profile = await this.getProfile(id);
    await this.profileRepo.remove(profile);
    return { message: `Profile for user ID ${id} deleted` };
  }

  // ---------------- CREATE BOOKING (One-to-Many, dynamic) ----------------
  async createBooking(id: string, dto: CreateBookingDto) {
    const user = await this.findOne(id);

    const booking = this.bookingRepo.create({
      ...dto,
      user,
    });

    return await this.bookingRepo.save(booking);
  }

  async getBookings(id: string) {
    await this.findOne(id);

    return await this.bookingRepo.find({
      where: { user: { id: Number(id) } },
      relations: ['user'],
      order: { id: 'DESC' },
    });
  }

  async getBooking(id: string, bookingId: string) {
    await this.findOne(id);

    const booking = await this.bookingRepo.findOne({
      where: { id: Number(bookingId), user: { id: Number(id) } },
      relations: ['user'],
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking ID ${bookingId} not found for user ID ${id}`,
      );
    }

    return booking;
  }

  async updateBooking(id: string, bookingId: string, dto: UpdateBookingDto) {
    const booking = await this.getBooking(id, bookingId);
    Object.assign(booking, dto);
    return await this.bookingRepo.save(booking);
  }

  async removeBooking(id: string, bookingId: string) {
    const booking = await this.getBooking(id, bookingId);
    await this.bookingRepo.remove(booking);
    return { message: `Booking ID ${bookingId} deleted for user ID ${id}` };
  }

  // ---------------- LOGS ----------------
  logs() {
    return [];
  }

  // ---------------- BACKUP ----------------
  backup() {
    return { message: 'backup done' };
  }
}