# Проверка статуса деплоя

## Что проверить:

### 1. GitHub Actions
Зайдите в GitHub → `perkyon/CRM3.0` → **Actions**

Проверьте:
- Запустился ли workflow "CI/CD Pipeline" после последнего push (`7f30ac6`)
- Если запустился, откройте его и проверьте:
  - Выполнился ли job "Test" успешно?
  - Выполнился ли job "Deploy Production" успешно?
  - Если есть ошибки, какие именно?

### 2. Vercel Dashboard
Зайдите в Vercel Dashboard → проект `crm-3-0` → **Deployments**

Проверьте:
- Появился ли новый деплой с коммитом `7f30ac6`?
- Какой статус у деплоя (Ready, Building, Error)?

### 3. Если VERCEL_TOKEN устарел
Если workflow падает с ошибкой аутентификации:

1. Зайдите в Vercel Dashboard → **Settings** → **Tokens**
2. Создайте новый токен
3. Обновите в GitHub → **Settings** → **Secrets and variables** → **Actions** → **Secrets**
4. Нажмите на `VERCEL_TOKEN` → **Update** → вставьте новый токен

### 4. Если workflow не запускается
Проверьте:
- В GitHub → **Settings** → **Actions** → **General**
- Убедитесь, что "Allow all actions and reusable workflows" включен
- Или "Allow local actions and reusable workflows" включен

## Возможные проблемы:

1. **Workflow не запускается** → Проверьте настройки Actions в GitHub
2. **Workflow падает с ошибкой** → Проверьте логи в GitHub Actions
3. **Деплой не создается в Vercel** → Проверьте, что VERCEL_TOKEN не устарел
4. **Деплой создается, но не обновляется** → Проверьте настройки Production Branch в Vercel

