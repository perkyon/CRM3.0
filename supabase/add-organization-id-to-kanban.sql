-- ============================================
-- ДОБАВЛЕНИЕ organization_id В КАНБАН ТАБЛИЦЫ
-- ============================================
-- Этот скрипт добавляет organization_id в kanban_boards и kanban_tasks
-- для изоляции данных по организациям

-- 1. Добавляем organization_id в kanban_boards
ALTER TABLE kanban_boards 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Создаем индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_kanban_boards_org_id ON kanban_boards(organization_id);

-- 2. Для существующих досок устанавливаем organization_id из project_id
-- (если доска привязана к проекту)
UPDATE kanban_boards kb
SET organization_id = p.organization_id
FROM projects p
WHERE kb.project_id = p.id
  AND kb.organization_id IS NULL;

-- 3. Для общих досок (project_id = NULL) устанавливаем organization_id
-- из первой организации пользователя, который создал доску
-- (используем created_at как приблизительный индикатор)
UPDATE kanban_boards kb
SET organization_id = (
    SELECT om.organization_id
    FROM organization_members om
    JOIN users u ON u.id = om.user_id
    WHERE om.active = true
    ORDER BY om.joined_at ASC
    LIMIT 1
)
WHERE kb.organization_id IS NULL
  AND kb.project_id IS NULL;

-- 4. Если все еще есть доски без organization_id, удаляем их
-- (это старые данные, которые не могут быть привязаны к организации)
DELETE FROM kanban_boards WHERE organization_id IS NULL;

-- 5. Делаем organization_id обязательным
ALTER TABLE kanban_boards 
ALTER COLUMN organization_id SET NOT NULL;

-- 6. Добавляем organization_id в kanban_tasks
-- (через связь с board_id)
ALTER TABLE kanban_tasks 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Создаем индекс
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_org_id ON kanban_tasks(organization_id);

-- 7. Устанавливаем organization_id для существующих задач из board_id
UPDATE kanban_tasks kt
SET organization_id = kb.organization_id
FROM kanban_boards kb
WHERE kt.board_id = kb.id
  AND kt.organization_id IS NULL;

-- 8. Если все еще есть задачи без organization_id, удаляем их
DELETE FROM kanban_tasks WHERE organization_id IS NULL;

-- 9. Делаем organization_id обязательным для задач
ALTER TABLE kanban_tasks 
ALTER COLUMN organization_id SET NOT NULL;

-- ============================================
-- RLS ПОЛИТИКИ ДЛЯ КАНБАН ТАБЛИЦ
-- ============================================

-- Включаем RLS для kanban_boards
ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики, если есть
DROP POLICY IF EXISTS "users_can_read_org_boards" ON kanban_boards;
DROP POLICY IF EXISTS "users_can_create_org_boards" ON kanban_boards;
DROP POLICY IF EXISTS "users_can_update_org_boards" ON kanban_boards;
DROP POLICY IF EXISTS "users_can_delete_org_boards" ON kanban_boards;

-- Пользователи могут читать доски своей организации
CREATE POLICY "users_can_read_org_boards" ON kanban_boards
    FOR SELECT
    TO authenticated
    USING (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    );

-- Пользователи могут создавать доски в своей организации
CREATE POLICY "users_can_create_org_boards" ON kanban_boards
    FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    );

-- Пользователи могут обновлять доски своей организации
CREATE POLICY "users_can_update_org_boards" ON kanban_boards
    FOR UPDATE
    TO authenticated
    USING (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    )
    WITH CHECK (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    );

-- Пользователи могут удалять доски своей организации
CREATE POLICY "users_can_delete_org_boards" ON kanban_boards
    FOR DELETE
    TO authenticated
    USING (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    );

-- Включаем RLS для kanban_tasks
ALTER TABLE kanban_tasks ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики, если есть
DROP POLICY IF EXISTS "users_can_read_org_tasks" ON kanban_tasks;
DROP POLICY IF EXISTS "users_can_create_org_tasks" ON kanban_tasks;
DROP POLICY IF EXISTS "users_can_update_org_tasks" ON kanban_tasks;
DROP POLICY IF EXISTS "users_can_delete_org_tasks" ON kanban_tasks;

-- Пользователи могут читать задачи своей организации
CREATE POLICY "users_can_read_org_tasks" ON kanban_tasks
    FOR SELECT
    TO authenticated
    USING (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    );

-- Пользователи могут создавать задачи в своей организации
CREATE POLICY "users_can_create_org_tasks" ON kanban_tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    );

-- Пользователи могут обновлять задачи своей организации
CREATE POLICY "users_can_update_org_tasks" ON kanban_tasks
    FOR UPDATE
    TO authenticated
    USING (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    )
    WITH CHECK (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    );

-- Пользователи могут удалять задачи своей организации
CREATE POLICY "users_can_delete_org_tasks" ON kanban_tasks
    FOR DELETE
    TO authenticated
    USING (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    );

-- Включаем RLS для kanban_columns
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики, если есть
DROP POLICY IF EXISTS "users_can_read_org_columns" ON kanban_columns;
DROP POLICY IF EXISTS "users_can_create_org_columns" ON kanban_columns;
DROP POLICY IF EXISTS "users_can_update_org_columns" ON kanban_columns;
DROP POLICY IF EXISTS "users_can_delete_org_columns" ON kanban_columns;

-- Пользователи могут читать колонки досок своей организации
CREATE POLICY "users_can_read_org_columns" ON kanban_columns
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM kanban_boards kb
            WHERE kb.id = kanban_columns.board_id
              AND kb.organization_id IS NOT NULL
              AND user_has_access_to_org(auth.uid(), kb.organization_id)
        )
    );

-- Пользователи могут создавать колонки в досках своей организации
CREATE POLICY "users_can_create_org_columns" ON kanban_columns
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM kanban_boards kb
            WHERE kb.id = kanban_columns.board_id
              AND kb.organization_id IS NOT NULL
              AND user_has_access_to_org(auth.uid(), kb.organization_id)
        )
    );

-- Пользователи могут обновлять колонки досок своей организации
CREATE POLICY "users_can_update_org_columns" ON kanban_columns
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM kanban_boards kb
            WHERE kb.id = kanban_columns.board_id
              AND kb.organization_id IS NOT NULL
              AND user_has_access_to_org(auth.uid(), kb.organization_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM kanban_boards kb
            WHERE kb.id = kanban_columns.board_id
              AND kb.organization_id IS NOT NULL
              AND user_has_access_to_org(auth.uid(), kb.organization_id)
        )
    );

-- Пользователи могут удалять колонки досок своей организации
CREATE POLICY "users_can_delete_org_columns" ON kanban_columns
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM kanban_boards kb
            WHERE kb.id = kanban_columns.board_id
              AND kb.organization_id IS NOT NULL
              AND user_has_access_to_org(auth.uid(), kb.organization_id)
        )
    );

