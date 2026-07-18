import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { Habit } from './habit.entity';
import { HabitLog } from '../habit-logs/habit-log.entity';
import { User } from '../users/user.entity';

describe('HabitsService', () => {
  let service: HabitsService;
  const mockRepo = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
  };
  // findPaginated считает doneToday по отметкам, поэтому нужен и этот репозиторий
  const mockLogsRepo = { find: jest.fn() };
  const mockUsersRepo = { findOneBy: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        HabitsService,
        { provide: getRepositoryToken(Habit), useValue: mockRepo },
        { provide: getRepositoryToken(HabitLog), useValue: mockLogsRepo },
        { provide: getRepositoryToken(User), useValue: mockUsersRepo },
      ],
    }).compile();
    service = module.get(HabitsService);
  });

  it('возвращает привычку по id, если она принадлежит пользователю', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: '1',
      name: 'Бег',
      frequency: 'daily',
      owner: {
        id: 'user-1',
        shiftPattern: '2/2',
        shiftStartDate: '2026-07-18',
        timeZone: 'UTC',
      },
    });
    const result = await service.findOne('1', 'user-1');
    expect(result).toMatchObject({
      id: '1',
      name: 'Бег',
      scheduledToday: true,
    });
  });

  it('бросает NotFoundException для несуществующего id', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('бросает ForbiddenException для чужой привычки', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: '1',
      name: 'Бег',
      owner: { id: 'user-1' },
    });
    await expect(service.findOne('1', 'user-2')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('проставляет doneToday по сегодняшним отметкам', async () => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'UTC',
    }).format(new Date());
    mockUsersRepo.findOneBy.mockResolvedValue({
      id: 'user-1',
      shiftPattern: '2/2',
      shiftStartDate: today,
      timeZone: 'UTC',
    });
    mockRepo.findAndCount.mockResolvedValue([
      [
        { id: 'h1', name: 'Бег', frequency: 'workdays' },
        { id: 'h2', name: 'Чтение', frequency: 'daily' },
      ],
      2,
    ]);
    mockLogsRepo.find.mockResolvedValue([{ habit: { id: 'h1' }, date: today }]);

    const result = await service.findPaginated('user-1', {
      page: 1,
      limit: 20,
    });

    expect(result.items[0].doneToday).toBe(true);
    expect(result.items[1].doneToday).toBe(false);
    expect(result.items[0].scheduledToday).toBe(true);
    // today и isWorkdayToday — свойства пользователя, поэтому в корне ответа
    expect(result.isWorkdayToday).toBe(true);
    expect(result.today).toBe(today);
    expect(result.items[0]).not.toHaveProperty('today');
  });
});
