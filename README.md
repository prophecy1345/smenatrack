# SmenaTrack

Трекер привычек для людей со сменным графиком (2/2, 3/3, сутки/трое) — сквозной проект курса **«Веб-приложение от идеи до релиза»**. Сервис рассчитывает тип календарного дня от первого рабочего дня цикла и не разрешает отмечать рабочую привычку в выходной.

Это эталонная реализация: приложение собрано строго по модулям 3–12 курса и доведено до рабочего состояния. Если вы застряли на каком-то шаге — сюда можно подсмотреть.

**Стек:** NestJS 11 + TypeORM + PostgreSQL 17 · Vue 3 (Composition API, Pinia, Vue Router) + Vite · Docker · GitHub Actions.

## Запуск

Нужен Docker и Node.js 24 LTS.

### Всё в контейнерах

```bash
git clone https://github.com/prophecy1345/smenatrack.git
cd smenatrack
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env

docker compose up -d --build
docker compose exec backend npm run migration:run:prod   # один раз, до первого использования
```

Приложение: <http://localhost:8080> · документация API: <http://localhost:3000/api/docs>

### В режиме разработки

```bash
docker compose up -d postgres          # только база

cp backend/.env.example backend/.env   # и подставьте свой JWT_SECRET
cd backend && npm install && npm run migration:run && npm run start:dev

cp frontend/.env.example frontend/.env
cd frontend && npm install && npm run dev
```

Backend поднимется на `:3000`, frontend — на `:5173`.

> Если порт 5432 на вашей машине уже занят локально установленным PostgreSQL, поменяйте проброс в `docker-compose.yml` на `"5433:5432"` и укажите `DB_PORT=5433` в `backend/.env`.

## Проверки

```bash
cd backend
npm run lint          # ESLint
npm test              # unit-тесты (Jest)
npm run test:e2e      # интеграционные тесты (нужна поднятая БД)

cd ../frontend
npm run lint
npm run test:unit     # unit-тесты компонентов (Vitest)
npx playwright test   # e2e в браузере (нужны запущенные backend и frontend)
```

## Что где лежит

| Путь                        | Что внутри                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------- |
| `backend/src/habits/`       | CRUD привычек: пагинация, фильтры, проверка владельца                                  |
| `backend/src/habit-logs/`   | Отметки о выполнении — вложенный ресурс `/habits/:id/logs`                             |
| `backend/src/auth/`         | Регистрация, логин, JWT-стратегия, `JwtAuthGuard`                                      |
| `backend/src/shifts/`       | Расчёт рабочих и выходных дат сменного цикла                                           |
| `backend/src/migrations/`   | Миграции схемы БД                                                                      |
| `frontend/src/components/`  | `AppHeader`, `HabitCard`, `HabitList`, `AddHabitForm`, `HabitLogList`, `ShiftSettings` |
| `frontend/src/views/`       | Экраны: вход, регистрация, список привычек, детали привычки                            |
| `frontend/src/composables/` | `useHabits()`, `useHabitLogs()` — работа с API                                         |
| `frontend/e2e/`             | Playwright: основной сценарий и проверка навигации                                     |

## Контракт API

```
POST   /auth/register            { email, password, shiftPattern, shiftStartDate, timeZone }
POST   /auth/login               { email, password } → JWT
GET    /auth/me
PATCH  /auth/me                  { shiftPattern, shiftStartDate, timeZone }
GET    /habits                   ?page&limit&frequency&search
POST   /habits                   { name, frequency }
GET    /habits/:id
PATCH  /habits/:id               { name?, frequency? }
DELETE /habits/:id
POST   /habits/:id/logs          { date }
GET    /habits/:id/logs          ?page&limit
DELETE /habits/:id/logs/:logId
GET    /health
```

Коды ошибок: `400` — невалидные данные или рабочая отметка в выходной графика, `401` — нет токена, `403` — чужая привычка, `404` — не найдено, `409` — отметка на эту дату уже есть.

## Чего здесь нет

Репозиторий покрывает модули 3–12 — то, что выражается кодом. Продуктовые артефакты модулей 1–2 (JTBD, Lean Canvas, User Stories, wireframes, ER-диаграмма), деплой на хостинг (модуль 13) и roadmap (модуль 15) остаются самостоятельной работой: их результат — документы и задеплоенный сервис, а не файлы в репозитории.
