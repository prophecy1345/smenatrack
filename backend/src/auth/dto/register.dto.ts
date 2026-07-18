import {
  IsEmail,
  IsDateString,
  IsIn,
  IsTimeZone,
  Matches,
  MinLength,
} from 'class-validator';
import { SHIFT_PATTERNS, type ShiftPattern } from '../../shifts/shift-calendar';

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  // список графиков живёт в одном месте — shift-calendar.ts, чтобы добавление
  // нового паттерна не требовало помнить про этот декоратор
  @IsIn(SHIFT_PATTERNS)
  shiftPattern: ShiftPattern;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'shiftStartDate must be a date in YYYY-MM-DD format',
  })
  @IsDateString({ strict: true })
  shiftStartDate: string;

  @IsTimeZone()
  timeZone: string;
}
