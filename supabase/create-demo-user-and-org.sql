-- ============================================
-- ПОЛНЫЙ СКРИПТ СОЗДАНИЯ ДЕМО-ОРГАНИЗАЦИИ
-- ============================================
-- Этот скрипт создает демо-пользователя и организацию с данными
-- Выполните его в Supabase SQL Editor

DO $$
DECLARE
    demo_org_id UUID;
    demo_user_id UUID;
    demo_user_exists BOOLEAN;
BEGIN
    -- 1. Создать демо-пользователя в auth.users (если еще не создан)
    -- ВАЖНО: Сначала создайте пользователя через Supabase Auth UI:
    -- Authentication → Users → Add user
    -- Email: demo@burocrm.ru
    -- Password: demo123456
    
    -- Проверяем, существует ли пользователь
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'demo@burocrm.ru'
    ) INTO demo_user_exists;
    
    IF NOT demo_user_exists THEN
        RAISE NOTICE '⚠️  ВНИМАНИЕ: Пользователь demo@burocrm.ru не найден в auth.users!';
        RAISE NOTICE 'Создайте его через Supabase Dashboard:';
        RAISE NOTICE '1. Откройте Authentication → Users';
        RAISE NOTICE '2. Нажмите "Add user"';
        RAISE NOTICE '3. Email: demo@burocrm.ru';
        RAISE NOTICE '4. Password: demo123456';
        RAISE NOTICE '5. После создания пользователя выполните этот скрипт снова';
        RETURN;
    END IF;
    
    -- Получаем ID демо-пользователя
    SELECT id INTO demo_user_id
    FROM auth.users
    WHERE email = 'demo@burocrm.ru';
    
    RAISE NOTICE '✅ Найден демо-пользователь: %', demo_user_id;

    -- 2. Проверяем, существует ли уже демо-организация
    SELECT id INTO demo_org_id
    FROM organizations
    WHERE slug = 'demo';
    
    IF demo_org_id IS NOT NULL THEN
        RAISE NOTICE '⚠️  Демо-организация уже существует. Обновляем данные...';
        
        -- Удаляем старые демо-данные (клиенты и проекты)
        DELETE FROM projects WHERE organization_id = demo_org_id;
        DELETE FROM contacts WHERE client_id IN (SELECT id FROM clients WHERE organization_id = demo_org_id);
        DELETE FROM addresses WHERE client_id IN (SELECT id FROM clients WHERE organization_id = demo_org_id);
        DELETE FROM clients WHERE organization_id = demo_org_id;
    ELSE
        -- 3. Создать демо-организацию
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
            'Демо-мастерская',
            'demo',
            'active',
            '{"demo": true}'::jsonb,
            10,
            50,
            10,
            NOW(),
            NOW()
        )
        RETURNING id INTO demo_org_id;
        
        RAISE NOTICE '✅ Создана демо-организация с ID: %', demo_org_id;
    END IF;

    -- 4. Создать или обновить профиль демо-пользователя
    INSERT INTO users (
        id,
        name,
        email,
        role,
        active,
        default_organization_id,
        created_at,
        updated_at
    ) VALUES (
        demo_user_id,
        'Демо Пользователь',
        'demo@burocrm.ru',
        'Admin',
        true,
        demo_org_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        name = 'Демо Пользователь',
        default_organization_id = demo_org_id,
        updated_at = NOW();

    -- 5. Добавить пользователя в организацию
    INSERT INTO organization_members (
        organization_id,
        user_id,
        role,
        active,
        joined_at,
        created_at,
        updated_at
    ) VALUES (
        demo_org_id,
        demo_user_id,
        'Admin',
        true,
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT (organization_id, user_id) DO UPDATE SET
        role = 'Admin',
        active = true,
        updated_at = NOW();

    -- 6. Создать или обновить подписку
    -- Проверяем, существует ли уже подписка для этой организации
    IF EXISTS (SELECT 1 FROM subscriptions WHERE organization_id = demo_org_id) THEN
        -- Обновляем существующую подписку
        UPDATE subscriptions
        SET plan = 'professional',
            status = 'active',
            updated_at = NOW()
        WHERE organization_id = demo_org_id;
    ELSE
        -- Создаем новую подписку
        INSERT INTO subscriptions (
            organization_id,
            plan,
            status,
            created_at,
            updated_at
        ) VALUES (
            demo_org_id,
            'professional',
            'active',
            NOW(),
            NOW()
        );
    END IF;

    -- 7. Создать демо-клиентов
    INSERT INTO clients (
        organization_id,
        type,
        name,
        company,
        preferred_channel,
        source,
        status,
        owner_id,
        projects_count,
        ar_balance,
        created_at,
        updated_at
    ) VALUES
    (
        demo_org_id,
        'Физ. лицо',
        'Иванов Иван Иванович',
        NULL,
        'WhatsApp',
        'Сайт',
        'client',
        demo_user_id,
        2,
        0,
        NOW() - INTERVAL '30 days',
        NOW()
    ),
    (
        demo_org_id,
        'ООО',
        'Петров Петр Петрович',
        'ООО "Мебель Плюс"',
        'Phone',
        'Рекомендация',
        'in_work',
        demo_user_id,
        1,
        150000,
        NOW() - INTERVAL '15 days',
        NOW()
    ),
    (
        demo_org_id,
        'ИП',
        'Сидоров Сидор Сидорович',
        'ИП Сидоров',
        'Telegram',
        'Яндекс.Директ',
        'new',
        demo_user_id,
        0,
        0,
        NOW() - INTERVAL '5 days',
        NOW()
    )
    ON CONFLICT DO NOTHING;

    -- 8. Создать контакты для клиентов
    INSERT INTO contacts (client_id, name, phone, email, is_primary, created_at)
    SELECT 
        c.id,
        CASE 
            WHEN c.name LIKE '%Иванов%' THEN 'Иван Иванов'
            WHEN c.name LIKE '%Петров%' THEN 'Петр Петров'
            ELSE 'Сидор Сидоров'
        END,
        CASE 
            WHEN c.name LIKE '%Иванов%' THEN '+7 (999) 123-45-67'
            WHEN c.name LIKE '%Петров%' THEN '+7 (999) 234-56-78'
            ELSE '+7 (999) 345-67-89'
        END,
        CASE 
            WHEN c.name LIKE '%Иванов%' THEN 'ivanov@example.com'
            WHEN c.name LIKE '%Петров%' THEN 'petrov@example.com'
            ELSE 'sidorov@example.com'
        END,
        true,
        NOW()
    FROM clients c
    WHERE c.organization_id = demo_org_id
    ON CONFLICT DO NOTHING;

    -- 9. Создать демо-проекты
    INSERT INTO projects (
        organization_id,
        client_id,
        title,
        site_address,
        manager_id,
        start_date,
        due_date,
        budget,
        priority,
        stage,
        created_at,
        updated_at
    )
    SELECT 
        demo_org_id,
        c.id,
        CASE 
            WHEN c.name LIKE '%Иванов%' THEN 'Кухня "Модерн"'
            WHEN c.name LIKE '%Петров%' THEN 'Гардеробная комната'
            ELSE NULL
        END,
        CASE 
            WHEN c.name LIKE '%Иванов%' THEN 'г. Москва, ул. Ленина, д. 10, кв. 25'
            WHEN c.name LIKE '%Петров%' THEN 'г. Москва, ул. Пушкина, д. 5, кв. 12'
            ELSE NULL
        END,
        demo_user_id,
        CASE 
            WHEN c.name LIKE '%Иванов%' THEN NOW() - INTERVAL '20 days'
            WHEN c.name LIKE '%Петров%' THEN NOW() - INTERVAL '10 days'
            ELSE NULL
        END,
        CASE 
            WHEN c.name LIKE '%Иванов%' THEN NOW() + INTERVAL '10 days'
            WHEN c.name LIKE '%Петров%' THEN NOW() + INTERVAL '20 days'
            ELSE NULL
        END,
        CASE 
            WHEN c.name LIKE '%Иванов%' THEN 250000
            WHEN c.name LIKE '%Петров%' THEN 180000
            ELSE NULL
        END,
        'high',
        CASE 
            WHEN c.name LIKE '%Иванов%' THEN 'production'
            WHEN c.name LIKE '%Петров%' THEN 'design'
            ELSE 'brief'
        END,
        NOW() - INTERVAL '15 days',
        NOW()
    FROM clients c
    WHERE c.organization_id = demo_org_id
      AND c.name NOT LIKE '%Сидоров%'
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Демо-данные созданы успешно!';
    RAISE NOTICE '📧 Email для входа: demo@burocrm.ru';
    RAISE NOTICE '🔑 Пароль: demo123456';
    RAISE NOTICE '🏢 Организация: demo (Демо-мастерская)';
END $$;

