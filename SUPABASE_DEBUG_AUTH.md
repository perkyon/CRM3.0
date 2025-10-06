# 🔍 Диагностика аутентификации Supabase

## 🚨 ПРОБЛЕМА:
Ошибки 400/409 все еще присутствуют после очистки RLS политик. Нужно проверить аутентификацию.

## 🔍 ДИАГНОСТИКА:

### ШАГ 1: Проверьте аутентификацию в Supabase Dashboard

1. **Откройте Supabase Dashboard**
2. **Перейдите в Authentication → Users**
3. **Проверьте, есть ли пользователь `fominsevil@gmail.com`**
4. **Если его нет - создайте его:**
   - Нажмите **"Add user"**
   - **Email:** `fominsevil@gmail.com`
   - **Password:** `admin123`
   - **Auto Confirm User:** ✅ (поставьте галочку)

### ШАГ 2: Выполните диагностический SQL

1. **Откройте SQL Editor**
2. **Выполните содержимое файла `supabase/debug-auth.sql`:**

```sql
-- Check if the test user exists in auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'fominsevil@gmail.com';

-- Check if the test user exists in public.users
SELECT 
    id,
    name,
    email,
    role,
    active,
    created_at,
    updated_at
FROM public.users 
WHERE email = 'fominsevil@gmail.com';

-- Check RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY policyname;

-- Check RLS policies on clients table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'clients'
ORDER BY policyname;

-- Test a simple query to see if RLS is working
SELECT COUNT(*) as total_users FROM public.users;

-- Test a simple query to see if RLS is working for clients
SELECT COUNT(*) as total_clients FROM public.clients;
```

### ШАГ 3: Проверьте переменные окружения в Vercel

1. **Откройте Vercel Dashboard**
2. **Перейдите в ваш проект**
3. **Settings → Environment Variables**
4. **Проверьте, что есть:**
   - `VITE_SUPABASE_URL` = `https://xhclmypcklndxqzkhgfk.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = ваш anon key

### ШАГ 4: Проверьте аутентификацию в браузере

Откройте консоль браузера и выполните:

```javascript
// Проверьте статус аутентификации
console.log('Auth status:', await window.supabase?.auth?.getSession());

// Проверьте текущего пользователя
console.log('Current user:', await window.supabase?.auth?.getUser());

// Проверьте переменные окружения
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

## 🎯 ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ:

### Если все работает:
- ✅ Пользователь существует в `auth.users`
- ✅ Пользователь существует в `public.users`
- ✅ RLS политики созданы
- ✅ COUNT запросы возвращают числа > 0
- ✅ В браузере показывается аутентифицированный пользователь

### Если есть проблемы:
- ❌ Пользователь не существует в `auth.users` → создайте его
- ❌ Пользователь не существует в `public.users` → выполните seed-data.sql
- ❌ RLS политики отсутствуют → выполните clean-rls.sql
- ❌ COUNT запросы возвращают 0 → проблема с RLS
- ❌ В браузере не показывается пользователь → проблема с аутентификацией

## 🆘 ЕСЛИ НЕ РАБОТАЕТ:

1. **Создайте пользователя в Auth** (если его нет)
2. **Выполните seed-data.sql** (если нет данных в public.users)
3. **Проверьте переменные окружения** в Vercel
4. **Сообщите результаты** диагностики

**Выполните эти шаги и сообщите результаты!** 🔍
