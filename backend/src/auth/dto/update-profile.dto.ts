import { PickType } from '@nestjs/mapped-types';
import { RegisterDto } from './register.dto';

// график задаётся при регистрации, но он меняется: смена работы, сдвиг цикла, переезд
// в другой часовой пояс. PickType переносит поля вместе с их валидацией из RegisterDto.
export class UpdateProfileDto extends PickType(RegisterDto, [
  'shiftPattern',
  'shiftStartDate',
  'timeZone',
] as const) {}
