import { IsIn, IsString, Length } from 'class-validator';

export class CreateHabitDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsIn(['daily', 'workdays'])
  frequency: string;
}
