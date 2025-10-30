-- ============================================
-- ДОБАВЛЕНИЕ ТАБЛИЦ ДЛЯ КОМПОНЕНТОВ
-- ============================================

-- Production Component Parts (детали компонента)
CREATE TABLE IF NOT EXISTS production_component_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID NOT NULL REFERENCES production_components(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  width DECIMAL(10, 2),
  height DECIMAL(10, 2),
  depth DECIMAL(10, 2),
  material VARCHAR(255),
  notes TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Production Component Materials (материалы компонента)
CREATE TABLE IF NOT EXISTS production_component_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID NOT NULL REFERENCES production_components(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  material_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit VARCHAR(20) DEFAULT 'шт',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_production_component_parts_component_id 
  ON production_component_parts(component_id);
CREATE INDEX IF NOT EXISTS idx_production_component_materials_component_id 
  ON production_component_materials(component_id);
CREATE INDEX IF NOT EXISTS idx_production_component_materials_material_id 
  ON production_component_materials(material_id);

-- Triggers для updated_at
CREATE OR REPLACE FUNCTION update_component_parts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_production_component_parts_updated_at 
  ON production_component_parts;
CREATE TRIGGER update_production_component_parts_updated_at
BEFORE UPDATE ON production_component_parts
FOR EACH ROW
EXECUTE FUNCTION update_component_parts_updated_at();

DROP TRIGGER IF EXISTS update_production_component_materials_updated_at 
  ON production_component_materials;
CREATE TRIGGER update_production_component_materials_updated_at
BEFORE UPDATE ON production_component_materials
FOR EACH ROW
EXECUTE FUNCTION update_component_parts_updated_at();

-- RLS Policies
ALTER TABLE production_component_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_component_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_production_component_parts" ON production_component_parts;
CREATE POLICY "anon_all_production_component_parts" 
  ON production_component_parts FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_production_component_materials" ON production_component_materials;
CREATE POLICY "anon_all_production_component_materials" 
  ON production_component_materials FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE production_component_parts;
ALTER PUBLICATION supabase_realtime ADD TABLE production_component_materials;

-- Проверка
SELECT 'production_component_parts' as table_name, COUNT(*) as count 
FROM production_component_parts
UNION ALL
SELECT 'production_component_materials', COUNT(*) 
FROM production_component_materials;

