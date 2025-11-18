-- Скрипт для добавления организации "Buro" и привязки существующего пользователя
-- Email: fominsevil@gmail.com
-- 
-- ВАЖНО: Это собственная организация разработчиков, поэтому:
-- - Используется Enterprise план с неограниченными лимитами
-- - Подписка всегда активна (без проверки оплаты)
-- - Все существующие данные (проекты, клиенты, пользователи) привязываются к этой организации

DO $$
DECLARE
    user_id_var UUID;
    org_id_var UUID;
    existing_org_id UUID;
BEGIN
    -- 1. Найти пользователя по email
    SELECT id INTO user_id_var
    FROM auth.users
    WHERE email = 'fominsevil@gmail.com';
    
    IF user_id_var IS NULL THEN
        RAISE EXCEPTION 'Пользователь с email fominsevil@gmail.com не найден';
    END IF;
    
    RAISE NOTICE 'Найден пользователь: %', user_id_var;
    
    -- 2. Проверить, существует ли уже организация "Buro"
    SELECT id INTO existing_org_id
    FROM organizations
    WHERE slug = 'buro' OR name = 'Buro';
    
    IF existing_org_id IS NOT NULL THEN
        RAISE NOTICE 'Организация "Buro" уже существует с ID: %', existing_org_id;
        org_id_var := existing_org_id;
        
        -- Обновить лимиты до Enterprise (неограниченные) для существующей организации
        UPDATE organizations
        SET max_users = -1,
            max_projects = -1,
            max_storage_gb = 1000,
            updated_at = NOW()
        WHERE id = org_id_var;
        
        RAISE NOTICE 'Обновлены лимиты организации до Enterprise (неограниченные)';
    ELSE
        -- 3. Создать организацию "Buro" с неограниченными лимитами (Enterprise)
        INSERT INTO organizations (
            name,
            slug,
            status,
            settings,
            max_users,
            max_projects,
            max_storage_gb,
            created_at,
            updated_at
        ) VALUES (
            'Buro',
            'buro',
            'active',
            '{}'::jsonb,
            -1,  -- Unlimited users (Enterprise)
            -1,  -- Unlimited projects (Enterprise)
            1000, -- 1000 GB storage (Enterprise)
            NOW(),
            NOW()
        )
        RETURNING id INTO org_id_var;
        
        RAISE NOTICE 'Создана организация "Buro" с ID: %', org_id_var;
    END IF;
    
    -- 4. Добавить пользователя в организацию (если еще не добавлен)
    INSERT INTO organization_members (
        organization_id,
        user_id,
        role,
        active,
        joined_at,
        created_at,
        updated_at
    ) VALUES (
        org_id_var,
        user_id_var,
        'Admin',
        true,
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT (organization_id, user_id) 
    DO UPDATE SET 
        role = 'Admin',
        active = true,
        updated_at = NOW();
    
    RAISE NOTICE 'Пользователь добавлен в организацию как Admin';
    
    -- 5. Установить default_organization_id для пользователя
    UPDATE users
    SET default_organization_id = org_id_var,
        updated_at = NOW()
    WHERE id = user_id_var;
    
    RAISE NOTICE 'Установлена дефолтная организация для пользователя';
    
    -- 6. Создать подписку Enterprise (если еще не существует)
    -- Для собственной организации "Buro" - всегда активная Enterprise подписка
    INSERT INTO subscriptions (
        organization_id,
        plan,
        status,
        cancel_at_period_end,
        created_at,
        updated_at
    ) VALUES (
        org_id_var,
        'enterprise',
        'active',
        false,
        NOW(),
        NOW()
    )
    ON CONFLICT (organization_id) 
    DO UPDATE SET 
        plan = 'enterprise',
        status = 'active',
        cancel_at_period_end = false,
        updated_at = NOW();
    
    RAISE NOTICE 'Создана/обновлена подписка Enterprise (неограниченный план для собственной организации)';
    
    -- 7. Привязать ВСЕ существующие проекты и клиентов к организации "Buro"
    -- (так как это собственная организация, привязываем все данные)
    UPDATE projects
    SET organization_id = org_id_var,
        updated_at = NOW()
    WHERE organization_id IS NULL;
    
    UPDATE clients
    SET organization_id = org_id_var,
        updated_at = NOW()
    WHERE organization_id IS NULL;
    
    RAISE NOTICE 'Все существующие проекты и клиенты привязаны к организации "Buro"';
    
    -- 8. Добавить всех существующих пользователей в организацию "Buro"
    -- (так как это собственная организация, добавляем всех пользователей)
    INSERT INTO organization_members (
        organization_id,
        user_id,
        role,
        active,
        joined_at,
        created_at,
        updated_at
    )
    SELECT 
        org_id_var,
        u.id,
        'Admin',
        true,
        NOW(),
        NOW(),
        NOW()
    FROM users u
    WHERE NOT EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = org_id_var
          AND om.user_id = u.id
    );
    
    RAISE NOTICE 'Все существующие пользователи добавлены в организацию "Buro"';
    
    RAISE NOTICE 'Готово! Организация "Buro" успешно создана и настроена.';
    
END $$;

