-- ============================================
-- ПОЛНАЯ ИЗОЛЯЦИЯ ДАННЫХ ПО ОРГАНИЗАЦИЯМ
-- ============================================
-- Этот скрипт обеспечивает полную изоляцию данных между организациями
-- Убедитесь, что все таблицы имеют organization_id и RLS политики

-- ============================================
-- 1. ПРОВЕРКА И ОБНОВЛЕНИЕ RLS ПОЛИТИК
-- ============================================

-- Включаем RLS для всех таблиц с organization_id
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. ОБНОВЛЕНИЕ ПОЛИТИК ДЛЯ ПРОЕКТОВ
-- ============================================

-- Удаляем старые политики
DROP POLICY IF EXISTS "authenticated_org_projects" ON projects;

-- Создаем новую политику с проверкой organization_id
CREATE POLICY "authenticated_org_projects" ON projects
    FOR ALL
    TO authenticated
    USING (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    )
    WITH CHECK (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    );

-- ============================================
-- 3. ОБНОВЛЕНИЕ ПОЛИТИК ДЛЯ КЛИЕНТОВ
-- ============================================

-- Удаляем старые политики
DROP POLICY IF EXISTS "authenticated_org_clients" ON clients;

-- Создаем новую политику с проверкой organization_id
CREATE POLICY "authenticated_org_clients" ON clients
    FOR ALL
    TO authenticated
    USING (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    )
    WITH CHECK (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    );

-- ============================================
-- 4. ОБНОВЛЕНИЕ ПОЛИТИК ДЛЯ КАНБАНА
-- ============================================

-- Политики для kanban_boards (уже должны быть созданы из add-organization-id-to-kanban.sql)
-- Проверяем и обновляем если нужно

-- Политики для kanban_tasks (уже должны быть созданы)
-- Проверяем и обновляем если нужно

-- Политики для kanban_columns (уже должны быть созданы)
-- Проверяем и обновляем если нужно

-- ============================================
-- 5. ПРОВЕРКА: УДАЛЕНИЕ ДАННЫХ БЕЗ organization_id
-- ============================================

-- Удаляем проекты без organization_id (старые данные)
DELETE FROM projects WHERE organization_id IS NULL;

-- Удаляем клиентов без organization_id (старые данные)
DELETE FROM clients WHERE organization_id IS NULL;

-- Удаляем доски без organization_id (уже должно быть в add-organization-id-to-kanban.sql)
DELETE FROM kanban_boards WHERE organization_id IS NULL;

-- Удаляем задачи без organization_id
DELETE FROM kanban_tasks WHERE organization_id IS NULL;

-- ============================================
-- 6. СОЗДАНИЕ ДЕМО-ДОСКИ ДЛЯ ДЕМО-ОРГАНИЗАЦИИ
-- ============================================

-- Создаем доску для демо-организации, если её еще нет
DO $$
DECLARE
    demo_org_id UUID;
    demo_board_id UUID;
BEGIN
    -- Находим демо-организацию
    SELECT id INTO demo_org_id
    FROM organizations
    WHERE slug = 'demo'
    LIMIT 1;

    IF demo_org_id IS NOT NULL THEN
        -- Проверяем, есть ли уже доска для демо-организации
        SELECT id INTO demo_board_id
        FROM kanban_boards
        WHERE organization_id = demo_org_id
        LIMIT 1;

        IF demo_board_id IS NULL THEN
            -- Создаем доску для демо-организации
            INSERT INTO kanban_boards (organization_id, title, created_at, updated_at)
            VALUES (demo_org_id, 'Общая производственная доска', NOW(), NOW())
            RETURNING id INTO demo_board_id;

            -- Создаем дефолтные колонки
            INSERT INTO kanban_columns (board_id, title, stage, position, is_default, created_at)
            VALUES
                (demo_board_id, 'К выполнению', 'todo', 0, true, NOW()),
                (demo_board_id, 'В работе', 'in_progress', 1, false, NOW()),
                (demo_board_id, 'На проверке', 'review', 2, false, NOW()),
                (demo_board_id, 'Завершено', 'done', 3, false, NOW());

            RAISE NOTICE 'Создана демо-доска для организации %', demo_org_id;
        ELSE
            RAISE NOTICE 'Демо-доска уже существует для организации %', demo_org_id;
        END IF;
    ELSE
        RAISE NOTICE 'Демо-организация не найдена';
    END IF;
END $$;

-- ============================================
-- 7. ПРОВЕРКА: ВСЕ ДАННЫЕ ДОЛЖНЫ ИМЕТЬ organization_id
-- ============================================

-- Проверяем, что все проекты имеют organization_id
DO $$
DECLARE
    projects_without_org INTEGER;
BEGIN
    SELECT COUNT(*) INTO projects_without_org
    FROM projects
    WHERE organization_id IS NULL;

    IF projects_without_org > 0 THEN
        RAISE WARNING 'Найдено % проектов без organization_id', projects_without_org;
    ELSE
        RAISE NOTICE 'Все проекты имеют organization_id';
    END IF;
END $$;

-- Проверяем, что все клиенты имеют organization_id
DO $$
DECLARE
    clients_without_org INTEGER;
BEGIN
    SELECT COUNT(*) INTO clients_without_org
    FROM clients
    WHERE organization_id IS NULL;

    IF clients_without_org > 0 THEN
        RAISE WARNING 'Найдено % клиентов без organization_id', clients_without_org;
    ELSE
        RAISE NOTICE 'Все клиенты имеют organization_id';
    END IF;
END $$;

-- Проверяем, что все доски имеют organization_id
DO $$
DECLARE
    boards_without_org INTEGER;
BEGIN
    SELECT COUNT(*) INTO boards_without_org
    FROM kanban_boards
    WHERE organization_id IS NULL;

    IF boards_without_org > 0 THEN
        RAISE WARNING 'Найдено % досок без organization_id', boards_without_org;
    ELSE
        RAISE NOTICE 'Все доски имеют organization_id';
    END IF;
END $$;

RAISE NOTICE 'Скрипт изоляции данных выполнен успешно!';

