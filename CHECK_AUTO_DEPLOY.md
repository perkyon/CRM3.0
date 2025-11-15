# Проверка автоматического деплоя

## Что проверить в Vercel:

### 1. Settings → General
- **Production Branch**: должен быть `main` (не `master`, не `Main`)
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`

### 2. Settings → Git
- ✅ Репозиторий подключен: `perkyon/CRM3.0`
- ✅ Auto-deploy должен быть включен (но его не видно в интерфейсе)

### 3. Проверь Production Branch
В Vercel Dashboard → Settings → General проверь:
- **Production Branch** = `main`

Если там указана другая ветка (например `master`), измени на `main`.

### 4. Проверь последние доставки webhook
В GitHub → Settings → Webhooks → выбери webhook → Recent Deliveries:
- Все доставки должны быть успешными (зеленые)
- Если есть ошибки - это проблема

### 5. Попробуй переподключить репозиторий
Если ничего не помогает:
1. Vercel → Settings → Git → Disconnect
2. Connect Git Repository → выбери `perkyon/CRM3.0` снова
3. Это пересоздаст webhook и может исправить проблему

