import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();
    response.status(status).json({
      statusCode: status,
      message:
        typeof body === 'string'
          ? body
          : (body as { message: string | string[] }).message,
      error: exception.name,
      timestamp: new Date().toISOString(),
    });
  }
}
