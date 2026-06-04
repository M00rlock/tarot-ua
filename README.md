# Tarot Atlas (пет-проєкт для портфоліо)

Повноцінний full-stack застосунок про карти Таро українською мовою.

**Стек:**
- Бекенд: Node.js (vanilla HTTP) — без БД, усі дані в коді (seed) або на JSON-файлі
- Фронтенд: vanilla JS (Web Components), SPA з серверним рендерингом
- ШІ-тлумачення: OpenRouter / OpenAI (опціонально)
- Сховище: localStorage (журнал розкладів) + JSON-файл на сервері (share)

## Можливості

- **Карта дня** — детерміністична карта на кожен день
- **Розклади:** 3 карти («Минуле·Теперішнє·Майбутнє»), Пентаграма балансу (5 карт), Кохання та стосунки (5), Кар'єра та гроші (5)
- **ШІ-тлумачення** — цілісний аналіз розкладу через LLM (OpenRouter/OpenAI), з трьома тонами: психологічний, містичний, практичний; якщо ключ API не налаштовано — працює rule-based інтерпретатор
- **Бібліотека карт** — 78 карт з ілюстраціями, значеннями й ключовими словами
- **Журнал розкладів** — збереження, нотатки, обране в localStorage
- **Профіль** — локальне ім'я (без реєстрації)
- **Публічні розклади** — share за slug + соціальна картка SVG (JSON-файл на сервері)
- **Аналітика** — PostHog (опціонально, без ключа працює без неї)

## Структура

- `apps/api` — Node.js API (vanilla HTTP, seed-дані, JSON-файл для share)
- `apps/web` — vanilla JS SPA (Web Components)
- `infra` — docker-composite (більше не потрібен, залишено для сумісності)

## Швидкий старт

```bash
# 1. Встановити залежності
npm install

# 2. Запустити API
npm start:api

# 3. В іншому терміналі — фронтенд
npm start:web
```

Або напряму:

```bash
node apps/api/server.js  # API на http://localhost:3000
node apps/web/server.js  # Web на http://localhost:5173
```

Жодна БД не потрібна. API працює повністю автономно.

## API endpoints

| Метод | Шлях | Опис |
|-------|------|------|
| GET | `/api/health` | Перевірка API |
| GET | `/api/tarot/cards` | Список карт |
| GET | `/api/tarot/spreads` | Визначення розкладів |
| GET | `/api/tarot/draw?count=3&type=classic3` | Випадковий розклад |
| POST | `/api/tarot/interpretation` | ШІ-тлумачення |
| GET | `/api/tarot/card-of-day` | Карта дня |
| POST | `/api/share/spreads` | Створити публічний розклад |
| GET | `/api/share/spreads/:slug` | Отримати публічний розклад |
| GET | `/api/share/spreads/:slug/social-card.svg` | Social card |

## ШІ-тлумачення

Підтримується OpenRouter та OpenAI-сумісні API. Налаштування в `apps/api/.env`:

```env
OPENROUTER_API_KEY=sk-or-...
LLM_API_URL=https://openrouter.ai/api/v1/chat/completions
LLM_MODEL=openai/gpt-4o-mini
```

Якщо ключ не вказано — застосунок використовує rule-based тлумачення.

## Аналітика

Опціональна аналітика через PostHog. Файл `apps/web/.env`:

```env
VITE_POSTHOG_KEY=phc_...
VITE_POSTHOG_HOST=https://eu.i.posthog.com
VITE_ANALYTICS_ENABLED=true
```

Для вимкнення: `localStorage['tarot-analytics-opt-out'] = 'true'`.

## Що можна додати

- E2E тести
- перемикач мов (UA/EN)
