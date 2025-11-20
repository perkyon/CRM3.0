-- ============================================
-- ИСПРАВЛЕНИЕ RLS ПОЛИТИК ДЛЯ ТАБЛИЦЫ USERS
-- ============================================
-- Этот скрипт добавляет необходимые RLS политики для таблицы users,
-- чтобы пользователи могли создавать свой профиль после регистрации

-- Включаем RLS для users (если еще не включен)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики, если они есть
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON users;
DROP POLICY IF EXISTS "users_can_read_own_profile" ON users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON users;
DROP POLICY IF EXISTS "users_can_read_org_members" ON users;
DROP POLICY IF EXISTS "admins_can_read_all_org_users" ON users;

-- 1. Пользователи могут создавать свой собственный профиль
-- Это критично для регистрации - пользователь должен иметь возможность
-- создать запись в таблице users с id = auth.uid()
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
-- Это нужно для отображения списка пользователей в организации
CREATE POLICY "users_can_read_org_members" ON users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om1
            JOIN organization_members om2 ON om1.organization_id = om2.organization_id
            WHERE om1.user_id = auth.uid()
              AND om2.user_id = users.id
              AND om1.active = true
              AND om2.active = true
        )
    );

-- 5. Админы могут читать всех пользователей своей организации
-- (более широкая политика для админов)
CREATE POLICY "admins_can_read_all_org_users" ON users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            JOIN users admin_user ON admin_user.id = auth.uid()
            WHERE om.user_id = auth.uid()
              AND om.role = 'Admin'
              AND om.active = true
              AND (
                  -- Админ может видеть пользователей своей организации
                  users.default_organization_id = admin_user.default_organization_id
                  OR
                  -- Или пользователей, которые состоят в той же организации
                  EXISTS (
                      SELECT 1 FROM organization_members om2
                      WHERE om2.organization_id = om.organization_id
                        AND om2.user_id = users.id
                        AND om2.active = true
                  )
              )
        )
    );

-- Примечание: Для полного доступа админов к управлению пользователями
-- может потребоваться дополнительная политика UPDATE/DELETE для админов,
-- но это зависит от требований безопасности вашего приложения.

-- ============================================
-- RLS ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ ORGANIZATIONS
-- ============================================

-- Включаем RLS для organizations (если еще не включен)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики, если они есть
DROP POLICY IF EXISTS "users_can_create_organizations" ON organizations;
DROP POLICY IF EXISTS "users_can_read_own_organizations" ON organizations;
DROP POLICY IF EXISTS "users_can_update_own_organizations" ON organizations;
DROP POLICY IF EXISTS "admins_can_update_own_organizations" ON organizations;

-- 1. Пользователи могут создавать новые организации
-- Это нужно для регистрации и создания организации
CREATE POLICY "users_can_create_organizations" ON organizations
    FOR INSERT
    TO authenticated
    WITH CHECK (true); -- Любой авторизованный пользователь может создать организацию

-- 2. Пользователи могут читать организации, в которых они состоят
CREATE POLICY "users_can_read_own_organizations" ON organizations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organizations.id
              AND om.user_id = auth.uid()
              AND om.active = true
        )
    );

-- 3. Пользователи могут обновлять организации, в которых они являются админами
CREATE POLICY "users_can_update_own_organizations" ON organizations
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organizations.id
              AND om.user_id = auth.uid()
              AND om.role = 'Admin'
              AND om.active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organizations.id
              AND om.user_id = auth.uid()
              AND om.role = 'Admin'
              AND om.active = true
        )
    );

-- ============================================
-- RLS ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ ORGANIZATION_MEMBERS
-- ============================================

-- Включаем RLS для organization_members (если еще не включен)
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики, если они есть
DROP POLICY IF EXISTS "users_can_create_memberships" ON organization_members;
DROP POLICY IF EXISTS "users_can_read_own_memberships" ON organization_members;
DROP POLICY IF EXISTS "admins_can_manage_members" ON organization_members;

-- 1. Пользователи могут создавать членства в организациях
-- Это нужно для добавления пользователя в организацию при создании
CREATE POLICY "users_can_create_memberships" ON organization_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Пользователь может добавить себя в организацию
        user_id = auth.uid()
        OR
        -- Или админ организации может добавлять других пользователей
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
              AND om.user_id = auth.uid()
              AND om.role = 'Admin'
              AND om.active = true
        )
    );

-- 2. Пользователи могут читать свои членства
CREATE POLICY "users_can_read_own_memberships" ON organization_members
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR
        -- Или видеть членства в организациях, где пользователь является админом
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
              AND om.user_id = auth.uid()
              AND om.role = 'Admin'
              AND om.active = true
        )
    );

-- 3. Админы могут управлять членствами в своих организациях
CREATE POLICY "admins_can_manage_members" ON organization_members
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
              AND om.user_id = auth.uid()
              AND om.role = 'Admin'
              AND om.active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
              AND om.user_id = auth.uid()
              AND om.role = 'Admin'
              AND om.active = true
        )
    );

-- ============================================
-- RLS ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ SUBSCRIPTIONS
-- ============================================

-- Включаем RLS для subscriptions (если еще не включен)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики, если они есть
DROP POLICY IF EXISTS "users_can_create_subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "users_can_read_org_subscriptions" ON subscriptions;

-- 1. Пользователи могут создавать подписки для своих организаций
-- Это нужно при создании организации
CREATE POLICY "users_can_create_subscriptions" ON subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = subscriptions.organization_id
              AND om.user_id = auth.uid()
              AND om.role = 'Admin'
              AND om.active = true
        )
    );

-- 2. Пользователи могут читать подписки своих организаций
CREATE POLICY "users_can_read_org_subscriptions" ON subscriptions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = subscriptions.organization_id
              AND om.user_id = auth.uid()
              AND om.active = true
        )
    );

