# 🏢 Buro CRM

Современная система управления с полным циклом от клиента до производства.

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build

# Запуск тестов
npm run test
```

### Деплой на Vercel

1. **Подготовка проекта:**
   ```bash
   npm run build
   ```

2. **Деплой через Vercel CLI:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Деплой через веб-интерфейс:**
   - Перейдите на [vercel.com/new](https://vercel.com/new?onboarding=true)
   - Импортируйте ваш Git репозиторий
   - Настройте переменные окружения
   - Деплой!

## 🏗️ Архитектура

### Frontend Stack
- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик и dev сервер
- **Tailwind CSS** - стилизация
- **Radix UI** - компоненты
- **React Router** - роутинг
- **Zustand** - управление состоянием

### Backend & Services
- **Supabase** - PostgreSQL + Auth + Real-time
- **Vercel** - хостинг и деплой
- **Service Worker** - PWA и кэширование

### Инструменты разработки
- **Vitest** - тестирование
- **ESLint** - линтинг
- **Prettier** - форматирование

## 📁 Структура проекта

```
src/
├── components/          # React компоненты
│   ├── ui/             # Базовые UI компоненты
│   ├── layout/         # Компоненты макета
│   ├── pages/          # Страницы приложения
│   ├── clients/        # Компоненты клиентов
│   ├── projects/       # Компоненты проектов
│   ├── production/     # Компоненты производства
│   ├── documents/      # Компоненты документов
│   ├── error/          # Обработка ошибок
│   └── optimized/      # Оптимизированные компоненты
├── lib/                # Утилиты и хелперы
│   ├── api/            # API клиенты
│   ├── supabase/       # Supabase интеграция
│   ├── stores/         # Zustand stores
│   ├── hooks/          # Кастомные хуки
│   └── error/          # Обработка ошибок
├── contexts/           # React контексты
├── router/             # Роутинг
├── types/              # TypeScript типы
└── styles/             # Глобальные стили
```

## 🔧 Настройка окружения

### Переменные окружения

Создайте файл `.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# Environment
VITE_NODE_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### Supabase Setup

1. Создайте проект на [supabase.com](https://supabase.com)
2. Выполните SQL схему из `supabase/schema.sql`
3. Настройте RLS политики
4. Создайте storage buckets для файлов

## 🧪 Тестирование

```bash
# Запуск всех тестов
npm run test

# Запуск тестов с UI
npm run test:ui

# Запуск тестов один раз
npm run test:run

# Покрытие кода
npm run test:coverage
```

## 📊 Производительность

### Bundle Analysis
После сборки откройте `dist/stats.html` для анализа размера бандла.

### Оптимизации
- ✅ Code splitting по роутам
- ✅ Lazy loading компонентов
- ✅ Tree shaking
- ✅ Минификация и сжатие
- ✅ Service Worker для кэширования
- ✅ PWA поддержка
- ✅ Виртуализация списков
- ✅ Мемоизация компонентов

## 🚀 Деплой

### Vercel (Рекомендуется)

1. **Автоматический деплой:**
   - Подключите GitHub репозиторий к Vercel
   - Настройте переменные окружения
   - Деплой происходит автоматически при push

2. **Ручной деплой:**
   ```bash
   vercel --prod
   ```

### Другие платформы

- **Netlify:** `npm run build && netlify deploy --prod --dir=dist`
- **GitHub Pages:** Используйте GitHub Actions
- **Firebase Hosting:** `firebase deploy`

## 🔒 Безопасность

- ✅ HTTPS только
- ✅ CSP заголовки
- ✅ XSS защита
- ✅ CSRF защита
- ✅ RLS в Supabase
- ✅ Валидация данных
- ✅ Санитизация входных данных

## 📱 PWA Features

- ✅ Service Worker
- ✅ Offline поддержка
- ✅ Push уведомления
- ✅ App shortcuts
- ✅ Installable
- ✅ Responsive design

## 🐛 Отладка

### Логи
```bash
# Включить debug режим
VITE_ENABLE_DEBUG=true npm run dev
```

### Производительность
- Используйте React DevTools Profiler
- Анализируйте bundle с `stats.html`
- Мониторьте Core Web Vitals

## 📈 Мониторинг

### Рекомендуемые сервисы
- **Sentry** - отслеживание ошибок
- **Vercel Analytics** - аналитика
- **Google Analytics** - пользовательская аналитика
- **LogRocket** - сессии пользователей

## 🤝 Вклад в проект

1. Fork репозиторий
2. Создайте feature branch
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 🆘 Поддержка

- 📧 Email: support@crm-pro.com
- 💬 Discord: [CRM Pro Community](https://discord.gg/crm-pro)
- 📖 Документация: [docs.crm-pro.com](https://docs.crm-pro.com)

---

**Сделано с ❤️ для мебельных мастерских**
# trigger rebuild
