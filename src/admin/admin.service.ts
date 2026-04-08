import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Booking } from './entities/booking.entity';
import { CreateUserDto, UpdateUserDto, AssignRoleDto } from './dto/admin.dto';

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
    const user = this.userRepo.create({
      ...dto,
      nidImage: nidImage?.filename,
    });
    return await this.userRepo.save(user);
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

  // ---------------- ASSIGN ROLE ----------------
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

  // ---------------- CREATE PROFILE (One-to-One) ----------------
  async createProfile(id: string) {
    const user = await this.findOne(id);
    const profile = this.profileRepo.create({
      phone: '01700000000',
      address: 'Dhaka',
      user: user,
    });
    return await this.profileRepo.save(profile);
  }

  // ---------------- CREATE BOOKING (One-to-Many) ----------------
  async createBooking(id: string) {
    const user = await this.findOne(id);
    const booking = this.bookingRepo.create({
      roomNumber: '101',
      checkIn: '2026-04-10',
      checkOut: '2026-04-12',
      user: user,
    });
    return await this.bookingRepo.save(booking);
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