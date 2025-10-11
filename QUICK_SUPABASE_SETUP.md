# 🚀 Быстрая настройка Supabase для CRM

## Проблемы которые нужно исправить:

### ❌ Ошибки при сохранении клиентов/проектов
### ❌ CORS ошибки  
### ❌ "Сетевое соединение потеряно"

## ✅ Решение - выполните эти шаги:

### Шаг 1: Откройте Supabase SQL Editor

1. Перейдите на https://supabase.com/dashboard
2. Выберите ваш проект `xhclmypcklndxqzkhgfk`
3. Откройте **SQL Editor** в левом меню

### Шаг 2: Отключите RLS (Row Level Security)

Скопируйте и выполните содержимое файла `supabase/disable-rls.sql`:

```sql
-- DISABLE RLS TEMPORARILY FOR DEVELOPMENT
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_tasks DISABLE ROW LEVEL SECURITY;
```

### Шаг 3: Создайте тестовых пользователей

Выполните `supabase/seed-data.sql` для создания тестовых пользователей

### Шаг 4: Проверьте подключение

В консоли браузера выполните:
```javascript
window.supabase // Должен показать объект Supabase client
debugKanban() // Тест подключения канбана
```

## 🔍 Диагностика проблем:

Откройте консоль браузера (F12) и посмотрите на ошибки. 

**Частые проблемы:**
- `401 Unauthorized` → проблема с API ключом
- `403 Forbidden` → RLS блокирует доступ
- `400 Bad Request` → неверные данные или enum
- `CORS error` → проблема с доменом

## 📝 Текущие ключи:

```
URL: https://xhclmypcklndxqzkhgfk.supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Эти ключи уже прописаны в `src/lib/supabase/config.ts`

## 🎯 После настройки все заработает:

- ✅ Сохранение клиентов
- ✅ Сохранение проектов  
- ✅ Загрузка документов
- ✅ Real-time обновления
- ✅ Коллаборация между пользователями
