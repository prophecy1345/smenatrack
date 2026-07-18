import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { Habit } from './habit.entity';
import { HabitLog } from '../habit-logs/habit-log.entity';

describe('HabitsService', () => {
  let service: HabitsService;
  const mockRepo = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
  };
  // findPaginated считает doneToday по отметкам, поэтому нужен и этот репозиторий
  const mockLogsRepo = { find: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        HabitsService,
        { provide: getRepositoryToken(Habit), useValue: mockRepo },
        { provide: getRepositoryToken(HabitLog), useValue: mockLogsRepo },
      ],
    }).compile();
    service = module.get(HabitsService);
  });

  it('возвращает привычку по id, если она принадлежит пользователю', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: '1',
      name: 'Бег',
      owner: { id: 'user-1' },
    });
    const result = await service.findOne('1', 'user-1');
    expect(result).toEqual({ id: '1', name: 'Бег', owner: { id: 'user-1' } });
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
    const today = new Date().toISOString().slice(0, 10);
    mockRepo.findAndCount.mockResolvedValue([
      [
        { id: 'h1', name: 'Бег' },
        { id: 'h2', name: 'Чтение' },
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
  });
});
