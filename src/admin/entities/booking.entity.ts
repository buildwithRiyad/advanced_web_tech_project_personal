import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  roomNumber!: string;

  @Column()
  checkIn!: string;

  @Column()
  checkOut!: string;

  @ManyToOne(() => User, user => user.bookings)
  user!: User;
}