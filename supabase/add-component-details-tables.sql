-- Add tables for component details (materials, documents, stages)
-- For custom component cards in furniture CRM

-- Add material_type column to production_components if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'production_components' 
    AND column_name = 'material_type'
  ) THEN
    ALTER TABLE production_components 
    ADD COLUMN material_type VARCHAR(20) DEFAULT 'LDSP';
  END IF;
END $$;

-- Create component_materials table
CREATE TABLE IF NOT EXISTS component_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES production_components(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  spec VARCHAR(255),
  qty VARCHAR(100),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_component_materials_component_id 
  ON component_materials(component_id);

-- Create component_documents table
CREATE TABLE IF NOT EXISTS component_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES production_components(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  source VARCHAR(50) DEFAULT 'external', -- 'internal' or 'external'
  file_id UUID, -- reference to documents table if exists
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_component_documents_component_id 
  ON component_documents(component_id);

-- Add additional fields to production_stages if not exists
DO $$ 
BEGIN
  -- Add assignee field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'production_stages' 
    AND column_name = 'assignee'
  ) THEN
    ALTER TABLE production_stages 
    ADD COLUMN assignee VARCHAR(255);
  END IF;

  -- Add note field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'production_stages' 
    AND column_name = 'note'
  ) THEN
    ALTER TABLE production_stages 
    ADD COLUMN note TEXT;
  END IF;

  -- Add title field (alternative name for stage)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'production_stages' 
    AND column_name = 'title'
  ) THEN
    ALTER TABLE production_stages 
    ADD COLUMN title VARCHAR(255);
    
    -- Copy existing names to title
    UPDATE production_stages SET title = name WHERE title IS NULL;
  END IF;
END $$;

-- Create updated_at trigger for component_materials
CREATE OR REPLACE FUNCTION update_component_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_component_materials_updated_at 
  ON component_materials;

CREATE TRIGGER trigger_update_component_materials_updated_at
  BEFORE UPDATE ON component_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_component_materials_updated_at();

-- Create updated_at trigger for component_documents
CREATE OR REPLACE FUNCTION update_component_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_component_documents_updated_at 
  ON component_documents;

CREATE TRIGGER trigger_update_component_documents_updated_at
  BEFORE UPDATE ON component_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_component_documents_updated_at();

-- Disable RLS on new tables (for development)
ALTER TABLE component_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE component_documents DISABLE ROW LEVEL SECURITY;

SELECT 'Component details tables created successfully!' as status;

