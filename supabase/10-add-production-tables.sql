-- ============================================
-- ДОБАВЛЕНИЕ ОТСУТСТВУЮЩИХ PRODUCTION ТАБЛИЦ
-- ============================================

-- Production Components (компоненты изделия)
CREATE TABLE IF NOT EXISTS production_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES production_items(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  material VARCHAR(255),
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit VARCHAR(20) DEFAULT 'шт',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Production Stages (этапы производства для компонентов)
CREATE TABLE IF NOT EXISTS production_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID NOT NULL REFERENCES production_components(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  position INTEGER DEFAULT 0,
  color VARCHAR(50) DEFAULT 'bg-gray-300',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Production Item Stages (общие этапы изделия)
CREATE TABLE IF NOT EXISTS production_item_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES production_items(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  position INTEGER DEFAULT 0,
  color VARCHAR(50) DEFAULT 'bg-gray-300',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_production_components_item_id ON production_components(item_id);
CREATE INDEX IF NOT EXISTS idx_production_stages_component_id ON production_stages(component_id);
CREATE INDEX IF NOT EXISTS idx_production_item_stages_item_id ON production_item_stages(item_id);

-- Triggers для updated_at
CREATE OR REPLACE FUNCTION update_production_components_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_production_components_updated_at ON production_components;
CREATE TRIGGER update_production_components_updated_at
BEFORE UPDATE ON production_components
FOR EACH ROW
EXECUTE FUNCTION update_production_components_updated_at();

DROP TRIGGER IF EXISTS update_production_stages_updated_at ON production_stages;
CREATE TRIGGER update_production_stages_updated_at
BEFORE UPDATE ON production_stages
FOR EACH ROW
EXECUTE FUNCTION update_production_components_updated_at();

DROP TRIGGER IF EXISTS update_production_item_stages_updated_at ON production_item_stages;
CREATE TRIGGER update_production_item_stages_updated_at
BEFORE UPDATE ON production_item_stages
FOR EACH ROW
EXECUTE FUNCTION update_production_components_updated_at();

-- RLS Policies
ALTER TABLE production_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_item_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_production_components" ON production_components;
CREATE POLICY "anon_all_production_components" 
  ON production_components FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_production_stages" ON production_stages;
CREATE POLICY "anon_all_production_stages" 
  ON production_stages FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_production_item_stages" ON production_item_stages;
CREATE POLICY "anon_all_production_item_stages" 
  ON production_item_stages FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE production_components;
ALTER PUBLICATION supabase_realtime ADD TABLE production_stages;
ALTER PUBLICATION supabase_realtime ADD TABLE production_item_stages;

-- Проверка
SELECT 'production_components' as table_name, COUNT(*) as count FROM production_components
UNION ALL
SELECT 'production_stages', COUNT(*) FROM production_stages
UNION ALL
SELECT 'production_item_stages', COUNT(*) FROM production_item_stages;

