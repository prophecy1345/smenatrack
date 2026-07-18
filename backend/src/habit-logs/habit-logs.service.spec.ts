import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { HabitLogsService } from './habit-logs.service';
import { HabitLog } from './habit-log.entity';
import { HabitsService } from '../habits/habits.service';

describe('HabitLogsService', () => {
  let service: HabitLogsService;
  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
  };
  const mockHabitsService = { findOne: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        HabitLogsService,
        { provide: getRepositoryToken(HabitLog), useValue: mockRepo },
        { provide: HabitsService, useValue: mockHabitsService },
      ],
    }).compile();
    service = module.get(HabitLogsService);
  });

  it('создаёт отметку для своей привычки', async () => {
    mockHabitsService.findOne.mockResolvedValue({ id: 'h1' });
    mockRepo.findOne.mockResolvedValue(null); // отметки на эту дату ещё нет
    mockRepo.save.mockResolvedValue({ id: 'l1', date: '2026-07-18' });
    const result = await service.create('h1', 'user-1', { date: '2026-07-18' });
    expect(result).toEqual({ id: 'l1', date: '2026-07-18' });
  });

  it('бросает ConflictException при повторной отметке на ту же дату', async () => {
    mockHabitsService.findOne.mockResolvedValue({ id: 'h1' });
    mockRepo.findOne.mockResolvedValue({ id: 'l1', date: '2026-07-18' });
    await expect(
      service.create('h1', 'user-1', { date: '2026-07-18' }),
    ).rejects.toThrow(ConflictException);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('возвращает список отметок конкретной привычки', async () => {
    mockHabitsService.findOne.mockResolvedValue({ id: 'h1' });
    mockRepo.findAndCount.mockResolvedValue([[{ id: 'l1' }], 1]);
    const result = await service.findPaginated('h1', 'user-1', {
      page: 1,
      limit: 20,
    });
    expect(result.items).toEqual([{ id: 'l1' }]);
    expect(result.total).toBe(1);
  });

  it('пробрасывает NotFoundException и не сохраняет запись', async () => {
    mockHabitsService.findOne.mockRejectedValue(new NotFoundException());
    await expect(
      service.create('missing', 'user-1', { date: '2026-07-18' }),
    ).rejects.toThrow(NotFoundException);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
