import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { HabitLog } from '../habit-logs/habit-log.entity';

@Entity('habits')
export class Habit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 'daily' })
  frequency: string;

  @ManyToOne(() => User, (user) => user.habits)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => HabitLog, (log) => log.habit)
  logs: HabitLog[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
