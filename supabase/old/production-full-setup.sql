-- Full Production Setup (all-in-one script)
-- Run this single script to clean up, create tables, and seed data

-- STEP 1: Clean up existing tables
DROP TABLE IF EXISTS production_stages CASCADE;
DROP TABLE IF EXISTS production_item_stages CASCADE;
DROP TABLE IF EXISTS production_components CASCADE;
DROP TABLE IF EXISTS production_items CASCADE;
DROP TABLE IF EXISTS production_zones CASCADE;

-- STEP 2: Create tables
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Production Zones (e.g., Living Room, Kitchen, Bedroom)
CREATE TABLE production_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  items_count INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  color VARCHAR(50) DEFAULT 'bg-blue-100',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Production Items (e.g., Wardrobe, TV Stand)
CREATE TABLE production_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES production_zones(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity INTEGER DEFAULT 1,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_stage VARCHAR(100),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Production Components (e.g., Body, Facades, Countertop)
CREATE TABLE production_components (
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

-- Production Stages (e.g., Cutting, Edging, Drilling)
CREATE TABLE production_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID NOT NULL REFERENCES production_components(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  position INTEGER DEFAULT 0,
  color VARCHAR(50) DEFAULT 'bg-gray-300',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item stages (overall item stages)
CREATE TABLE production_item_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES production_items(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  position INTEGER DEFAULT 0,
  color VARCHAR(50) DEFAULT 'bg-gray-300',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_production_zones_project_id ON production_zones(project_id);
CREATE INDEX idx_production_items_project_id ON production_items(project_id);
CREATE INDEX idx_production_items_zone_id ON production_items(zone_id);
CREATE INDEX idx_production_components_item_id ON production_components(item_id);
CREATE INDEX idx_production_stages_component_id ON production_stages(component_id);
CREATE INDEX idx_production_item_stages_item_id ON production_item_stages(item_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_production_zones_updated_at
BEFORE UPDATE ON production_zones
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_items_updated_at
BEFORE UPDATE ON production_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_components_updated_at
BEFORE UPDATE ON production_components
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- STEP 3: Seed data
DO $$ 
DECLARE
  v_project_id UUID;
  v_zone_living_id UUID;
  v_zone_kitchen_id UUID;
  v_zone_bedroom_id UUID;
  v_zone_kids_id UUID;
  v_item_wardrobe_id UUID;
  v_item_tv_stand_id UUID;
  v_item_kitchen_lower_id UUID;
  v_comp_id UUID;
BEGIN
  -- Get or create a test project
  SELECT id INTO v_project_id FROM projects WHERE title LIKE '%Светлана%' LIMIT 1;
  
  IF v_project_id IS NULL THEN
    INSERT INTO projects (
      title, 
      client_id,
      stage, 
      priority, 
      budget,
      due_date,
      created_at
    ) VALUES (
      'Дом Светлана Гаражная',
      (SELECT id FROM clients LIMIT 1),
      'production',
      'high',
      2500000,
      NOW() + INTERVAL '30 days',
      NOW()
    ) RETURNING id INTO v_project_id;
  END IF;

  -- Create zones
  INSERT INTO production_zones (project_id, name, items_count, progress, color, position)
  VALUES (v_project_id, 'Гостиная', 3, 75, 'bg-blue-100', 0)
  RETURNING id INTO v_zone_living_id;
  
  INSERT INTO production_zones (project_id, name, items_count, progress, color, position)
  VALUES (v_project_id, 'Кухня', 2, 60, 'bg-green-100', 1)
  RETURNING id INTO v_zone_kitchen_id;
  
  INSERT INTO production_zones (project_id, name, items_count, progress, color, position)
  VALUES (v_project_id, 'Спальня', 2, 45, 'bg-purple-100', 2)
  RETURNING id INTO v_zone_bedroom_id;
  
  INSERT INTO production_zones (project_id, name, items_count, progress, color, position)
  VALUES (v_project_id, 'Детская', 1, 25, 'bg-yellow-100', 3)
  RETURNING id INTO v_zone_kids_id;

  -- Create items
  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES (v_project_id, v_zone_living_id, 'ШК-001', 'Шкаф-купе 3-створчатый', 1, 80, 'Сборка', 0)
  RETURNING id INTO v_item_wardrobe_id;
  
  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES (v_project_id, v_zone_living_id, 'ТВ-001', 'ТВ-тумба подвесная', 1, 95, 'Упаковка', 1)
  RETURNING id INTO v_item_tv_stand_id;
  
  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES (v_project_id, v_zone_living_id, 'СТ-001', 'Стеллаж открытый', 1, 60, 'Сверловка', 2);

  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES (v_project_id, v_zone_kitchen_id, 'КУХ-НИЗ-001', 'Кухня нижние модули', 5, 70, 'Сборка', 0)
  RETURNING id INTO v_item_kitchen_lower_id;
  
  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES (v_project_id, v_zone_kitchen_id, 'КУХ-ВЕРХ-001', 'Кухня верхние модули', 4, 55, 'Кромление', 1);

  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES (v_project_id, v_zone_bedroom_id, 'КРВ-001', 'Кровать с подъемным механизмом', 1, 50, 'Кромление', 0);
  
  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES (v_project_id, v_zone_bedroom_id, 'ШК-002', 'Шкаф распашной 2-створчатый', 1, 40, 'Раскрой', 1);

  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES (v_project_id, v_zone_kids_id, 'ДЕТ-001', 'Стол письменный с тумбой', 1, 25, 'В очереди', 0);

  -- Components for Wardrobe
  INSERT INTO production_components (item_id, name, material, quantity, unit, progress, position)
  VALUES (v_item_wardrobe_id, 'Корпус', 'ЛДСП 18мм Белый', 1, 'шт', 90, 0)
  RETURNING id INTO v_comp_id;
  
  INSERT INTO production_stages (component_id, name, status, position, color)
  VALUES 
    (v_comp_id, 'Раскрой', 'completed', 0, 'bg-green-500'),
    (v_comp_id, 'Кромление', 'completed', 1, 'bg-green-500'),
    (v_comp_id, 'Сверловка', 'completed', 2, 'bg-green-500'),
    (v_comp_id, 'Сборка', 'in_progress', 3, 'bg-blue-500'),
    (v_comp_id, 'Упаковка', 'pending', 4, 'bg-gray-300');

  INSERT INTO production_components (item_id, name, material, quantity, unit, progress, position)
  VALUES (v_item_wardrobe_id, 'Фасады', 'Зеркало + ЛДСП', 3, 'шт', 70, 1)
  RETURNING id INTO v_comp_id;
  
  INSERT INTO production_stages (component_id, name, status, position, color)
  VALUES 
    (v_comp_id, 'Раскрой', 'completed', 0, 'bg-green-500'),
    (v_comp_id, 'Кромление', 'completed', 1, 'bg-green-500'),
    (v_comp_id, 'Сверловка', 'in_progress', 2, 'bg-blue-500'),
    (v_comp_id, 'Сборка', 'pending', 3, 'bg-gray-300'),
    (v_comp_id, 'Упаковка', 'pending', 4, 'bg-gray-300');

  INSERT INTO production_components (item_id, name, material, quantity, unit, progress, position)
  VALUES (v_item_wardrobe_id, 'Раздвижная система', 'Система Aristo', 1, 'компл', 100, 2);

  -- Item stages for Wardrobe
  INSERT INTO production_item_stages (item_id, name, status, position, color)
  VALUES 
    (v_item_wardrobe_id, 'Раскрой', 'completed', 0, 'bg-green-500'),
    (v_item_wardrobe_id, 'Кромление', 'completed', 1, 'bg-green-500'),
    (v_item_wardrobe_id, 'Сверловка', 'completed', 2, 'bg-green-500'),
    (v_item_wardrobe_id, 'Сборка', 'in_progress', 3, 'bg-blue-500'),
    (v_item_wardrobe_id, 'Упаковка', 'pending', 4, 'bg-gray-300');

  -- Components for TV Stand
  INSERT INTO production_components (item_id, name, material, quantity, unit, progress, position)
  VALUES 
    (v_item_tv_stand_id, 'Корпус', 'ЛДСП 18мм Дуб', 1, 'шт', 100, 0),
    (v_item_tv_stand_id, 'Фасады', 'МДФ крашеный RAL 9003', 2, 'шт', 100, 1);

  -- Item stages for TV Stand
  INSERT INTO production_item_stages (item_id, name, status, position, color)
  VALUES 
    (v_item_tv_stand_id, 'Раскрой', 'completed', 0, 'bg-green-500'),
    (v_item_tv_stand_id, 'Кромление', 'completed', 1, 'bg-green-500'),
    (v_item_tv_stand_id, 'Сверловка', 'completed', 2, 'bg-green-500'),
    (v_item_tv_stand_id, 'Сборка', 'completed', 3, 'bg-green-500'),
    (v_item_tv_stand_id, 'Упаковка', 'in_progress', 4, 'bg-blue-500');

  -- Components for Kitchen Lower
  INSERT INTO production_components (item_id, name, material, quantity, unit, progress, position)
  VALUES 
    (v_item_kitchen_lower_id, 'Корпуса тумб', 'ЛДСП 18мм Серый', 5, 'шт', 80, 0),
    (v_item_kitchen_lower_id, 'Фасады', 'МДФ эмаль Слоновая кость', 10, 'шт', 60, 1),
    (v_item_kitchen_lower_id, 'Столешница', 'Кварц 3см', 3.2, 'м', 50, 2);

  -- Item stages for Kitchen Lower
  INSERT INTO production_item_stages (item_id, name, status, position, color)
  VALUES 
    (v_item_kitchen_lower_id, 'Раскрой', 'completed', 0, 'bg-green-500'),
    (v_item_kitchen_lower_id, 'Кромление', 'completed', 1, 'bg-green-500'),
    (v_item_kitchen_lower_id, 'Сверловка', 'in_progress', 2, 'bg-blue-500'),
    (v_item_kitchen_lower_id, 'Сборка', 'pending', 3, 'bg-gray-300'),
    (v_item_kitchen_lower_id, 'Упаковка', 'pending', 4, 'bg-gray-300');

  RAISE NOTICE 'Successfully created production tables and seeded data!';
  RAISE NOTICE 'Project ID: %', v_project_id;
  
END $$;



