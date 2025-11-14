# Синхронизация настроек Vercel

## Проблема
Предупреждение "Configuration Settings in the current Production deployment differ from your current Project Settings" не исчезает.

## Причина

Согласно [документации Vercel](https://vercel.com/docs/deployments/configure-a-build#build-and-development-settings):

- **Production Overrides** - это настройки для **текущего** production deployment
- **Project Settings** - это настройки по умолчанию для **всех новых** deployments

Если они отличаются, показывается предупреждение.

## Решение

### Вариант 1: Обновить Production Overrides (рекомендуется)

1. Раскройте раздел **"Production Overrides"**
2. Проверьте все настройки:
   - Build Command
   - Output Directory
   - Install Command
3. Убедитесь, что они совпадают с **Project Settings**
4. Если отличаются - обновите их, чтобы совпадали
5. Сохраните изменения

### Вариант 2: Сделать новый деплой

После того, как Project Settings исправлены, следующий деплой будет использовать новые настройки, и предупреждение исчезнет.

### Вариант 3: Игнорировать предупреждение

Если настройки в Project Settings правильные, предупреждение не критично. Оно просто информирует, что текущий production deployment был создан со старыми настройками.

## Что проверить:

Сравните эти настройки между Production Overrides и Project Settings:

| Настройка | Production Overrides | Project Settings | Совпадает? |
|-----------|---------------------|------------------|------------|
| Build Command | ? | `npm run vercel-build` | ? |
| Output Directory | `dist` | `dist` | ✅ |
| Install Command | ? | (по умолчанию) | ? |

Если все совпадает, предупреждение исчезнет после следующего деплоя.

