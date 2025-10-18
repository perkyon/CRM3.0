# Инструкция по применению SQL для производства

## Порядок применения

Применяй файлы **строго по порядку**:

### 1️⃣ Типы данных
```bash
psql -U postgres -d your_database -f production-1-types.sql
```

### 2️⃣ Таблицы
```bash
psql -U postgres -d your_database -f production-2-tables.sql
```

### 3️⃣ Индексы
```bash
psql -U postgres -d your_database -f production-3-indexes.sql
```

### 4️⃣ Триггеры
```bash
psql -U postgres -d your_database -f production-4-triggers.sql
```

### 5️⃣ Начальные данные
```bash
psql -U postgres -d your_database -f production-5-seed-data.sql
```

## Или все сразу

```bash
cd supabase
psql -U postgres -d your_database -f production-1-types.sql
psql -U postgres -d your_database -f production-2-tables.sql
psql -U postgres -d your_database -f production-3-indexes.sql
psql -U postgres -d your_database -f production-4-triggers.sql
psql -U postgres -d your_database -f production-5-seed-data.sql
```

## Через Supabase Dashboard

1. Открой **SQL Editor** в Supabase Dashboard
2. Скопируй содержимое каждого файла по порядку
3. Выполни каждый запрос

## Откат изменений

Если нужно удалить все:

```sql
-- Удаляем таблицы
DROP TABLE IF EXISTS subcomponent_files CASCADE;
DROP TABLE IF EXISTS subcomponent_materials CASCADE;
DROP TABLE IF EXISTS component_templates CASCADE;
DROP TABLE IF EXISTS production_stages CASCADE;
DROP TABLE IF EXISTS project_subcomponents CASCADE;
DROP TABLE IF EXISTS project_components CASCADE;

-- Удаляем типы
DROP TYPE IF EXISTS production_task_status;
DROP TYPE IF EXISTS production_stage_type;
DROP TYPE IF EXISTS subcomponent_type;
DROP TYPE IF EXISTS component_type;
```

## Этапы производства

Система включает **8 этапов**:

1. **ЧПУ/раскрой** - Резка материалов
2. **Предсборка** - Предварительная сборка деталей
3. **Шлифовка** - Обработка поверхностей
4. **Покраска** - Покрытие и финишная отделка
5. **Контроль качества** - Проверка качества
6. **Упаковка** - Упаковка готовых изделий
7. **Доставка** - Транспортировка клиенту
8. **Монтаж** - Установка на объекте

## Проверка

После применения проверь:

```sql
-- Проверяем типы
SELECT typname FROM pg_type WHERE typname LIKE '%component%' OR typname LIKE '%production%';

-- Проверяем таблицы
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'project_%' OR table_name LIKE 'component_%' OR table_name LIKE 'subcomponent_%';

-- Проверяем шаблоны
SELECT component_type, name FROM component_templates;
```
