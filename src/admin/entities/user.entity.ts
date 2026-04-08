import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Profile } from './profile.entity';
import { Booking } from './booking.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  role!: string;

  @Column()
  nidNumber!: string;

  @Column({ nullable: true })
  nidImage!: string;

  // One-to-One with Profile
  @OneToOne(() => Profile, profile => profile.user, { cascade: true })
  @JoinColumn()
  profile!: Profile;

  // One-to-Many with Booking
  @OneToMany(() => Booking, booking => booking.user)
  bookings!: Booking[];
}