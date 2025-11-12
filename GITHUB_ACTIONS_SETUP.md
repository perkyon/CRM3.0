# Настройка автоматического деплоя через GitHub Actions

## Проблема
Автоматический деплой через Vercel Git интеграцию не работает.

## Решение: GitHub Actions

Я создал файл `.github/workflows/deploy-vercel.yml` для автоматического деплоя через GitHub Actions.

### Шаги настройки:

1. **Получите Vercel Token:**
   - Зайдите в Vercel Dashboard → **Settings** → **Tokens**
   - Создайте новый токен (или используйте существующий)
   - Скопируйте токен

2. **Получите Vercel Project ID и Org ID:**
   - Зайдите в Vercel Dashboard → проект `crm-3-0` → **Settings** → **General**
   - Найдите **Project ID** (скопируйте)
   - Найдите **Team ID** или **Org ID** (скопируйте)

3. **Добавьте Secrets в GitHub:**
   - Зайдите в GitHub → `perkyon/CRM3.0` → **Settings** → **Secrets and variables** → **Actions**
   - Нажмите **New repository secret**
   - Добавьте три секрета:
     - `VERCEL_TOKEN` - токен из шага 1
     - `VERCEL_ORG_ID` - Org ID из шага 2
     - `VERCEL_PROJECT_ID` - Project ID из шага 2

4. **Проверьте работу:**
   - Сделайте коммит и push в `main`
   - Зайдите в GitHub → **Actions**
   - Должен запуститься workflow "Deploy to Vercel"
   - После успешного выполнения будет создан деплой в Vercel

## Альтернатива: Проверьте настройки Vercel Git интеграции

Если хотите использовать встроенную интеграцию Vercel:

1. В Vercel Dashboard → проект `crm-3-0` → **Settings** → **Git**
2. Убедитесь, что:
   - Репозиторий подключен
   - **Production Branch** = `main`
   - **Auto-deploy** включен
3. Если что-то не так, отключите и снова подключите репозиторий

