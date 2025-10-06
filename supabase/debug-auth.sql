-- Debug authentication and user status
-- This script helps diagnose authentication issues

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
