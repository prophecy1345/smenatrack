import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HabitLogsService } from './habit-logs.service';
import { CreateHabitLogDto } from './dto/create-habit-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/authenticated-request';

@UseGuards(JwtAuthGuard)
@Controller('habits/:habitId/logs')
export class HabitLogsController {
  constructor(private readonly habitLogsService: HabitLogsService) {}

  @ApiOperation({ summary: 'История отметок привычки' })
  @ApiResponse({ status: 200, description: 'Список отметок' })
  @ApiResponse({ status: 401, description: 'Не передан или невалиден токен' })
  @ApiResponse({ status: 403, description: 'Это не ваша привычка' })
  @ApiResponse({ status: 404, description: 'Привычка не найдена' })
  @Get()
  findAll(
    @Param('habitId') habitId: string,
    @Req() req: AuthenticatedRequest,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.habitLogsService.findPaginated(habitId, req.user.userId, {
      page: +page,
      limit: +limit,
    });
  }

  @ApiOperation({ summary: 'Отметить привычку выполненной' })
  @ApiResponse({ status: 201, description: 'Отметка создана' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не передан или невалиден токен' })
  @ApiResponse({ status: 403, description: 'Это не ваша привычка' })
  @ApiResponse({ status: 404, description: 'Привычка не найдена' })
  @ApiResponse({
    status: 409,
    description: 'Привычка уже отмечена на эту дату',
  })
  @Post()
  create(
    @Param('habitId') habitId: string,
    @Body() dto: CreateHabitLogDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.habitLogsService.create(habitId, req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Удалить отметку' })
  @ApiResponse({ status: 200, description: 'Отметка удалена' })
  @ApiResponse({ status: 401, description: 'Не передан или невалиден токен' })
  @ApiResponse({ status: 403, description: 'Это не ваша привычка' })
  @ApiResponse({ status: 404, description: 'Привычка или отметка не найдена' })
  @Delete(':logId')
  remove(
    @Param('habitId') habitId: string,
    @Param('logId') logId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.habitLogsService.remove(habitId, logId, req.user.userId);
  }
}
