# Как узнать, какие настройки отличаются в Vercel

## Проблема
Предупреждение: "Configuration Settings in the current Production deployment differ from your current Project Settings."

## Как проверить различия:

### 1. Раскройте оба раздела:

**Production Overrides:**
- Нажмите на стрелку слева от "Production Overrides"
- Посмотрите все значения

**Project Settings:**
- Нажмите на стрелку слева от "Project Settings"  
- Посмотрите все значения

### 2. Сравните значения:

Сравните каждое поле между двумя разделами:

| Поле | Production Overrides | Project Settings | Совпадает? |
|------|---------------------|------------------|------------|
| Build Command | ? | `npm run vercel-build` | ? |
| Output Directory | `dist` | `npm run vercel-build` ❌ | **НЕТ!** |
| Install Command | ? | (по умолчанию) | ? |

### 3. Что видно из вашего скриншота:

**Проблема найдена!**

- **Production Overrides → Output Directory:** `dist` ✅ (правильно)
- **Project Settings → Output Directory:** `npm run vercel-build` ❌ (неправильно!)

**В поле Output Directory указана команда сборки вместо пути к папке!**

## Решение:

1. В разделе **"Project Settings"** найдите поле **"Output Directory"**
2. Удалите значение `npm run vercel-build`
3. Введите `dist`
4. Убедитесь, что переключатель **"Override"** включен (ON)
5. Нажмите **"Save"**

После этого настройки совпадут и предупреждение исчезнет.

