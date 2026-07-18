import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Habit } from '../habits/habit.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'shift_pattern' })
  shiftPattern: string;

  @Column({ default: 'user' })
  role: string;

  @OneToMany(() => Habit, (habit) => habit.owner)
  habits: Habit[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
