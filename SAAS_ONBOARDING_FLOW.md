# SaaS Onboarding Flow

## Процесс после покупки подписки

### 1. Выбор плана на странице `/pricing`

Пользователь выбирает план:
- **Бесплатный** → сразу переход на `/onboarding?plan=free`
- **Платный** → переход на `/checkout?plan={plan}&period={month|year}`

### 2. Оплата (для платных планов)

**Интеграция с ЮKassa:**
1. Пользователь заполняет форму оплаты
2. Создается платеж в ЮKassa
3. После успешной оплаты → редирект на `/payment/success?payment_id=...&plan=...&org_name=...&org_slug=...&user_name=...&user_email=...&user_phone=...`

### 3. Onboarding (`/onboarding`)

**Шаг 1: Создание организации**
- Название организации
- Slug (URL организации)
- Веб-сайт (опционально)

**Шаг 2: Данные администратора**
- Имя
- Email (будет использован для входа)
- Телефон (опционально)

**Шаг 3: Готово**
- Организация создана
- Пользователь создан
- Подписка активирована

### 4. Создание организации в БД

**Что происходит:**
1. **Создание пользователя в Supabase Auth**
   - Email + пароль
   - Генерируется временный пароль (отправляется на email)

2. **Создание профиля пользователя**
   - Таблица `users`
   - Роль: `Admin`
   - `default_organization_id` устанавливается после создания организации

3. **Создание организации**
   - Таблица `organizations`
   - Статус: `active`
   - Лимиты зависят от плана:
     - Free: 3 users, 5 projects, 1 GB
     - Starter: 10 users, 50 projects, 10 GB
     - Professional: 50 users, unlimited projects, 100 GB
     - Enterprise: unlimited users, unlimited projects, 1000 GB

4. **Добавление пользователя в организацию**
   - Таблица `organization_members`
   - Роль: `Admin`
   - `active: true`

5. **Создание подписки**
   - Таблица `subscriptions`
   - План из выбранного тарифа
   - Статус: `active` (для free) или `trialing` (для платных)

### 5. Доступ к системе

После создания:
- Пользователь получает email с данными для входа
- Может войти через `/login`
- Автоматически попадает в свою организацию
- Видит только данные своей организации (RLS политики)

## Структура данных

### Организация (`organizations`)
```sql
- id (UUID)
- name (VARCHAR)
- slug (VARCHAR, UNIQUE)
- website (TEXT, nullable)
- status (organization_status: 'active' | 'suspended' | 'deleted')
- settings (JSONB)
- max_users (INTEGER)
- max_projects (INTEGER)
- max_storage_gb (INTEGER)
- created_at, updated_at, deleted_at
```

### Пользователь (`users`)
```sql
- id (UUID, из Supabase Auth)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- phone (VARCHAR, nullable)
- role (Role: 'Admin' | 'Manager' | 'Foreman' | 'Viewer')
- active (BOOLEAN)
- default_organization_id (UUID, nullable)
- created_at, updated_at, last_login_at
```

### Член организации (`organization_members`)
```sql
- id (UUID)
- organization_id (UUID, FK)
- user_id (UUID, FK)
- role (Role)
- active (BOOLEAN)
- joined_at, invited_at, invited_by
- created_at, updated_at
```

### Подписка (`subscriptions`)
```sql
- id (UUID)
- organization_id (UUID, FK)
- plan (SubscriptionPlan: 'free' | 'starter' | 'professional' | 'enterprise')
- status (SubscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | ...)
- stripe_subscription_id (VARCHAR, nullable) - для ЮKassa будет yookassa_subscription_id
- stripe_customer_id (VARCHAR, nullable) - для ЮKassa будет yookassa_customer_id
- current_period_start, current_period_end
- cancel_at_period_end (BOOLEAN)
- canceled_at (TIMESTAMP, nullable)
- created_at, updated_at
```

## RLS (Row Level Security)

Все данные изолированы по организациям:
- Пользователь видит только данные своей организации
- `organization_id` добавляется во все таблицы (clients, projects, etc.)
- RLS политики проверяют `organization_id` через `organization_members`

## TODO

- [ ] Интеграция с ЮKassa для обработки платежей
- [ ] Email уведомления (welcome email с паролем)
- [ ] Страница `/checkout` для оплаты
- [ ] Webhook от ЮKassa для подтверждения платежей
- [ ] Страница управления подпиской (`/billing`)
- [ ] Переключение между организациями (если пользователь в нескольких)

