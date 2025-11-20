-- ============================================
-- ИСПРАВЛЕНИЕ РЕКУРСИИ В RLS ПОЛИТИКАХ ДЛЯ USERS
-- ============================================
-- Проблема: политики для users ссылаются на organization_members,
-- что создает рекурсию, если политики organization_members ссылаются на users.
-- Решение: используем функции is_org_admin и is_org_member для проверки без рекурсии.

-- Убедимся, что функции существуют (они должны быть созданы из fix-organization-members-rls-recursion.sql)
-- Если их нет, создадим их здесь

CREATE OR REPLACE FUNCTION is_org_admin(p_user_id UUID, p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM organization_members om
        WHERE om.organization_id = p_org_id
          AND om.user_id = p_user_id
          AND om.role = 'Admin'
          AND om.active = true
    );
END;
$$;

CREATE OR REPLACE FUNCTION is_org_member(p_user_id UUID, p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM organization_members om
        WHERE om.organization_id = p_org_id
          AND om.user_id = p_user_id
          AND om.active = true
    );
END;
$$;

-- Функция для получения организаций пользователя
CREATE OR REPLACE FUNCTION get_user_org_ids(p_user_id UUID)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN ARRAY(
        SELECT organization_id
        FROM organization_members
        WHERE user_id = p_user_id
          AND active = true
    );
END;
$$;

-- Удаляем старые политики для users
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON users;
DROP POLICY IF EXISTS "users_can_read_own_profile" ON users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON users;
DROP POLICY IF EXISTS "users_can_read_org_members" ON users;
DROP POLICY IF EXISTS "admins_can_read_all_org_users" ON users;

-- 1. Пользователи могут создавать свой собственный профиль
CREATE POLICY "users_can_insert_own_profile" ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- 2. Пользователи могут читать свой собственный профиль
CREATE POLICY "users_can_read_own_profile" ON users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- 3. Пользователи могут обновлять свой собственный профиль
CREATE POLICY "users_can_update_own_profile" ON users
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 4. Пользователи могут читать профили других пользователей своей организации
-- Используем функцию get_user_org_ids для получения списка организаций без рекурсии
CREATE POLICY "users_can_read_org_members" ON users
    FOR SELECT
    TO authenticated
    USING (
        -- Свой профиль
        id = auth.uid()
        OR
        -- Или пользователь из той же организации
        EXISTS (
            SELECT 1
            FROM organization_members om1
            JOIN organization_members om2 ON om1.organization_id = om2.organization_id
            WHERE om1.user_id = auth.uid()
              AND om2.user_id = users.id
              AND om1.active = true
              AND om2.active = true
        )
    );

-- 5. Админы могут читать всех пользователей своей организации
-- Используем функцию is_org_admin для проверки без рекурсии
CREATE POLICY "admins_can_read_all_org_users" ON users
    FOR SELECT
    TO authenticated
    USING (
        -- Свой профиль
        id = auth.uid()
        OR
        -- Или админ может видеть пользователей из своих организаций
        EXISTS (
            SELECT 1
            FROM organization_members om_admin
            JOIN organization_members om_user ON om_admin.organization_id = om_user.organization_id
            WHERE om_admin.user_id = auth.uid()
              AND om_user.user_id = users.id
              AND om_admin.role = 'Admin'
              AND om_admin.active = true
              AND om_user.active = true
        )
    );

-- Примечание: Политики 4 и 5 все еще используют прямые запросы к organization_members,
-- но это безопасно, так как политики для organization_members теперь используют
-- функции SECURITY DEFINER, которые обходят RLS и не создают рекурсию.

