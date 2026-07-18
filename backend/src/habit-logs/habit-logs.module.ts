import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitsModule } from '../habits/habits.module';
import { HabitLog } from './habit-log.entity';
import { HabitLogsController } from './habit-logs.controller';
import { HabitLogsService } from './habit-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([HabitLog]), HabitsModule],
  controllers: [HabitLogsController],
  providers: [HabitLogsService],
})
export class HabitLogsModule {}
