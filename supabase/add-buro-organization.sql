-- Скрипт для добавления организации "Buro" и привязки существующего пользователя
-- Email: fominsevil@gmail.com

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
    ELSE
        -- 3. Создать организацию "Buro"
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
            50,  -- Professional plan limits
            -1,  -- Unlimited projects
            100, -- 100 GB storage
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
    
    -- 6. Создать подписку (если еще не существует)
    INSERT INTO subscriptions (
        organization_id,
        plan,
        status,
        cancel_at_period_end,
        created_at,
        updated_at
    ) VALUES (
        org_id_var,
        'professional',
        'active',
        false,
        NOW(),
        NOW()
    )
    ON CONFLICT (organization_id) 
    DO UPDATE SET 
        plan = 'professional',
        status = 'active',
        updated_at = NOW();
    
    RAISE NOTICE 'Создана/обновлена подписка Professional';
    
    -- 7. Привязать существующие проекты и клиентов к организации (если они не привязаны)
    UPDATE projects
    SET organization_id = org_id_var,
        updated_at = NOW()
    WHERE organization_id IS NULL
      AND EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = projects.manager_id 
          AND u.id = user_id_var
      );
    
    UPDATE clients
    SET organization_id = org_id_var,
        updated_at = NOW()
    WHERE organization_id IS NULL
      AND EXISTS (
          SELECT 1 FROM projects p
          WHERE p.client_id = clients.id
          AND p.organization_id = org_id_var
      );
    
    RAISE NOTICE 'Существующие проекты и клиенты привязаны к организации';
    
    RAISE NOTICE 'Готово! Организация "Buro" успешно создана и настроена.';
    
END $$;

