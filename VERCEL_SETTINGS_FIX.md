# Исправление настроек Vercel для автоматического деплоя

## Проблема
В Vercel есть несоответствие между Production Overrides и Project Settings.

## Что нужно сделать:

### 1. В Vercel Dashboard → проект `crm-3-0` → Settings → Build and Deployment

**Production Overrides:**
- Build Command: `npm run vercel-build` ✅ (правильно)
- Output Directory: `dist` ✅ (правильно)

**Project Settings:**
- Build Command: Должно быть `npm run vercel-build` (включите "Override" и установите)
- Output Directory: `dist` ✅ (правильно)

### 2. Убедитесь, что настройки совпадают:

**Build Command:** `npm run vercel-build`
**Output Directory:** `dist`
**Install Command:** (пусто или `npm install`)

### 3. Сохраните изменения

Нажмите кнопку **"Save"** внизу страницы.

## Почему это важно?

Если настройки не совпадают, Vercel может использовать разные команды для разных деплоев, что может вызывать проблемы с автоматическим деплоем через GitHub Actions.

## После исправления:

1. Сделайте тестовый коммит
2. Проверьте, что workflow в GitHub Actions проходит успешно
3. Проверьте, что деплой создается в Vercel

