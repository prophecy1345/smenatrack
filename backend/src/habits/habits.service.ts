import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { Habit } from './habit.entity';
import { HabitLog } from '../habit-logs/habit-log.entity';
import { CreateHabitDto } from './dto/create-habit.dto';

interface FindHabitsQuery {
  page: number;
  limit: number;
  frequency?: string;
  search?: string;
}

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private habitsRepository: Repository<Habit>,
    @InjectRepository(HabitLog)
    private habitLogsRepository: Repository<HabitLog>,
  ) {}

  async findPaginated(
    ownerId: string,
    { page, limit, frequency, search }: FindHabitsQuery,
  ) {
    const where: FindOptionsWhere<Habit> = { owner: { id: ownerId } };
    if (frequency) where.frequency = frequency;
    if (search) where.name = ILike(`%${search}%`);

    const [items, total] = await this.habitsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    // doneToday — производное поле: есть ли на сегодня отметка о выполнении.
    // В таблице habits его нет, поэтому считаем одним запросом по всей странице.
    const today = new Date().toISOString().slice(0, 10);
    const todayLogs = items.length
      ? await this.habitLogsRepository.find({
          where: { habit: { id: In(items.map((h) => h.id)) }, date: today },
          relations: { habit: true },
        })
      : [];
    const doneIds = new Set(todayLogs.map((log) => log.habit.id));

    return {
      items: items.map((habit) => ({
        ...habit,
        doneToday: doneIds.has(habit.id),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const habit = await this.habitsRepository.findOne({
      where: { id },
      relations: { owner: true }, // без этого habit.owner будет undefined
      select: {
        // из владельца берём только id — хэш пароля наружу не уходит
        id: true,
        name: true,
        frequency: true,
        createdAt: true,
        owner: { id: true },
      },
    });
    if (!habit) {
      throw new NotFoundException(`Habit ${id} not found`);
    }
    if (habit.owner.id !== userId) {
      throw new ForbiddenException('Это не ваша привычка');
    }
    return habit;
  }

  create(dto: CreateHabitDto, ownerId: string) {
    return this.habitsRepository.save({ ...dto, owner: { id: ownerId } });
  }

  async update(id: string, dto: Partial<CreateHabitDto>, userId: string) {
    const habit = await this.findOne(id, userId); // бросит 404 или 403, если нельзя
    Object.assign(habit, dto);
    return this.habitsRepository.save(habit);
  }

  async remove(id: string, userId: string) {
    const habit = await this.findOne(id, userId); // бросит 404 или 403, если нельзя
    return this.habitsRepository.remove(habit);
  }
}
