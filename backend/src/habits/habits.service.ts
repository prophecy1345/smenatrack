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
import { User } from '../users/user.entity';
import { dateInTimeZone, isWorkday } from '../shifts/shift-calendar';

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
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findPaginated(
    ownerId: string,
    { page, limit, frequency, search }: FindHabitsQuery,
  ) {
    const owner = await this.usersRepository.findOneBy({ id: ownerId });
    if (!owner) throw new NotFoundException('Пользователь не найден');

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
    const today = dateInTimeZone(new Date(), owner.timeZone);
    const isWorkdayToday = isWorkday(
      owner.shiftPattern,
      owner.shiftStartDate,
      today,
    );
    const todayLogs = items.length
      ? await this.habitLogsRepository.find({
          where: { habit: { id: In(items.map((h) => h.id)) }, date: today },
          relations: { habit: true },
        })
      : [];
    const doneIds = new Set(todayLogs.map((log) => log.habit.id));

    // today и isWorkdayToday одинаковы для всей страницы — это свойства пользователя,
    // а не привычки, поэтому лежат в корне ответа, а не копируются в каждый элемент
    return {
      items: items.map((habit) => ({
        ...habit,
        doneToday: doneIds.has(habit.id),
        scheduledToday: habit.frequency === 'daily' || isWorkdayToday,
      })),
      today,
      isWorkdayToday,
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
        // Берём только данные графика владельца — email и хэш пароля наружу не уходят.
        id: true,
        name: true,
        frequency: true,
        createdAt: true,
        owner: {
          id: true,
          shiftPattern: true,
          shiftStartDate: true,
          timeZone: true,
        },
      },
    });
    if (!habit) {
      throw new NotFoundException(`Habit ${id} not found`);
    }
    if (habit.owner.id !== userId) {
      throw new ForbiddenException('Это не ваша привычка');
    }
    const today = dateInTimeZone(new Date(), habit.owner.timeZone);
    const isWorkdayToday = isWorkday(
      habit.owner.shiftPattern,
      habit.owner.shiftStartDate,
      today,
    );
    return Object.assign(habit, {
      isWorkdayToday,
      scheduledToday: habit.frequency === 'daily' || isWorkdayToday,
      today,
    });
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
