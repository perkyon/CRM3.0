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

