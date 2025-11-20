-- ============================================
-- СОЗДАНИЕ STORAGE BUCKETS ДЛЯ CRM
-- ============================================
-- Этот скрипт создает необходимые buckets в Supabase Storage
-- Выполните его в Supabase SQL Editor

-- 1. Создание bucket для аватаров пользователей
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Публичный доступ для чтения
  5242880, -- 5MB лимит
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Создание bucket для документов проектов
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-documents',
  'project-documents',
  false, -- Приватный доступ
  52428800, -- 50MB лимит
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'application/zip',
    'application/x-rar-compressed',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 3. Создание bucket для вложений задач
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-attachments',
  'task-attachments',
  false, -- Приватный доступ
  10485760, -- 10MB лимит
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/zip',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 4. Создание bucket для фотографий проектов
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-photos',
  'project-photos',
  true, -- Публичный доступ для чтения
  10485760, -- 10MB лимит
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ПОЛИТИКИ ДОСТУПА (RLS) ДЛЯ BUCKETS
-- ============================================

-- Политики для avatars bucket
-- Все пользователи могут загружать свои аватары
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Все пользователи могут обновлять свои аватары
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Все пользователи могут удалять свои аватары
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Все могут читать аватары (публичный доступ)
CREATE POLICY "Anyone can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Политики для project-documents bucket
-- Пользователи могут загружать документы в проекты своей организации
CREATE POLICY "Users can upload project documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-documents' AND
  EXISTS (
    SELECT 1 FROM projects p
    JOIN users u ON u.id = auth.uid()
    WHERE p.id::text = (storage.foldername(name))[1]
    AND p.organization_id = u.default_organization_id
  )
);

-- Пользователи могут читать документы проектов своей организации
CREATE POLICY "Users can read project documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-documents' AND
  EXISTS (
    SELECT 1 FROM projects p
    JOIN users u ON u.id = auth.uid()
    WHERE p.id::text = (storage.foldername(name))[1]
    AND p.organization_id = u.default_organization_id
  )
);

-- Пользователи могут удалять документы проектов своей организации
CREATE POLICY "Users can delete project documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-documents' AND
  EXISTS (
    SELECT 1 FROM projects p
    JOIN users u ON u.id = auth.uid()
    WHERE p.id::text = (storage.foldername(name))[1]
    AND p.organization_id = u.default_organization_id
  )
);

-- Политики для task-attachments bucket
-- Пользователи могут загружать вложения в задачи проектов своей организации
CREATE POLICY "Users can upload task attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'task-attachments' AND
  EXISTS (
    SELECT 1 FROM kanban_tasks kt
    JOIN kanban_columns kc ON kc.id = kt.column_id
    JOIN kanban_boards kb ON kb.id = kc.board_id
    JOIN projects p ON p.id = kb.project_id
    JOIN users u ON u.id = auth.uid()
    WHERE kt.id::text = (storage.foldername(name))[1]
    AND p.organization_id = u.default_organization_id
  )
);

-- Пользователи могут читать вложения задач проектов своей организации
CREATE POLICY "Users can read task attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'task-attachments' AND
  EXISTS (
    SELECT 1 FROM kanban_tasks kt
    JOIN kanban_columns kc ON kc.id = kt.column_id
    JOIN kanban_boards kb ON kb.id = kc.board_id
    JOIN projects p ON p.id = kb.project_id
    JOIN users u ON u.id = auth.uid()
    WHERE kt.id::text = (storage.foldername(name))[1]
    AND p.organization_id = u.default_organization_id
  )
);

-- Пользователи могут удалять вложения задач проектов своей организации
CREATE POLICY "Users can delete task attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'task-attachments' AND
  EXISTS (
    SELECT 1 FROM kanban_tasks kt
    JOIN kanban_columns kc ON kc.id = kt.column_id
    JOIN kanban_boards kb ON kb.id = kc.board_id
    JOIN projects p ON p.id = kb.project_id
    JOIN users u ON u.id = auth.uid()
    WHERE kt.id::text = (storage.foldername(name))[1]
    AND p.organization_id = u.default_organization_id
  )
);

-- Политики для project-photos bucket
-- Пользователи могут загружать фотографии в проекты своей организации
CREATE POLICY "Users can upload project photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-photos' AND
  EXISTS (
    SELECT 1 FROM projects p
    JOIN users u ON u.id = auth.uid()
    WHERE p.id::text = (storage.foldername(name))[1]
    AND p.organization_id = u.default_organization_id
  )
);

-- Все могут читать фотографии проектов (публичный доступ)
CREATE POLICY "Anyone can read project photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-photos');

-- Пользователи могут удалять фотографии проектов своей организации
CREATE POLICY "Users can delete project photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-photos' AND
  EXISTS (
    SELECT 1 FROM projects p
    JOIN users u ON u.id = auth.uid()
    WHERE p.id::text = (storage.foldername(name))[1]
    AND p.organization_id = u.default_organization_id
  )
);

