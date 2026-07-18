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
    // Тест не может выбрать дату своего запуска, поэтому строит график относительно
    // серверного today: только так утверждение «сегодня выходной» верно в любой день.
    const listHabits = () =>
      request(app.getHttpServer())
        .get('/habits')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

    const first = await listHabits();
    const today = (first.body as { today: string }).today;
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const shiftDate = (offsetDays: number) => {
      const [year, month, day] = today.split('-').map(Number);
      const shifted = new Date(Date.UTC(year, month - 1, day + offsetDays));
      return shifted.toISOString().slice(0, 10);
    };

    const patchSchedule = (shiftStartDate: string) =>
      request(app.getHttpServer())
        .patch('/auth/me')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ shiftPattern: '1/3', shiftStartDate, timeZone: 'UTC' })
        .expect(200);

    // цикл 1/3: длина 4 дня, рабочий только нулевой день цикла
    const workday = await patchSchedule(shiftDate(0));
    expect((workday.body as { shiftPattern: string }).shiftPattern).toBe('1/3');
    expect(workday.body).not.toHaveProperty('passwordHash');
    expect(
      ((await listHabits()).body as { isWorkdayToday: boolean }).isWorkdayToday,
    ).toBe(true);

    // сдвиг старта на день назад делает сегодняшний день первым выходным цикла
    await patchSchedule(shiftDate(-1));
    expect(
      ((await listHabits()).body as { isWorkdayToday: boolean }).isWorkdayToday,
    ).toBe(false);
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
