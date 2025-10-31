# E2E Тесты для CRM

Автоматические тесты для проверки основных функций системы.

## Установка

Браузеры уже установлены. Если нужно переустановить:

```bash
npx playwright install chromium
```

## Запуск тестов

### Все тесты
```bash
npm run test:e2e
```

### С UI (интерактивный режим)
```bash
npm run test:e2e:ui
```

### В видимом браузере (headed mode)
```bash
npm run test:e2e:headed
```

### В режиме отладки
```bash
npm run test:e2e:debug
```

### Просмотр отчета
```bash
npm run test:e2e:report
```

## Тесты

### Smoke тесты (`smoke.spec.ts`)
Быстрые тесты для проверки работоспособности:
- Загрузка главной страницы
- Авторизация
- Навигация между страницами
- Загрузка Dashboard

### Авторизация (`auth.spec.ts`)
- Автологин с дефолтным пользователем
- Отображение email пользователя

### Клиенты (`clients.spec.ts`)
- Загрузка страницы клиентов
- Создание нового клиента

### Проекты (`projects.spec.ts`)
- Загрузка страницы проектов
- Создание нового проекта

### Документы (`documents.spec.ts`)
- Загрузка документов клиента
- Открытие диалога загрузки документа

### Производство (`production.spec.ts`)
- Загрузка страницы производства
- Создание производственной зоны

## Настройка

Тесты запускаются на `http://localhost:5173` по умолчанию (локальный dev сервер запускается автоматически).

### Тестирование Production версии

**Простой способ (через npm скрипт):**
```bash
npm run test:e2e:prod
```

**С UI интерфейсом:**
```bash
npm run test:e2e:prod:ui
```

**Вручную (если нужен другой URL):**
```bash
PLAYWRIGHT_BASE_URL=https://crm-3-0-seven.vercel.app npm run test:e2e
```

**Для другого production URL:**
```bash
PLAYWRIGHT_BASE_URL=https://crm-3-0-aifo.vercel.app npm run test:e2e
```

## Структура

```
e2e/
├── auth.spec.ts           # Тесты авторизации
├── clients.spec.ts        # Тесты клиентов
├── projects.spec.ts       # Тесты проектов
├── documents.spec.ts      # Тесты документов
├── production.spec.ts     # Тесты производства
└── smoke.spec.ts          # Smoke тесты (быстрая проверка)
```

