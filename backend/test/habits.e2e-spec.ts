import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('POST /habits (интеграционный тест)', () => {
  let app: INestApplication<App>;
  let testToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule], // реальный AppModule целиком, с реальной (тестовой) БД
    }).compile();
    app = moduleRef.createNestApplication();
    // те же глобальные настройки, что и в main.ts (модуль 7),
    // иначе в тесте не работает валидация и проверка на 400 ничего не поймает
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // валидный JWT получаем так же, как настоящий клиент: регистрация + логин
    const email = `habits-e2e-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', shiftPattern: '2/2' });
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'password123' });
    testToken = (login.body as { accessToken: string }).accessToken;
  });

  afterAll(() => app.close());

  it('создаёт привычку и возвращает 201', () => {
    return request(app.getHttpServer())
      .post('/habits')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'Бег', frequency: 'daily' })
      .expect(201)
      .expect((res) => {
        expect((res.body as { name: string }).name).toBe('Бег');
      });
  });

  it('без токена возвращает 401', () => {
    return request(app.getHttpServer())
      .post('/habits')
      .send({ name: 'Бег', frequency: 'daily' })
      .expect(401);
  });

  it('с невалидной частотой возвращает 400', () => {
    return request(app.getHttpServer())
      .post('/habits')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'Бег', frequency: 'еженедельно' })
      .expect(400);
  });
});
