# Исправление Output Directory в Vercel

## Проблема
Не удается сохранить Output Directory как "dist" в Project Settings.

## Решение

### Вариант 1: Оставить как есть (рекомендуется)

Если в **Production Overrides** уже указано:
- Output Directory: `dist` (Override ON) ✅

То это достаточно! Production Overrides имеют приоритет над Project Settings для production деплоев.

### Вариант 2: Проверить через vercel.json

В файле `vercel.json` уже указано:
```json
{
  "outputDirectory": "dist"
}
```

Это должно работать автоматически.

### Вариант 3: Если все равно не работает

1. Попробуйте очистить кеш браузера и обновить страницу
2. Попробуйте сохранить через другой браузер
3. Проверьте, нет ли ошибок в консоли браузера (F12)

## Главное - проверить Build Command

Самое важное - убедиться, что **Build Command** в Project Settings:
- Значение: `npm run vercel-build`
- Override: **ON** (включен)

Output Directory в Production Overrides уже правильно настроен, так что это не критично.

