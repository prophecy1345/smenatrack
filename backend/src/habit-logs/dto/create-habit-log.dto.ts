import { IsDateString } from 'class-validator';

export class CreateHabitLogDto {
  @IsDateString()
  date: string;
}
