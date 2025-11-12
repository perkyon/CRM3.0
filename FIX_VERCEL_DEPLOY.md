# Исправление автоматического деплоя на Vercel

## Проблема
В GitHub нет webhook от Vercel, поэтому автоматический деплой не работает.

## Решение

### Вариант 1: Переподключить репозиторий в Vercel (рекомендуется)

1. Зайдите в Vercel Dashboard → проект `crm-3-0` → **Settings** → **Git**
2. Нажмите **Disconnect** рядом с репозиторием
3. Нажмите **Connect Git Repository**
4. Выберите `perkyon/CRM3.0`
5. Vercel автоматически создаст webhook в GitHub

### Вариант 2: Добавить webhook вручную в GitHub

1. Зайдите в GitHub → `perkyon/CRM3.0` → **Settings** → **Webhooks**
2. Нажмите **Add webhook**
3. Заполните:
   - **Payload URL**: `https://api.vercel.com/v1/integrations/deploy/hook/[YOUR_DEPLOYMENT_HOOK_ID]`
   - **Content type**: `application/json`
   - **Secret**: (оставьте пустым или получите из Vercel)
   - **Which events**: Выберите "Just the push event"
4. Нажмите **Add webhook**

**Примечание**: Лучше использовать Вариант 1, так как Vercel автоматически настроит все правильно.

### Вариант 3: Проверить настройки GitHub App

1. В Vercel → **Settings** → **Git** проверьте, что используется GitHub App (не OAuth)
2. Если используется OAuth, отключите и подключите через GitHub App

## После исправления

1. Сделайте тестовый коммит:
   ```bash
   git commit --allow-empty -m "test: проверка автоматического деплоя"
   git push origin main
   ```

2. Проверьте в Vercel → **Deployments**, что появился новый деплой

3. Проверьте в GitHub → **Settings** → **Webhooks**, что появился webhook от Vercel

