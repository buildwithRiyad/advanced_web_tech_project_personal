// src/customer/customer.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../admin/entities/user.entity';
import { Booking } from '../admin/entities/booking.entity';
import { Profile } from '../admin/entities/profile.entity';
import { CreateBookingDto } from '../admin/dto/create-booking.dto';
import { UpdateBookingDto } from '../admin/dto/update-booking.dto';
import { UpdateProfileDto } from '../admin/dto/update-profile.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
  ) {}

 

  getAvailableRooms() {
    return [
      { id: 1, roomNumber: '101', roomType: 'Standard', available: true },
      { id: 2, roomNumber: '201', roomType: 'Deluxe', available: true },
      { id: 3, roomNumber: '301', roomType: 'Suite', available: true },
    ];
  }

  getRoomById(id: number) {
    const room = this.getAvailableRooms().find((r) => r.id === id);
    if (!room) throw new NotFoundException(`Room ${id} not found`);
    return room;
  }

  async createBooking(userId: number, dto: CreateBookingDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const booking = this.bookingRepo.create({
      roomNumber: dto.roomNumber,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      user,
    });

    return this.bookingRepo.save(booking);
  }

  async getBookingsByUser(userId: number) {
    return this.bookingRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { id: 'DESC' },
    });
  }

  async getBookingById(id: number, userId: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return booking;
  }

  async updateBooking(id: number, userId: number, dto: UpdateBookingDto) {
    const booking = await this.getBookingById(id, userId);

    if (dto.roomNumber !== undefined) booking.roomNumber = dto.roomNumber;
    if (dto.checkIn !== undefined) booking.checkIn = dto.checkIn;
    if (dto.checkOut !== undefined) booking.checkOut = dto.checkOut;

    return this.bookingRepo.save(booking);
  }

  async cancelBooking(id: number, userId: number) {
    const booking = await this.getBookingById(id, userId);
    await this.bookingRepo.remove(booking);
    return { message: 'Booking cancelled' };
  }

  async getProfile(userId: number) {
    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) {
      profile = this.profileRepo.create({
        phone: dto.phone ?? '',
        address: dto.address ?? '',
        user,
      });
      return this.profileRepo.save(profile);
    }

    if (dto.phone !== undefined) profile.phone = dto.phone;
    if (dto.address !== undefined) profile.address = dto.address;

    return this.profileRepo.save(profile);
  }
}