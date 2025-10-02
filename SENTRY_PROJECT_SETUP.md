# 🔍 Настройка Sentry проекта для CRM 3.0

## ❌ Проблема
Sentry Vite Plugin не может найти проект `crm-3-0` в организации `buro-hi`.

## ✅ Решение

### 1. **Создайте проект в Sentry:**

1. **Перейдите на [sentry.io](https://sentry.io)**
2. **Войдите в организацию `buro-hi`**
3. **Создайте новый проект:**
   - Нажмите **"Create Project"**
   - Platform: **React**
   - Project Name: **`crm-3-0`** (точно как в конфиге)
   - Team: выберите существующую

### 2. **Получите правильные данные:**

После создания проекта:
- **DSN:** скопируйте из Settings → Client Keys
- **Project Slug:** должен быть `crm-3-0`
- **Organization Slug:** должен быть `buro-hi`

### 3. **Обновите переменные в Vercel:**

```bash
VITE_SENTRY_DSN = https://[ваш-ключ]@o[org-id].ingest.sentry.io/[project-id]
VITE_SENTRY_ORG = buro-hi
SENTRY_AUTH_TOKEN = [ваш токен]
```

### 4. **Включите Sentry Vite Plugin:**

После создания проекта раскомментируйте в `vite.config.ts`:

```typescript
sentryVitePlugin({
  org: 'buro-hi',
  project: 'crm-3-0', // Точно как называется проект в Sentry
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: {
    assets: './build/**',
  },
}),
```

## 🚀 Текущий статус

**Sentry временно работает без plugin:**
- ✅ Отслеживание ошибок работает
- ✅ Performance мониторинг активен
- ❌ Source maps не загружаются (нужен plugin)

## 📋 Следующие шаги

1. **Создайте проект `crm-3-0` в Sentry**
2. **Обновите VITE_SENTRY_DSN в Vercel**
3. **Включите plugin в vite.config.ts**
4. **Перезапустите деплой**

## 🎯 После настройки

У вас будет полный Sentry мониторинг:
- ✅ Отслеживание ошибок
- ✅ Performance данные
- ✅ Source maps для отладки
- ✅ Session Replay
