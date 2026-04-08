import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  phone!: string;

  @Column()
  address!: string;

  @OneToOne(() => User, user => user.profile)
  user!: User;
}