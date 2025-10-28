-- DISABLE ALL RLS (Row Level Security)
-- WARNING: This is for development only! 
-- DO NOT use in production without proper policies!

-- Disable RLS on all main tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Disable RLS on production tables
ALTER TABLE production_zones DISABLE ROW LEVEL SECURITY;
ALTER TABLE production_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE production_components DISABLE ROW LEVEL SECURITY;
ALTER TABLE production_stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE production_item_stages DISABLE ROW LEVEL SECURITY;

-- If production_component_parts table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'production_component_parts') THEN
    ALTER TABLE production_component_parts DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Disable RLS on kanban tables if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'kanban_tasks') THEN
    ALTER TABLE kanban_tasks DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'kanban_columns') THEN
    ALTER TABLE kanban_columns DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Disable RLS on documents tables if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documents') THEN
    ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_documents') THEN
    ALTER TABLE client_documents DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'project_documents') THEN
    ALTER TABLE project_documents DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Disable RLS on activities table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activities') THEN
    ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Disable RLS on tags table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tags') THEN
    ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Disable RLS on commercial_documents table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'commercial_documents') THEN
    ALTER TABLE commercial_documents DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Disable RLS on materials table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'materials') THEN
    ALTER TABLE materials DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

SELECT 'RLS полностью отключен на всех таблицах!' as status;

