# 🚀 Быстрый старт

## 1. Создай новый проект Supabase
→ https://supabase.com/dashboard

## 2. Запусти 3 SQL скрипта по порядку:
```
supabase/01-create-database.sql   ← Схема БД
supabase/02-seed-data.sql         ← Тестовые данные
supabase/03-setup-storage.sql     ← Storage политики
```

## 3. Создай 2 storage buckets в UI:
- `client-documents` (Public ✅)
- `project-documents` (Public ✅)

## 4. Обнови `.env.local`:
```bash
VITE_SUPABASE_URL=https://твой-проект.supabase.co
VITE_SUPABASE_ANON_KEY=твой_ключ
```

## 5. Перезапусти:
```bash
pkill -f vite && npm run dev
```

## 6. Проверь:
```bash
node test-connection.js
```

---

**📖 Полная инструкция:** `NEW_DATABASE_SETUP.md`

