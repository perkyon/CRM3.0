-- Production Management Schema
-- Creates tables for zones, items, components, and stages

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Production Zones (e.g., Living Room, Kitchen, Bedroom)
CREATE TABLE IF NOT EXISTS production_zones (
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
CREATE TABLE IF NOT EXISTS production_items (
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

-- Production Stages (e.g., Cutting, Edging, Drilling)
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

-- Also add stages for items (overall item stages)
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_production_zones_project_id ON production_zones(project_id);
CREATE INDEX IF NOT EXISTS idx_production_items_project_id ON production_items(project_id);
CREATE INDEX IF NOT EXISTS idx_production_items_zone_id ON production_items(zone_id);
CREATE INDEX IF NOT EXISTS idx_production_components_item_id ON production_components(item_id);
CREATE INDEX IF NOT EXISTS idx_production_stages_component_id ON production_stages(component_id);
CREATE INDEX IF NOT EXISTS idx_production_item_stages_item_id ON production_item_stages(item_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_production_zones_updated_at ON production_zones;
CREATE TRIGGER update_production_zones_updated_at
BEFORE UPDATE ON production_zones
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_production_items_updated_at ON production_items;
CREATE TRIGGER update_production_items_updated_at
BEFORE UPDATE ON production_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_production_components_updated_at ON production_components;
CREATE TRIGGER update_production_components_updated_at
BEFORE UPDATE ON production_components
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE production_zones IS 'Production zones/areas within a project (e.g., Living Room, Kitchen)';
COMMENT ON TABLE production_items IS 'Furniture items to be manufactured (e.g., Wardrobe, TV Stand)';
COMMENT ON TABLE production_components IS 'Components of a furniture item (e.g., Body, Facades)';
COMMENT ON TABLE production_stages IS 'Manufacturing stages for each component (e.g., Cutting, Edging)';
COMMENT ON TABLE production_item_stages IS 'Overall manufacturing stages for the entire item';


