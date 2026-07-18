import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('POST /habits/:id/logs (интеграционный тест)', () => {
  let app: INestApplication<App>;
  let testToken: string;
  let habitId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const email = `logs-e2e-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', shiftPattern: '2/2' })
      .expect(201);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'password123' })
      .expect(201);
    testToken = (login.body as { accessToken: string }).accessToken;

    const habit = await request(app.getHttpServer())
      .post('/habits')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'Бег', frequency: 'daily' })
      .expect(201);
    habitId = (habit.body as { id: string }).id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('создаёт отметку и возвращает 201', () => {
    return request(app.getHttpServer())
      .post(`/habits/${habitId}/logs`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ date: '2026-01-15' })
      .expect(201)
      .expect((res) => {
        expect((res.body as { date: string }).date).toBe('2026-01-15');
      });
  });

  it('повторная отметка на ту же дату возвращает 409', () => {
    return request(app.getHttpServer())
      .post(`/habits/${habitId}/logs`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ date: '2026-01-15' })
      .expect(409);
  });

  it('для несуществующей привычки возвращает 404', () => {
    return request(app.getHttpServer())
      .post('/habits/00000000-0000-0000-0000-000000000000/logs')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ date: '2026-01-16' })
      .expect(404);
  });

  it('без токена возвращает 401', () => {
    return request(app.getHttpServer())
      .post(`/habits/${habitId}/logs`)
      .send({ date: '2026-01-17' })
      .expect(401);
  });

  it('GET возвращает созданные отметки', () => {
    return request(app.getHttpServer())
      .get(`/habits/${habitId}/logs`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as { items: { date: string }[]; total: number };
        expect(body.total).toBe(1);
        expect(body.items[0].date).toBe('2026-01-15');
      });
  });
});
