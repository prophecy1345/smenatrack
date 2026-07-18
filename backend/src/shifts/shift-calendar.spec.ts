import { dateInTimeZone, isWorkday } from './shift-calendar';

describe('shift calendar', () => {
  it.each([
    ['2/2', '2026-07-18', true],
    ['2/2', '2026-07-19', true],
    ['2/2', '2026-07-20', false],
    ['2/2', '2026-07-21', false],
    ['2/2', '2026-07-22', true],
    ['3/3', '2026-07-20', true],
    ['3/3', '2026-07-21', false],
    ['1/3', '2026-07-18', true],
    ['1/3', '2026-07-19', false],
    ['1/3', '2026-07-22', true],
  ] as const)('%s: корректно определяет %s', (pattern, date, expected) => {
    expect(isWorkday(pattern, '2026-07-18', date)).toBe(expected);
  });

  it('работает для дат до начала цикла', () => {
    expect(isWorkday('2/2', '2026-01-01', '2025-12-31')).toBe(false);
    expect(isWorkday('2/2', '2026-01-01', '2025-12-30')).toBe(false);
    expect(isWorkday('2/2', '2026-01-01', '2025-12-29')).toBe(true);
  });

  it('не ломается на переходе месяца и високосном дне', () => {
    expect(isWorkday('2/2', '2024-02-28', '2024-02-29')).toBe(true);
    expect(isWorkday('2/2', '2024-02-28', '2024-03-01')).toBe(false);
  });

  it('отклоняет несуществующую дату', () => {
    expect(() => isWorkday('2/2', '2026-02-30', '2026-03-01')).toThrow(
      'Некорректная календарная дата',
    );
  });

  it('явно отклоняет неподдерживаемый график', () => {
    expect(() => isWorkday('4/4' as never, '2026-07-18', '2026-07-18')).toThrow(
      'Неподдерживаемый график',
    );
  });

  it('определяет локальную дату пользователя по IANA timezone', () => {
    const instant = new Date('2026-07-18T23:30:00.000Z');
    expect(dateInTimeZone(instant, 'Europe/Belgrade')).toBe('2026-07-19');
    expect(dateInTimeZone(instant, 'America/New_York')).toBe('2026-07-18');
  });
});
