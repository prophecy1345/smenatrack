import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Habit } from '../habits/habit.entity';
import type { ShiftPattern } from '../shifts/shift-calendar';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'shift_pattern', type: 'varchar' })
  shiftPattern: ShiftPattern;

  @Column({ name: 'shift_start_date', type: 'date' })
  shiftStartDate: string;

  @Column({ name: 'time_zone' })
  timeZone: string;

  @Column({ default: 'user' })
  role: string;

  @OneToMany(() => Habit, (habit) => habit.owner)
  habits: Habit[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
