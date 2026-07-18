import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('health')
export class HealthController {
  @ApiOperation({ summary: 'Проверка доступности сервиса' })
  @ApiResponse({ status: 200, description: 'Сервис отвечает' })
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
