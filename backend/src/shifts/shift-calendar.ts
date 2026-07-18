export const SHIFT_PATTERNS = ['2/2', '3/3', '1/3'] as const;

export type ShiftPattern = (typeof SHIFT_PATTERNS)[number];

const PATTERN_DAYS: Record<ShiftPattern, { work: number; rest: number }> = {
  '2/2': { work: 2, rest: 2 },
  '3/3': { work: 3, rest: 3 },
  '1/3': { work: 1, rest: 3 },
};

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

function dateOnlyToUtcDay(value: string): number {
  const match = DATE_ONLY.exec(value);
  if (!match) throw new Error(`Некорректная календарная дата: ${value}`);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`Некорректная календарная дата: ${value}`);
  }
  return Math.floor(timestamp / DAY_MS);
}

export function isWorkday(
  pattern: ShiftPattern,
  shiftStartDate: string,
  targetDate: string,
): boolean {
  const schedule = PATTERN_DAYS[pattern];
  if (!schedule) throw new Error(`Неподдерживаемый график: ${String(pattern)}`);
  const { work, rest } = schedule;
  const startDay = dateOnlyToUtcDay(shiftStartDate);
  const targetDay = dateOnlyToUtcDay(targetDate);
  const cycleLength = work + rest;
  const cycleDay =
    (((targetDay - startDay) % cycleLength) + cycleLength) % cycleLength;
  return cycleDay < work;
}

export function dateInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return `${value('year')}-${value('month')}-${value('day')}`;
}
