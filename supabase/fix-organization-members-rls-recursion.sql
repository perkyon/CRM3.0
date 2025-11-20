-- ============================================
-- ИСПРАВЛЕНИЕ РЕКУРСИИ В RLS ПОЛИТИКАХ ДЛЯ ORGANIZATION_MEMBERS
-- ============================================
-- Проблема: политики ссылаются на саму таблицу organization_members,
-- что создает бесконечную рекурсию при проверке доступа.
-- Решение: используем функцию SECURITY DEFINER для обхода RLS при проверке членства.

-- 1. Создаем функцию для проверки, является ли пользователь админом организации
-- Эта функция выполняется с правами создателя (SECURITY DEFINER),
-- поэтому обходит RLS и может читать organization_members без рекурсии
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

-- 2. Создаем функцию для проверки, является ли пользователь членом организации
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

-- 3. Удаляем старые политики для organization_members
DROP POLICY IF EXISTS "users_can_create_memberships" ON organization_members;
DROP POLICY IF EXISTS "users_can_read_own_memberships" ON organization_members;
DROP POLICY IF EXISTS "admins_can_manage_members" ON organization_members;
DROP POLICY IF EXISTS "admins_can_insert_members" ON organization_members;
DROP POLICY IF EXISTS "admins_can_update_members" ON organization_members;
DROP POLICY IF EXISTS "admins_can_delete_members" ON organization_members;
DROP POLICY IF EXISTS "users_can_insert_own_membership" ON organization_members;
DROP POLICY IF EXISTS "users_see_own_memberships" ON organization_members;

-- 4. Создаем новые политики без рекурсии

-- Пользователи могут создавать свои собственные членства (при регистрации)
CREATE POLICY "users_can_insert_own_membership" ON organization_members
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Админы могут добавлять других пользователей в свою организацию
-- Используем функцию is_org_admin для проверки без рекурсии
CREATE POLICY "admins_can_insert_members" ON organization_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        is_org_admin(auth.uid(), organization_id)
    );

-- Пользователи могут читать свои собственные членства
CREATE POLICY "users_can_read_own_memberships" ON organization_members
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Админы могут читать все членства в своих организациях
CREATE POLICY "admins_can_read_org_memberships" ON organization_members
    FOR SELECT
    TO authenticated
    USING (
        is_org_admin(auth.uid(), organization_id)
    );

-- Админы могут обновлять членства в своих организациях
CREATE POLICY "admins_can_update_members" ON organization_members
    FOR UPDATE
    TO authenticated
    USING (
        is_org_admin(auth.uid(), organization_id)
    )
    WITH CHECK (
        is_org_admin(auth.uid(), organization_id)
    );

-- Админы могут удалять членства из своих организаций
CREATE POLICY "admins_can_delete_members" ON organization_members
    FOR DELETE
    TO authenticated
    USING (
        is_org_admin(auth.uid(), organization_id)
    );

-- ============================================
-- ОБНОВЛЕНИЕ ПОЛИТИК ДЛЯ ДРУГИХ ТАБЛИЦ
-- ============================================

-- Обновляем политики для organizations, чтобы использовать функцию
DROP POLICY IF EXISTS "users_can_read_own_organizations" ON organizations;
CREATE POLICY "users_can_read_own_organizations" ON organizations
    FOR SELECT
    TO authenticated
    USING (
        is_org_member(auth.uid(), organizations.id)
    );

DROP POLICY IF EXISTS "users_can_update_own_organizations" ON organizations;
CREATE POLICY "users_can_update_own_organizations" ON organizations
    FOR UPDATE
    TO authenticated
    USING (
        is_org_admin(auth.uid(), organizations.id)
    )
    WITH CHECK (
        is_org_admin(auth.uid(), organizations.id)
    );

-- Обновляем политики для subscriptions
DROP POLICY IF EXISTS "users_can_create_subscriptions" ON subscriptions;
CREATE POLICY "users_can_create_subscriptions" ON subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        is_org_admin(auth.uid(), organization_id)
    );

DROP POLICY IF EXISTS "users_can_read_org_subscriptions" ON subscriptions;
CREATE POLICY "users_can_read_org_subscriptions" ON subscriptions
    FOR SELECT
    TO authenticated
    USING (
        is_org_member(auth.uid(), organization_id)
    );

-- ============================================
-- КОММЕНТАРИИ
-- ============================================
-- Функции is_org_admin и is_org_member используют SECURITY DEFINER,
-- что позволяет им обходить RLS и проверять членство без рекурсии.
-- Это безопасно, так как функции только проверяют факт членства,
-- не изменяя данные.

