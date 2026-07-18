import { IsDateString, Matches } from 'class-validator';

export class CreateHabitLogDto {
  // Голого @IsDateString() мало: он пропускает и '2026-07-18T10:00:00Z', и несуществующее
  // '2026-02-30'. Дальше эту дату разбирает isWorkday и падает обычным Error → 500 вместо 400.
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be a date in YYYY-MM-DD format',
  })
  @IsDateString({ strict: true })
  date: string;
}
