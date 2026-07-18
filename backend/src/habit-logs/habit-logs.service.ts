import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HabitsService } from '../habits/habits.service';
import { HabitLog } from './habit-log.entity';
import { CreateHabitLogDto } from './dto/create-habit-log.dto';
import { isWorkday } from '../shifts/shift-calendar';

@Injectable()
export class HabitLogsService {
  constructor(
    @InjectRepository(HabitLog)
    private habitLogsRepository: Repository<HabitLog>,
    private readonly habitsService: HabitsService,
  ) {}

  async findPaginated(
    habitId: string,
    userId: string,
    { page, limit }: { page: number; limit: number },
  ) {
    await this.habitsService.findOne(habitId, userId); // бросит 404 или 403
    const [items, total] = await this.habitLogsRepository.findAndCount({
      where: { habit: { id: habitId } },
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async create(habitId: string, userId: string, dto: CreateHabitLogDto) {
    const habit = await this.habitsService.findOne(habitId, userId); // бросит 404 или 403

    if (
      habit.frequency === 'workdays' &&
      !isWorkday(habit.owner.shiftPattern, habit.owner.shiftStartDate, dto.date)
    ) {
      throw new BadRequestException(
        'Рабочую привычку нельзя отметить в выходной день графика',
      );
    }

    const existing = await this.habitLogsRepository.findOne({
      where: { habit: { id: habitId }, date: dto.date },
    });
    if (existing) {
      throw new ConflictException(
        'Привычка уже отмечена выполненной на эту дату',
      );
    }

    return this.habitLogsRepository.save({
      habit: { id: habitId },
      date: dto.date,
    });
  }

  async remove(habitId: string, logId: string, userId: string) {
    await this.habitsService.findOne(habitId, userId); // бросит 404 или 403
    const log = await this.habitLogsRepository.findOne({
      where: { id: logId, habit: { id: habitId } },
    });
    if (!log) {
      throw new NotFoundException(`Отметка ${logId} не найдена`);
    }
    return this.habitLogsRepository.remove(log);
  }
}
