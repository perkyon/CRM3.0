# 📊 Настройка мониторинга для CRM 3.0

## 🔍 Sentry - Отслеживание ошибок

### 1. Создание проекта в Sentry

1. **Перейдите на [sentry.io](https://sentry.io)**
2. **Войдите в аккаунт** или создайте новый
3. **Создайте новый проект:**
   - Platform: **React**
   - Project Name: `CRM-3.0`
   - Team: выберите вашу команду

### 2. Получение DSN

1. **После создания проекта:**
   - Скопируйте **DSN** из настроек проекта
   - Он выглядит как: `https://abc123@o123456.ingest.sentry.io/123456`

### 3. Настройка переменных окружения

**В Vercel Dashboard:**
1. Перейдите в **Settings** → **Environment Variables**
2. Добавьте:
   ```
   VITE_SENTRY_DSN = [ваш DSN из Sentry] https://ae7eba46f0ea5bc1fa7971d190bcd0e7@o4510110629691392.ingest.us.sentry.io/4510110635655168
   SENTRY_AUTH_TOKEN = [ваш Auth Token из Sentry]
   ```

**В GitHub Secrets (для CI/CD):**
1. Перейдите в **Settings** → **Secrets and variables** → **Actions**
2. Добавьте:
   ```
   SENTRY_AUTH_TOKEN = [ваш Auth Token из Sentry]
   ```

### 4. Получение Auth Token

1. **В Sentry Dashboard:**
   - Перейдите в **Settings** → **Auth Tokens**
   - Нажмите **"Create New Token"**
   - Scopes: выберите `project:releases` и `org:read`
   - Скопируйте токен

### 5. Настройка Source Maps

1. **Обновите `vite.config.ts`:**
   ```typescript
   sentryVitePlugin({
     org: 'your-org-name', // замените на ваше имя организации
     project: 'crm-3-0',
     authToken: process.env.SENTRY_AUTH_TOKEN,
     sourcemaps: {
       assets: './build/**',
     },
   }),
   ```

## 📈 Vercel Analytics - Аналитика

### 1. Включение Vercel Analytics

1. **В Vercel Dashboard:**
   - Перейдите в ваш проект `crm-3-0`
   - Перейдите в **"Analytics"**
   - Нажмите **"Enable Analytics"**

### 2. Настройка в коде

1. **Установите пакет:**
   ```bash
   npm install @vercel/analytics
   ```

2. **Добавьте в `main.tsx`:**
   ```typescript
   import { Analytics } from '@vercel/analytics/react';
   
   createRoot(document.getElementById("root")!).render(
     <ToastProvider>
       <ProjectProvider>
         <AppRouter />
         <Analytics />
       </ProjectProvider>
     </ToastProvider>
   );
   ```

### 3. Настройка Speed Insights

1. **Установите пакет:**
   ```bash
   npm install @vercel/speed-insights
   ```

2. **Добавьте в `main.tsx`:**
   ```typescript
   import { SpeedInsights } from '@vercel/speed-insights/react';
   
   createRoot(document.getElementById("root")!).render(
     <ToastProvider>
       <ProjectProvider>
         <AppRouter />
         <Analytics />
         <SpeedInsights />
       </ProjectProvider>
     </ToastProvider>
   );
   ```

## 🚨 Настройка алертов

### 1. Sentry Alerts

1. **В Sentry Dashboard:**
   - Перейдите в **Alerts** → **Create Alert Rule**
   - Настройте уведомления для:
     - Новых ошибок
     - Высокой частоты ошибок
     - Критических ошибок

2. **Интеграции:**
   - Slack
   - Email
   - Discord
   - Webhook

### 2. Vercel Alerts

1. **В Vercel Dashboard:**
   - Перейдите в **Settings** → **Notifications**
   - Настройте уведомления для:
     - Неудачных деплоев
     - Превышения лимитов
     - Проблем с доменом

## 📊 Мониторинг производительности

### 1. Core Web Vitals

Vercel Analytics автоматически отслеживает:
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)

### 2. Custom Metrics

Добавьте в код для отслеживания:
```typescript
import * as Sentry from '@sentry/react';

// Отслеживание пользовательских действий
Sentry.addBreadcrumb({
  message: 'User clicked button',
  category: 'user-action',
  level: 'info',
});

// Отслеживание производительности
Sentry.startTransaction({
  name: 'API Call',
  op: 'http.client',
});
```

## 🔧 Дополнительные настройки

### 1. Фильтрация ошибок

```typescript
// В sentry.client.config.ts
beforeSend(event) {
  // Фильтруем ошибки разработки
  if (import.meta.env.VITE_NODE_ENV === 'development') {
    return null;
  }
  
  // Фильтруем известные ошибки
  if (event.exception) {
    const error = event.exception.values[0];
    if (error?.value?.includes('ResizeObserver loop limit exceeded')) {
      return null;
    }
  }
  
  return event;
},
```

### 2. Контекст пользователя

```typescript
// Установка контекста пользователя
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});
```

### 3. Теги и контекст

```typescript
// Добавление тегов
Sentry.setTag('page', 'dashboard');
Sentry.setTag('user_role', 'admin');

// Добавление контекста
Sentry.setContext('user_preferences', {
  theme: 'dark',
  language: 'ru',
});
```

## 📱 Мобильный мониторинг

### 1. PWA мониторинг

```typescript
// Отслеживание PWA событий
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    Sentry.addBreadcrumb({
      message: 'Service Worker message',
      data: event.data,
    });
  });
}
```

### 2. Офлайн мониторинг

```typescript
// Отслеживание офлайн событий
window.addEventListener('online', () => {
  Sentry.addBreadcrumb({
    message: 'Connection restored',
    category: 'network',
  });
});

window.addEventListener('offline', () => {
  Sentry.addBreadcrumb({
    message: 'Connection lost',
    category: 'network',
  });
});
```

## 🎯 Результат

После настройки у вас будет:
- ✅ Отслеживание всех ошибок в реальном времени
- ✅ Аналитика пользователей и производительности
- ✅ Уведомления о критических проблемах
- ✅ Детальная информация о производительности
- ✅ Source maps для отладки
- ✅ PWA мониторинг (установка, Service Worker, офлайн режим)
- ✅ Core Web Vitals отслеживание (LCP, FID, CLS)
- ✅ API response time мониторинг
- ✅ Пользовательские события CRM системы
- ✅ Мониторинг сетевого статуса и ориентации устройства

## 📱 Дополнительные возможности

### Компонент статуса мониторинга
Добавьте в любую страницу для отображения статуса:
```tsx
import { MonitoringStatus } from '../components/monitoring/MonitoringStatus';

// В вашем компоненте
<MonitoringStatus className="w-full max-w-sm" />
```

### Пользовательские события
Используйте хук для отслеживания событий:
```tsx
import { useAnalytics, CRM_EVENTS } from '../lib/hooks/useAnalytics';

const { trackUserAction, trackEvent } = useAnalytics();

// Отслеживание действий пользователя
trackUserAction('button_clicked', { buttonName: 'create_client' });

// Отслеживание CRM событий
trackEvent({
  name: CRM_EVENTS.CLIENT_CREATED,
  properties: { clientType: 'ООО', source: 'manual' }
});
```

### Performance мониторинг
Автоматически отслеживается:
- Время загрузки страниц
- Время ответа API
- Core Web Vitals
- Ошибки сети
