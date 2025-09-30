# 🗄️ Настройка Supabase для CRM 3.0

## 📋 Пошаговая инструкция

### 1. Создание проекта в Supabase

1. **Перейдите на [supabase.com](https://supabase.com)**
2. **Войдите в аккаунт** или создайте новый
3. **Нажмите "New Project"**
4. **Заполните данные:**
   - Organization: выберите вашу организацию
   - Project Name: `CRM-3.0`
   - Database Password: создайте надежный пароль
   - Region: выберите ближайший регион
5. **Нажмите "Create new project"**

### 2. Выполнение SQL схемы

1. **Перейдите в SQL Editor:**
   - В левом меню выберите **"SQL Editor"**
   - Нажмите **"New query"**

2. **Скопируйте и выполните схему:**
   - Откройте файл `supabase/schema.sql` в вашем проекте
   - Скопируйте весь содержимое
   - Вставьте в SQL Editor
   - Нажмите **"Run"**

3. **Проверьте созданные таблицы:**
   - Перейдите в **"Table Editor"**
   - Убедитесь, что созданы все таблицы:
     - users
     - clients
     - projects
     - contacts
     - addresses
     - documents
     - kanban_boards
     - kanban_columns
     - kanban_tasks
     - tags
     - client_tags
     - project_tags

### 3. Настройка RLS (Row Level Security)

1. **Перейдите в Authentication:**
   - В левом меню выберите **"Authentication"**
   - Перейдите в **"Policies"**

2. **Создайте политики для каждой таблицы:**

```sql
-- Enable RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all data" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all clients" ON clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all projects" ON projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all contacts" ON contacts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all addresses" ON addresses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all documents" ON documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all kanban_boards" ON kanban_boards FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all kanban_columns" ON kanban_columns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all kanban_tasks" ON kanban_tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all tags" ON tags FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all client_tags" ON client_tags FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all project_tags" ON project_tags FOR SELECT USING (auth.role() = 'authenticated');

-- Create policies for insert/update/delete (admin only for now)
CREATE POLICY "Admins can insert users" ON users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update users" ON users FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete users" ON users FOR DELETE USING (auth.role() = 'authenticated');

-- Similar policies for other tables...
```

### 4. Настройка Storage

1. **Перейдите в Storage:**
   - В левом меню выберите **"Storage"**
   - Нажмите **"Create a new bucket"**

2. **Создайте bucket для документов:**
   - Name: `documents`
   - Public: `false` (приватный)
   - File size limit: `50MB`
   - Allowed MIME types: `*/*`

3. **Создайте bucket для аватаров:**
   - Name: `avatars`
   - Public: `true` (публичный)
   - File size limit: `5MB`
   - Allowed MIME types: `image/*`

### 5. Получение ключей API

1. **Перейдите в Settings:**
   - В левом меню выберите **"Settings"**
   - Выберите **"API"**

2. **Скопируйте ключи:**
   - **Project URL** - это ваш `VITE_SUPABASE_URL`
   - **anon public** - это ваш `VITE_SUPABASE_ANON_KEY`
   - **service_role** - это ваш `VITE_SUPABASE_SERVICE_ROLE_KEY` (для серверных операций)

### 6. Настройка переменных окружения в Vercel

1. **Перейдите в Vercel Dashboard:**
   - Откройте ваш проект `crm-3-0`
   - Перейдите в **"Settings"** → **"Environment Variables"**

2. **Добавьте переменные:**
   ```
   VITE_SUPABASE_URL = [ваш Project URL]
   VITE_SUPABASE_ANON_KEY = [ваш anon public ключ]
   VITE_SUPABASE_SERVICE_ROLE_KEY = [ваш service_role ключ]
   ```

3. **Перезапустите деплой:**
   - Нажмите **"Redeploy"** для применения переменных

### 7. Тестирование подключения

После настройки проверьте:
- ✅ Подключение к базе данных
- ✅ Создание/чтение данных
- ✅ Загрузка файлов в Storage
- ✅ Аутентификация пользователей

## 🔧 Дополнительные настройки

### Настройка Email аутентификации

1. **Перейдите в Authentication → Settings**
2. **Настройте SMTP:**
   - Site URL: `https://crm-3-0-seven.vercel.app`
   - Redirect URLs: `https://crm-3-0-seven.vercel.app/auth/callback`

### Настройка уведомлений

1. **Перейдите в Database → Functions**
2. **Создайте функции для уведомлений**

## 📞 Поддержка

Если возникли проблемы:
- Проверьте логи в Supabase Dashboard
- Убедитесь, что все переменные окружения настроены
- Проверьте RLS политики
