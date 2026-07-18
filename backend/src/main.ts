import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет поля, не описанные в DTO
      forbidNonWhitelisted: true, // возвращает 400, если пришло лишнее поле
      transform: true, // приводит query/path-параметры к нужным типам
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('SmenaTrack API')
    .setDescription('API обязательного сквозного проекта курса')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    throw new Error('FRONTEND_URL is required');
  }
  app.enableCors({ origin: frontendUrl });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
