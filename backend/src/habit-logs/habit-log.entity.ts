import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Habit } from '../habits/habit.entity';

@Entity('habit_logs')
@Unique(['habit', 'date']) // одна привычка — одна отметка в день
export class HabitLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Habit, (habit) => habit.logs)
  @JoinColumn({ name: 'habit_id' })
  habit: Habit;

  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
