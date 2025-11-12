# Настройка автоматического деплоя на Vercel

## Проблема
Коммиты не автоматически деплоятся на Vercel.

## Решение

### 1. Проверьте подключение репозитория в Vercel

1. Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Откройте проект `crm-3-0`
3. Перейдите в **Settings** → **Git**
4. Убедитесь, что:
   - Репозиторий подключен: `perkyon/CRM3.0`
   - **Production Branch** установлен на `main`
   - **Auto-deploy** включен

### 2. Проверьте настройки деплоя

В **Settings** → **General**:
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Проверьте GitHub интеграцию

1. В Vercel Dashboard → **Settings** → **Git**
2. Убедитесь, что GitHub интеграция активна
3. Если нет, нажмите **Connect Git Repository** и выберите `perkyon/CRM3.0`

### 4. Проверьте webhook в GitHub

1. Зайдите в GitHub репозиторий `perkyon/CRM3.0`
2. Перейдите в **Settings** → **Webhooks**
3. Должен быть webhook от Vercel, который срабатывает при push

### 5. Ручной деплой (если нужно)

Если автоматический деплой не работает, можно сделать ручной деплой:

```bash
# Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# Войдите в Vercel
vercel login

# Деплой
vercel --prod
```

### 6. Проверьте логи деплоя

В Vercel Dashboard → **Deployments** можно посмотреть:
- Статус последних деплоев
- Логи сборки
- Ошибки, если они есть

## Быстрая проверка

Выполните в терминале:

```bash
# Проверьте, что все коммиты запушены
git log origin/main..HEAD

# Если есть неотправленные коммиты, отправьте их
git push origin main
```

## Если проблема сохраняется

1. Проверьте, что в Vercel Dashboard → **Settings** → **Git** указан правильный репозиторий
2. Попробуйте отключить и снова подключить репозиторий
3. Проверьте, что у Vercel есть доступ к репозиторию (GitHub permissions)

