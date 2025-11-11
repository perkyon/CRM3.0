-- ============================================
-- 🔧 ИСПРАВЛЕНИЕ RLS ПОЛИТИК ДЛЯ PRODUCTION
-- ============================================
-- Добавляем недостающие RLS политики для production_zones
-- и проверяем политики для production_items и project_documents

BEGIN;

-- ============================================
-- 1. PRODUCTION_ZONES - добавляем политику для authenticated
-- ============================================

-- Удаляем старую политику если есть
DROP POLICY IF EXISTS "anon_all_production_zones" ON production_zones;
DROP POLICY IF EXISTS "authenticated_all_production_zones" ON production_zones;

-- Создаем политику для authenticated пользователей
CREATE POLICY "authenticated_all_production_zones" 
  ON production_zones FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- ============================================
-- 2. PRODUCTION_ITEMS - проверяем и исправляем
-- ============================================

-- Удаляем старую anon политику если есть
DROP POLICY IF EXISTS "anon_all_production_items" ON production_items;

-- Создаем/обновляем политику для authenticated
DROP POLICY IF EXISTS "authenticated_all_production_items" ON production_items;
CREATE POLICY "authenticated_all_production_items" 
  ON production_items FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- ============================================
-- 3. PROJECT_DOCUMENTS - проверяем и исправляем
-- ============================================

-- Удаляем старую anon политику если есть
DROP POLICY IF EXISTS "anon_all_project_documents" ON project_documents;

-- Создаем/обновляем политику для authenticated
DROP POLICY IF EXISTS "authenticated_all_project_documents" ON project_documents;
CREATE POLICY "authenticated_all_project_documents" 
  ON project_documents FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

COMMIT;

-- ============================================
-- ✅ ПРОВЕРКА РЕЗУЛЬТАТОВ
-- ============================================

-- Проверяем что политики созданы
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('production_zones', 'production_items', 'project_documents')
  AND policyname LIKE '%authenticated%'
ORDER BY tablename, policyname;

-- Если видишь 3 политики (по одной для каждой таблицы) - всё ок ✅
-- Если нет - значит что-то пошло не так ❌

