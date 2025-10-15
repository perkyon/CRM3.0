-- Create auth users in Supabase
-- This script creates users in the auth.users table

-- Note: This requires admin privileges or service role key
-- If you don't have admin access, use the JavaScript functions instead

-- Create users in auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
(
  '00000000-0000-0000-0000-000000000000',
  '9fc4d042-f598-487c-a383-cccfe0e219db',
  'authenticated',
  'authenticated',
  'syroejkin@workshop.ru',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Сыроежкин", "role": "Admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '550e8400-e29b-41d4-a716-446655440002',
  'authenticated',
  'authenticated',
  'o.smirnov@workshop.ru',
  crypt('master123', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Олег Смирнов", "role": "Master"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '550e8400-e29b-41d4-a716-446655440003',
  'authenticated',
  'authenticated',
  'd.kozlov@workshop.ru',
  crypt('procurement123', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Дмитрий Козлов", "role": "Procurement"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '550e8400-e29b-41d4-a716-446655440004',
  'authenticated',
  'authenticated',
  'a.volkova@workshop.ru',
  crypt('accountant123', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Анна Волкова", "role": "Accountant"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = NOW();

-- Create identities for the users
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES 
(
  '9fc4d042-f598-487c-a383-cccfe0e219db',
  '9fc4d042-f598-487c-a383-cccfe0e219db',
  '{"sub": "9fc4d042-f598-487c-a383-cccfe0e219db", "email": "syroejkin@workshop.ru", "email_verified": true, "phone_verified": false}',
  'email',
  NOW(),
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440002',
  '{"sub": "550e8400-e29b-41d4-a716-446655440002", "email": "o.smirnov@workshop.ru", "email_verified": true, "phone_verified": false}',
  'email',
  NOW(),
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440003',
  '{"sub": "550e8400-e29b-41d4-a716-446655440003", "email": "d.kozlov@workshop.ru", "email_verified": true, "phone_verified": false}',
  'email',
  NOW(),
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440004',
  '{"sub": "550e8400-e29b-41d4-a716-446655440004", "email": "a.volkova@workshop.ru", "email_verified": true, "phone_verified": false}',
  'email',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  identity_data = EXCLUDED.identity_data,
  last_sign_in_at = EXCLUDED.last_sign_in_at,
  updated_at = NOW();

-- Verify the users were created
SELECT 
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users 
WHERE email IN (
  'syroejkin@workshop.ru',
  'o.smirnov@workshop.ru', 
  'd.kozlov@workshop.ru',
  'a.volkova@workshop.ru'
)
ORDER BY created_at;
