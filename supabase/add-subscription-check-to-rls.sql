-- ============================================
-- 🔒 ДОБАВЛЕНИЕ ПРОВЕРКИ ПОДПИСКИ В RLS ПОЛИТИКИ
-- ============================================
-- Ограничиваем доступ к данным для неоплаченных организаций

-- ============================================
-- 1. ФУНКЦИЯ ДЛЯ ПРОВЕРКИ АКТИВНОЙ ПОДПИСКИ
-- ============================================

CREATE OR REPLACE FUNCTION org_has_active_subscription(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Проверяем организацию
    RETURN EXISTS (
        SELECT 1
        FROM organizations o
        LEFT JOIN subscriptions s ON s.organization_id = o.id
        WHERE o.id = org_id
          AND o.status = 'active'  -- Организация активна
          AND (
              -- 1. Enterprise план = безлимитный доступ (всегда разрешен)
              (o.plan = 'enterprise' OR (s.plan = 'enterprise' AND s.status = 'active'))
              OR
              -- 2. Специальная организация "Buro" = безлимитный доступ
              (o.slug = 'buro' OR o.name ILIKE '%Buro%')
              OR
              -- 3. Обычная проверка подписки
              (
                  s.status IN ('active', 'trialing')
                  AND (
                      -- Если триал - проверяем что не истек
                      (s.status = 'trialing' AND o.trial_ends_at > NOW())
                      OR
                      -- Если активная подписка - проверяем период (или период NULL = безлимит)
                      (s.status = 'active' AND (
                          s.current_period_end IS NULL 
                          OR s.current_period_end > NOW()
                      ))
                  )
              )
          )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. ОБНОВЛЕНИЕ ПОЛИТИК ДЛЯ CLIENTS
-- ============================================

-- Удаляем старые политики
DROP POLICY IF EXISTS "authenticated_org_clients" ON clients;
DROP POLICY IF EXISTS "authenticated_org_clients_with_subscription" ON clients;

-- Создаем новую с проверкой подписки
CREATE POLICY "authenticated_org_clients_with_subscription" ON clients
    FOR ALL
    TO authenticated
    USING (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id) AND
        org_has_active_subscription(organization_id)  -- ✅ ПРОВЕРКА ПОДПИСКИ
    )
    WITH CHECK (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id) AND
        org_has_active_subscription(organization_id)  -- ✅ ПРОВЕРКА ПОДПИСКИ
    );

-- ============================================
-- 3. ОБНОВЛЕНИЕ ПОЛИТИК ДЛЯ PROJECTS
-- ============================================

-- Удаляем старые политики
DROP POLICY IF EXISTS "authenticated_org_projects" ON projects;
DROP POLICY IF EXISTS "authenticated_org_projects_with_subscription" ON projects;

-- Создаем новую с проверкой подписки
CREATE POLICY "authenticated_org_projects_with_subscription" ON projects
    FOR ALL
    TO authenticated
    USING (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id) AND
        org_has_active_subscription(organization_id)  -- ✅ ПРОВЕРКА ПОДПИСКИ
    )
    WITH CHECK (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id) AND
        org_has_active_subscription(organization_id)  -- ✅ ПРОВЕРКА ПОДПИСКИ
    );

-- ============================================
-- 4. ОБНОВЛЕНИЕ ПОЛИТИК ДЛЯ KANBAN (если RLS включен)
-- ============================================

-- Для kanban_boards
DROP POLICY IF EXISTS "authenticated_org_kanban_boards" ON kanban_boards;
DROP POLICY IF EXISTS "authenticated_org_kanban_boards_with_subscription" ON kanban_boards;
CREATE POLICY "authenticated_org_kanban_boards_with_subscription" ON kanban_boards
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = kanban_boards.project_id
              AND p.organization_id IS NOT NULL
              AND user_has_access_to_org(auth.uid(), p.organization_id)
              AND org_has_active_subscription(p.organization_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = kanban_boards.project_id
              AND p.organization_id IS NOT NULL
              AND user_has_access_to_org(auth.uid(), p.organization_id)
              AND org_has_active_subscription(p.organization_id)
        )
    );

-- Для kanban_tasks
DROP POLICY IF EXISTS "authenticated_org_kanban_tasks" ON kanban_tasks;
DROP POLICY IF EXISTS "authenticated_org_kanban_tasks_with_subscription" ON kanban_tasks;
CREATE POLICY "authenticated_org_kanban_tasks_with_subscription" ON kanban_tasks
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = kanban_tasks.project_id
              AND p.organization_id IS NOT NULL
              AND user_has_access_to_org(auth.uid(), p.organization_id)
              AND org_has_active_subscription(p.organization_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = kanban_tasks.project_id
              AND p.organization_id IS NOT NULL
              AND user_has_access_to_org(auth.uid(), p.organization_id)
              AND org_has_active_subscription(p.organization_id)
        )
    );

-- Для production_items
DROP POLICY IF EXISTS "authenticated_org_production_items" ON production_items;
DROP POLICY IF EXISTS "authenticated_org_production_items_with_subscription" ON production_items;
CREATE POLICY "authenticated_org_production_items_with_subscription" ON production_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = production_items.project_id
              AND p.organization_id IS NOT NULL
              AND user_has_access_to_org(auth.uid(), p.organization_id)
              AND org_has_active_subscription(p.organization_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = production_items.project_id
              AND p.organization_id IS NOT NULL
              AND user_has_access_to_org(auth.uid(), p.organization_id)
              AND org_has_active_subscription(p.organization_id)
        )
    );

-- ============================================
-- 5. КОММЕНТАРИИ
-- ============================================

COMMENT ON FUNCTION org_has_active_subscription IS 
'Проверяет, есть ли у организации активная подписка. 
Enterprise план и организация "Buro" = безлимитный доступ (всегда разрешен).
Для остальных - проверка активной подписки или триала.';

-- ============================================
-- ✅ ГОТОВО!
-- ============================================
-- Теперь неоплаченные организации не смогут:
-- - Создавать клиентов
-- - Создавать проекты
-- - Создавать задачи
-- - Читать данные (если подписка истекла)
-- ============================================

