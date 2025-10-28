# 🚀 Инструкция по настройке CRM системы

## Обязательные SQL скрипты для Supabase

Выполни эти скрипты **по порядку** в Supabase SQL Editor:

### 1️⃣ Отключить RLS (Row Level Security)
**Файл:** `supabase/disable-all-rls.sql`

Это временно отключит политики безопасности для разработки.

```sql
-- Отключает RLS на всех таблицах
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
-- и т.д.
```

---

### 2️⃣ Обновить enum для этапов проекта
**Файл:** `supabase/update-project-stages-enum.sql`

Добавляет новые этапы проекта в базу данных.

```sql
-- Добавляет:
-- - preliminary_design
-- - client_approval
-- - tech_approval
-- - quality_check
-- - packaging
-- - delivery
-- - installation
-- - completed
-- - cancelled
```

⏱️ **Подожди 1-2 секунды после выполнения!**

---

### 3️⃣ (Опционально) Обновить существующие проекты
**Файл:** `supabase/update-project-stages-step2.sql`

Обновляет старые значения этапов в существующих проектах.

```sql
-- Обновляет:
-- design → preliminary_design
-- done → completed
```

---

### 4️⃣ Добавить тестовых пользователей
**Файл:** `supabase/add-test-users.sql`

Добавляет пользователей для работы с системой.

```sql
-- Добавляет 6 пользователей:
-- 3 Менеджера
-- 2 Мастера
-- 1 Администратор
```

---

### 5️⃣ Добавить тестовых клиентов
**Файл:** `supabase/add-test-clients.sql`

Добавляет клиентов для создания проектов.

```sql
-- Добавляет 5 клиентов:
-- Физлицо, ООО, ИП, Самозанятый, и еще одно ООО
```

---

## Проверка

После выполнения скриптов проверь:

### ✅ Проверка пользователей
```sql
SELECT id, name, email, role, active FROM users;
```

Должно показать 6 пользователей.

### ✅ Проверка клиентов
```sql
SELECT id, name, company, type, phone FROM clients;
```

Должно показать 5 клиентов.

### ✅ Проверка этапов
```sql
SELECT enumlabel as stage_value 
FROM pg_enum 
WHERE enumtypid = 'project_stage'::regtype 
ORDER BY enumsortorder;
```

Должно показать все новые этапы.

---

## Возможные проблемы

### ❌ Проблема: "Column position does not exist"
✅ **Решение:** Используй обновленный `add-test-users.sql` (уже исправлено)

### ❌ Проблема: "Unsafe use of new value"
✅ **Решение:** Подожди 1-2 секунды между выполнением скриптов 2 и 3

### ❌ Проблема: "Failed to load resource: 403"
✅ **Решение:** Выполни скрипт `disable-all-rls.sql`

### ❌ Проблема: "Сетевое соединение потеряно"
✅ **Решение:** 
1. Проверь интернет
2. Проверь что Supabase проект активен
3. Перезагрузи страницу

---

## После настройки

1. 🔄 **Перезагрузи страницу** (Cmd+R)
2. ✅ Попробуй создать новый проект
3. ✅ Проверь что менеджеры появились в селекте
4. ✅ Проверь что можно менять этапы проекта

---

## Дополнительные скрипты (если нужны)

### Проверка структуры таблицы users
**Файл:** `supabase/check-users-structure.sql`

### Проверка существующих пользователей
**Файл:** `supabase/check-users.sql`

---

**Всё готово!** После выполнения всех скриптов система должна работать корректно. 🎉

