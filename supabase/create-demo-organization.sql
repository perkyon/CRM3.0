-- ============================================
-- СОЗДАНИЕ ДЕМО-ОРГАНИЗАЦИИ С ПРЕДЗАПОЛНЕННЫМИ ДАННЫМИ
-- ============================================
-- Этот скрипт создает демо-организацию для ознакомления с системой
-- Выполните его в Supabase SQL Editor

DO $$
DECLARE
    demo_org_id UUID;
    demo_user_id UUID;
    demo_client_id UUID;
    demo_project_id UUID;
BEGIN
    -- 1. Создать демо-организацию
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

    RAISE NOTICE 'Создана демо-организация с ID: %', demo_org_id;

    -- 2. Создать демо-пользователя в auth.users (если еще не создан)
    -- ВАЖНО: Сначала нужно создать пользователя через Supabase Auth UI или API
    -- Здесь мы предполагаем, что пользователь уже создан с email: demo@burocrm.ru
    
    -- Найти демо-пользователя
    SELECT id INTO demo_user_id
    FROM auth.users
    WHERE email = 'demo@burocrm.ru';
    
    IF demo_user_id IS NULL THEN
        RAISE NOTICE 'ВНИМАНИЕ: Пользователь demo@burocrm.ru не найден в auth.users';
        RAISE NOTICE 'Создайте пользователя через Supabase Auth UI или выполните:';
        RAISE NOTICE 'INSERT INTO auth.users (email, encrypted_password, email_confirmed_at) VALUES (''demo@burocrm.ru'', crypt(''demo123456'', gen_salt(''bf'')), NOW());';
    ELSE
        RAISE NOTICE 'Найден демо-пользователь: %', demo_user_id;
        
        -- 3. Создать профиль демо-пользователя в таблице users
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
            default_organization_id = demo_org_id,
            updated_at = NOW();

        -- 4. Добавить пользователя в организацию
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

        -- 5. Создать подписку
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
        )
        ON CONFLICT DO NOTHING;

        -- 6. Создать демо-клиентов
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
        RETURNING id INTO demo_client_id;

        -- 7. Создать контакты для клиентов
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
        WHERE c.organization_id = demo_org_id;

        -- 8. Создать демо-проекты
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
        RETURNING id INTO demo_project_id;

        RAISE NOTICE 'Демо-данные созданы успешно!';
        RAISE NOTICE 'Организация: demo';
        RAISE NOTICE 'Email для входа: demo@burocrm.ru';
        RAISE NOTICE 'Пароль: demo123456';
    END IF;
END $$;

-- Примечание: После выполнения скрипта создайте пользователя через Supabase Auth UI:
-- Email: demo@burocrm.ru
-- Password: demo123456
-- Или используйте Supabase Management API

