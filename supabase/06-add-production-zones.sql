-- ============================================
-- ДОБАВЛЕНИЕ ТАБЛИЦЫ PRODUCTION_ZONES
-- ============================================

-- 1. Создаем таблицу production_zones
CREATE TABLE IF NOT EXISTS production_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  items_count INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  color VARCHAR(50),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_production_zones_project_id ON production_zones(project_id);

-- 3. Trigger для updated_at
CREATE OR REPLACE FUNCTION update_production_zones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_production_zones_updated_at ON production_zones;
CREATE TRIGGER update_production_zones_updated_at
BEFORE UPDATE ON production_zones
FOR EACH ROW
EXECUTE FUNCTION update_production_zones_updated_at();

-- 4. RLS policies
ALTER TABLE production_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_production_zones" ON production_zones;
CREATE POLICY "anon_all_production_zones" 
  ON production_zones FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- 5. Добавить в Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE production_zones;

-- 6. Комментарий
COMMENT ON TABLE production_zones IS 'Production zones/areas within a project (e.g., Living Room, Kitchen)';

-- Проверка
SELECT 'production_zones table created' as status;

