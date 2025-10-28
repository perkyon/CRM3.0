-- Добавление тестовых клиентов

-- Проверка: есть ли клиенты?
DO $$
DECLARE
  client_count INT;
BEGIN
  SELECT COUNT(*) INTO client_count FROM clients;
  IF client_count = 0 THEN
    RAISE NOTICE '⚠️  Нет клиентов! Добавляем тестовых...';
  ELSE
    RAISE NOTICE 'ℹ️  Уже есть % клиентов', client_count;
  END IF;
END $$;

-- Добавить тестовых клиентов
INSERT INTO clients (
  id,
  type,
  name,
  company,
  phone,
  email,
  preferred_channel,
  source,
  address,
  created_at,
  updated_at
)
VALUES
  -- Клиент 1: Физлицо
  (
    gen_random_uuid(),
    'Физлицо',
    'Иван Петров',
    NULL,
    '+7 (999) 123-45-67',
    'ivan.petrov@example.com',
    'phone',
    'referral',
    'Москва, ул. Ленина, д. 10, кв. 15',
    now(),
    now()
  ),
  
  -- Клиент 2: ООО
  (
    gen_random_uuid(),
    'ООО',
    'Алексей Сидоров',
    'ООО "Строй Мастер"',
    '+7 (999) 234-56-78',
    'a.sidorov@stroymaster.ru',
    'email',
    'website',
    'Москва, Проспект Мира, д. 50, офис 201',
    now(),
    now()
  ),
  
  -- Клиент 3: ИП
  (
    gen_random_uuid(),
    'ИП',
    'Мария Иванова',
    'ИП Иванова М.А.',
    '+7 (999) 345-67-89',
    'maria.ivanova@example.com',
    'telegram',
    'social_media',
    'Санкт-Петербург, Невский проспект, д. 25',
    now(),
    now()
  ),
  
  -- Клиент 4: Самозанятый
  (
    gen_random_uuid(),
    'Самозанятый',
    'Дмитрий Козлов',
    'Дизайн-студия "Интерьер+"',
    '+7 (999) 456-78-90',
    'd.kozlov@interior-plus.ru',
    'whatsapp',
    'recommendation',
    'Москва, ул. Арбат, д. 12',
    now(),
    now()
  ),
  
  -- Клиент 5: ООО (крупная компания)
  (
    gen_random_uuid(),
    'ООО',
    'Ольга Смирнова',
    'ООО "Бизнес Центр"',
    '+7 (999) 567-89-01',
    'o.smirnova@businesscenter.ru',
    'email',
    'cold_call',
    'Москва, Кутузовский проспект, д. 36, стр. 1',
    now(),
    now()
  )
ON CONFLICT (email) DO NOTHING;

SELECT 'Тестовые клиенты добавлены! ✅' as status;

-- Показать всех клиентов
SELECT 
  id,
  type,
  name,
  company,
  phone,
  email,
  created_at
FROM clients
ORDER BY created_at DESC;

