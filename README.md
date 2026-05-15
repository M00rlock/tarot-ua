# Tarot Atlas (Пет-проєкт для портфоліо)

Повноцінний full-stack застосунок про карти Таро на стеку:
- Vue 3 + Vite + TypeScript
- NestJS + TypeScript
- JanusGraph (Gremlin)
- Jasmine (unit тести)

## Що вже реалізовано

- Web UI українською мовою:
  - "Карта дня"
  - розклад на 3 карти
  - прев'ю колоди з ілюстраціями
- API ендпойнти:
  - `GET /health`
  - `GET /tarot/cards`
  - `GET /tarot/draw?count=3`
  - `GET /tarot/card-of-day`
- Інтеграція з JanusGraph:
  - читання карт із графа
  - fallback на локальні seed-дані, якщо граф недоступний
- Hot Reload у дев-режимі:
  - фронтенд через Vite HMR
  - бекенд через `nodemon` (перезапуск при зміні `src/**/*.ts`)

## Структура проєкту

- `apps/api` - NestJS API
- `apps/web` - Vue + Vite клієнт
- `infra` - локальна інфраструктура (`docker-compose` для JanusGraph)

## Швидкий старт

1. Встановити залежності

```bash
npm install
```

2. (Опціонально) Запустити JanusGraph

```bash
docker compose -f infra/docker-compose.yml up -d
```

3. Запустити API + Web паралельно

```bash
npm run dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:3000`

## Скрипти

```bash
npm run dev     # API + Web (hot reload)
npm run build   # build API + Web
npm run test    # jasmine тести для API + Web
```

## JanusGraph

- Endpoint за замовчуванням: `ws://localhost:8182/gremlin`
- Можна перевизначити змінною:

```bash
JANUSGRAPH_ENDPOINT=ws://your-host:8182/gremlin
```

Якщо JanusGraph недоступний, API продовжує працювати на локальному seed-наборі карт.

## Що можна додати далі

- історію розкладів для користувача
- ребра зв'язків між картами (`influences`, `mirrors`, `blocks`)
- E2E тести і CI
- перемикач мов (UA/EN)

## Auth v2 + Cloud sync

Ця версія додає production-like MVP авторизації:

- JWT auth (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
- PostgreSQL через TypeORM
- профіль користувача з `premiumTier`
- cloud history для розкладів (`/api/me/spreads`)
- favorites через `favorite=true`
- `.env.example` з базовими змінними

### Запуск PostgreSQL

```bash
docker compose -f infra/docker-compose.yml up -d postgres
```

### Запуск проєкту

```bash
npm install
npm run dev
```

Для dev-режиму TypeORM `synchronize=true`. Для production краще вимкнути `TYPEORM_SYNC=false` і додати міграції.


## Auth/API routes note

Backend now uses a global `/api` prefix. Test routes directly with:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/auth/health
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","name":"Test"}'
```

Vite proxies `/api/*` to `http://localhost:3000/api/*` without rewriting.

If routes still look missing, kill the old process on port 3000:

```bash
lsof -ti :3000 | xargs kill -9
```
