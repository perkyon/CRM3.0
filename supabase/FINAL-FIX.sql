-- ============================================
-- 🔥 ФИНАЛЬНОЕ РЕШЕНИЕ - ВСЁ ЗА ОДИН РАЗ
-- ============================================

BEGIN;

-- 1. ПРОВЕРЯЕМ ПОЛЬЗОВАТЕЛЯ
DO $$
DECLARE
  auth_id uuid;
  user_exists boolean;
BEGIN
  -- Получаем Auth ID
  SELECT id INTO auth_id FROM auth.users WHERE email = 'fominsevil@gmail.com';
  
  IF auth_id IS NULL THEN
    RAISE EXCEPTION 'Пользователь fominsevil@gmail.com НЕ НАЙДЕН в auth.users! Создай его в Authentication → Users';
  END IF;
  
  RAISE NOTICE 'Auth ID: %', auth_id;
  
  -- Проверяем есть ли в public.users (id в users - это text)
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id::uuid = auth_id) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE NOTICE 'Создаём пользователя в public.users...';
    INSERT INTO public.users (id, name, email, phone, role, active, created_at, updated_at)
    VALUES (
      auth_id::text,
      'Илья',
      'fominsevil@gmail.com',
      '+7 (995) 202-54-04',
      'Admin',
      true,
      NOW(),
      NOW()
    );
  ELSE
    RAISE NOTICE 'Пользователь уже есть в public.users';
  END IF;
END $$;

-- 2. СОЗДАЁМ ВСЕ ПОЛИТИКИ (authenticated)

-- USERS
DROP POLICY IF EXISTS "authenticated_read_users" ON users;
CREATE POLICY "authenticated_read_users" ON users FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_update_own_user" ON users;
CREATE POLICY "authenticated_update_own_user" ON users FOR UPDATE TO authenticated USING (auth.uid() = id::uuid);

-- CLIENTS
DROP POLICY IF EXISTS "authenticated_all_clients" ON clients;
CREATE POLICY "authenticated_all_clients" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CONTACTS
DROP POLICY IF EXISTS "authenticated_all_contacts" ON contacts;
CREATE POLICY "authenticated_all_contacts" ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ADDRESSES
DROP POLICY IF EXISTS "authenticated_all_addresses" ON addresses;
CREATE POLICY "authenticated_all_addresses" ON addresses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CLIENT_TAGS
DROP POLICY IF EXISTS "authenticated_all_client_tags" ON client_tags;
CREATE POLICY "authenticated_all_client_tags" ON client_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CLIENT_DOCUMENTS
DROP POLICY IF EXISTS "authenticated_all_client_documents" ON client_documents;
CREATE POLICY "authenticated_all_client_documents" ON client_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PROJECTS
DROP POLICY IF EXISTS "authenticated_all_projects" ON projects;
CREATE POLICY "authenticated_all_projects" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PROJECT_DOCUMENTS
DROP POLICY IF EXISTS "authenticated_all_project_documents" ON project_documents;
CREATE POLICY "authenticated_all_project_documents" ON project_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- MATERIALS
DROP POLICY IF EXISTS "authenticated_all_materials" ON materials;
CREATE POLICY "authenticated_all_materials" ON materials FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- MATERIAL_CATEGORIES
DROP POLICY IF EXISTS "authenticated_all_material_categories" ON material_categories;
CREATE POLICY "authenticated_all_material_categories" ON material_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PRODUCTION_ITEMS
DROP POLICY IF EXISTS "authenticated_all_production_items" ON production_items;
CREATE POLICY "authenticated_all_production_items" ON production_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- KANBAN
DROP POLICY IF EXISTS "authenticated_all_kanban_boards" ON kanban_boards;
CREATE POLICY "authenticated_all_kanban_boards" ON kanban_boards FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_kanban_columns" ON kanban_columns;
CREATE POLICY "authenticated_all_kanban_columns" ON kanban_columns FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_kanban_tasks" ON kanban_tasks;
CREATE POLICY "authenticated_all_kanban_tasks" ON kanban_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_task_comments" ON task_comments;
CREATE POLICY "authenticated_all_task_comments" ON task_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_task_attachments" ON task_attachments;
CREATE POLICY "authenticated_all_task_attachments" ON task_attachments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_checklist_items" ON checklist_items;
CREATE POLICY "authenticated_all_checklist_items" ON checklist_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_activities" ON activities;
CREATE POLICY "authenticated_all_activities" ON activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_integrations" ON integrations;
CREATE POLICY "authenticated_all_integrations" ON integrations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. STORAGE ПОЛИТИКИ
DROP POLICY IF EXISTS "authenticated_read_files" ON storage.objects;
CREATE POLICY "authenticated_read_files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id IN ('client-documents', 'project-documents'));

DROP POLICY IF EXISTS "authenticated_upload_files" ON storage.objects;
CREATE POLICY "authenticated_upload_files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('client-documents', 'project-documents'));

DROP POLICY IF EXISTS "authenticated_update_files" ON storage.objects;
CREATE POLICY "authenticated_update_files" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('client-documents', 'project-documents'));

DROP POLICY IF EXISTS "authenticated_delete_files" ON storage.objects;
CREATE POLICY "authenticated_delete_files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id IN ('client-documents', 'project-documents'));

COMMIT;

-- 4. ПРОВЕРКА
SELECT 
    '✅ Пользователь создан' as status,
    id, name, email, role 
FROM public.users 
WHERE email = 'fominsevil@gmail.com';

SELECT 
    '✅ Политик создано: ' || COUNT(*) as status
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- ✅ ГОТОВО!
-- ============================================
-- Теперь:
-- 1. Открой https://crm-3-0-seven.vercel.app
-- 2. Войди: fominsevil@gmail.com / admin123
-- 3. ДОЛЖНО РАБОТАТЬ!

