# Исправление Output Directory в Vercel

## Проблема
В "Output Directory" указано `npm run vercel-build` вместо `dist`. Это вызывает предупреждение о несоответствии настроек.

## Решение

### В Vercel Dashboard → проект `crm-3-0` → Settings → Build and Deployment:

1. **В разделе "Project Settings":**
   - Найдите поле **"Output Directory"**
   - **Удалите** текущее значение `npm run vercel-build`
   - **Введите** `dist`
   - Убедитесь, что переключатель **"Override"** включен (ON, синий)
   - Нажмите **"Save"**

2. **Проверьте, что настройки совпадают:**

   **Project Settings:**
   - Build Command: `npm run vercel-build` (Override ON)
   - Output Directory: `dist` (Override ON) ✅

   **Production Overrides:**
   - Output Directory: `dist` (Override ON) ✅

3. После сохранения предупреждение должно исчезнуть.

## Если поле не позволяет ввести "dist":

1. Попробуйте очистить поле полностью (удалить все)
2. Введите `dist` заново
3. Убедитесь, что Override включен
4. Нажмите Save

Если все равно не работает, можно оставить как есть - Production Overrides имеют приоритет, и деплой должен работать.

