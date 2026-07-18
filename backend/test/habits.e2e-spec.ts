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
      .send({
        email,
        password: 'password123',
        shiftPattern: '2/2',
        shiftStartDate: '2026-07-18',
        timeZone: 'UTC',
      })
      .expect(201);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'password123' })
      .expect(201);
    testToken = (login.body as { accessToken: string }).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

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

  it('не принимает несуществующую дату начала смен', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `invalid-date-${Date.now()}@example.com`,
        password: 'password123',
        shiftPattern: '2/2',
        shiftStartDate: '2026-02-30',
        timeZone: 'UTC',
      })
      .expect(400);
  });

  it('PATCH /auth/me меняет график и это видно в GET /habits', async () => {
    // 2026-07-19 при цикле 3/3 — второй рабочий день, при 1/3 — уже выходной
    await request(app.getHttpServer())
      .patch('/auth/me')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        shiftPattern: '1/3',
        shiftStartDate: '2026-07-18',
        timeZone: 'Europe/Belgrade',
      })
      .expect(200)
      .expect((res) => {
        expect((res.body as { shiftPattern: string }).shiftPattern).toBe('1/3');
        expect(res.body).not.toHaveProperty('passwordHash');
      });

    await request(app.getHttpServer())
      .get('/habits')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as { today: string; isWorkdayToday: boolean };
        expect(body.today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(typeof body.isWorkdayToday).toBe('boolean');
      });
  });

  it('PATCH /auth/me с неизвестным графиком возвращает 400', () => {
    return request(app.getHttpServer())
      .patch('/auth/me')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        shiftPattern: '4/4',
        shiftStartDate: '2026-07-18',
        timeZone: 'UTC',
      })
      .expect(400);
  });

  it('PATCH /auth/me без токена возвращает 401', () => {
    return request(app.getHttpServer())
      .patch('/auth/me')
      .send({
        shiftPattern: '2/2',
        shiftStartDate: '2026-07-18',
        timeZone: 'UTC',
      })
      .expect(401);
  });
});
