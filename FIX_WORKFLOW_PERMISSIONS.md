# Исправление прав Workflow для деплоя

## Проблема
В настройках GitHub Actions выбрано "Read repository contents and packages permissions", что недостаточно для деплоя на Vercel.

## Решение

1. Зайдите в GitHub → `perkyon/CRM3.0` → **Settings** → **Actions** → **General**
2. Найдите раздел **"Workflow permissions"**
3. Выберите **"Read and write permissions"** (вместо "Read repository contents and packages permissions")
4. Нажмите **"Save"**

## Почему это нужно?

Для деплоя на Vercel через GitHub Actions workflow нужны права на запись, чтобы:
- Создавать deployments
- Обновлять статусы деплоев
- Взаимодействовать с Vercel API

После изменения прав, следующий push в `main` должен автоматически запустить деплой.

