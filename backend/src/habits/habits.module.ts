import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Habit } from './habit.entity';
import { HabitLog } from '../habit-logs/habit-log.entity';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Habit, HabitLog, User])],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService],
})
export class HabitsModule {}
