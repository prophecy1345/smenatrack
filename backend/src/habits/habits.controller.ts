import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/authenticated-request';

@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('frequency') frequency?: string,
    @Query('search') search?: string,
  ) {
    return this.habitsService.findPaginated(req.user.userId, {
      page: +page,
      limit: +limit,
      frequency,
      search,
    });
  }

  @ApiOperation({ summary: 'Получить одну привычку по id' })
  @ApiResponse({ status: 200, description: 'Привычка найдена' })
  @ApiResponse({ status: 401, description: 'Не передан или невалиден токен' })
  @ApiResponse({ status: 403, description: 'Это не ваша привычка' })
  @ApiResponse({ status: 404, description: 'Привычка не найдена' })
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.habitsService.findOne(id, req.user.userId);
  }

  @Post()
  create(@Body() dto: CreateHabitDto, @Req() req: AuthenticatedRequest) {
    return this.habitsService.create(dto, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.habitsService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.habitsService.remove(id, req.user.userId);
  }
}
