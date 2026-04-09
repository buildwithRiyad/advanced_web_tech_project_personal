import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
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
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
  ) {}

  // ------------- UTILITY -------------
  private parseIdOrThrow(value: string, field: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0)
      throw new BadRequestException(`${field} must be positive integer`);
    return id;
  }

  // ------------- USERS -------------
  /** Create user w/ hashed password & optional NID image */
  async create(dto: CreateUserDto, nidImage?: Express.Multer.File) {
    if (await this.userRepo.findOne({ where: { email: dto.email } }))
      throw new ConflictException(`Email ${dto.email} exists`);

    const user = this.userRepo.create({
      ...dto,
      password: await bcrypt.hash(dto.password, 10),
      nidImage: nidImage?.filename,
    });
    return this.userRepo.save(user);
  }

  /** Get all users, optional role filter */
  async findAll(role?: string) {
    return this.userRepo.find({
      where: role ? { role } : {},
      relations: ['profile', 'bookings'],
    });
  }

  /** Get single user by ID */
  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id: this.parseIdOrThrow(id, 'id') },
      relations: ['profile', 'bookings'],
    });
    if (!user) throw new NotFoundException(`User ID ${id} not found`);
    return user;
  }

  /** Update user, hash password if present */
  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  /** Assign role to user */
  async assignRole(id: string, dto: AssignRoleDto) {
    const user = await this.findOne(id);
    user.role = dto.role;
    return this.userRepo.save(user);
  }

  /** Delete user */
  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);
    return { message: 'deleted' };
  }

  // ------------- PROFILE (One-to-One) -------------
  /** Create profile for user */
  async createProfile(id: string, dto: CreateProfileDto) {
    const user = await this.findOne(id);
    if (await this.profileRepo.findOne({ where: { user: { id: user.id } } }))
      throw new ConflictException(`Profile exists for user ID ${id}`);
    return this.profileRepo.save(this.profileRepo.create({ ...dto, user }));
  }

  /** Get profile */
  async getProfile(id: string) {
    const profile = await this.profileRepo.findOne({
      where: { user: { id: this.parseIdOrThrow(id, 'id') } },
      relations: ['user'],
    });
    if (!profile) throw new NotFoundException(`Profile for user ID ${id} not found`);
    return profile;
  }

  /** Update profile */
  async updateProfile(id: string, dto: UpdateProfileDto) {
    const profile = await this.getProfile(id);
    Object.assign(profile, dto);
    return this.profileRepo.save(profile);
  }

  /** Delete profile */
  async removeProfile(id: string) {
    const profile = await this.getProfile(id);
    await this.profileRepo.remove(profile);
    return { message: `Profile for user ID ${id} deleted` };
  }

  // ------------- BOOKINGS (One-to-Many) -------------
  /** Create booking */
  async createBooking(id: string, dto: CreateBookingDto) {
    const user = await this.findOne(id);
    return this.bookingRepo.save(this.bookingRepo.create({ ...dto, user }));
  }

  /** Get all bookings for a user */
  async getBookings(id: string) {
    await this.findOne(id);
    return this.bookingRepo.find({
      where: { user: { id: this.parseIdOrThrow(id, 'id') } },
      relations: ['user'],
      order: { id: 'DESC' },
    });
  }

  /** Get single booking */
  async getBooking(id: string, bookingId: string) {
    const booking = await this.bookingRepo.findOne({
      where: {
        id: this.parseIdOrThrow(bookingId, 'bookingId'),
        user: { id: this.parseIdOrThrow(id, 'id') },
      },
      relations: ['user'],
    });
    if (!booking)
      throw new NotFoundException(`Booking ID ${bookingId} not found for user ID ${id}`);
    return booking;
  }

  /** Update booking */
  async updateBooking(id: string, bookingId: string, dto: UpdateBookingDto) {
    const booking = await this.getBooking(id, bookingId);
    Object.assign(booking, dto);
    return this.bookingRepo.save(booking);
  }

  /** Delete booking */
  async removeBooking(id: string, bookingId: string) {
    const booking = await this.getBooking(id, bookingId);
    await this.bookingRepo.remove(booking);
    return { message: `Booking ID ${bookingId} deleted for user ID ${id}` };
  }

  // ------------- LOGS / BACKUP -------------
  logs() {
    return []; // temporary
  }

  backup() {
    return { message: 'backup done' };
  }
}