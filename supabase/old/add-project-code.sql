-- Add code field for short readable project IDs
-- Run this in Supabase SQL Editor

-- 1. Add code column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS code TEXT;

-- 2. Create a sequence for project numbers
CREATE SEQUENCE IF NOT EXISTS project_code_seq START WITH 1;

-- 3. Function to generate project code
CREATE OR REPLACE FUNCTION generate_project_code()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  new_code TEXT;
BEGIN
  -- Get next number from sequence
  next_num := nextval('project_code_seq');
  
  -- Format as PRJ-XXX (3 digits, zero-padded)
  new_code := 'PRJ-' || LPAD(next_num::TEXT, 3, '0');
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to auto-generate code on insert
CREATE OR REPLACE FUNCTION set_project_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := generate_project_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_set_project_code ON projects;
CREATE TRIGGER trigger_set_project_code
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION set_project_code();

-- 5. Update existing projects with codes
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT id FROM projects WHERE code IS NULL ORDER BY created_at
  LOOP
    UPDATE projects 
    SET code = generate_project_code() 
    WHERE id = rec.id;
  END LOOP;
END $$;

-- 6. Add unique constraint (drop first if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_code_unique'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT projects_code_unique UNIQUE (code);
  END IF;
END $$;

-- 7. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code);

SELECT 'Project code field added successfully. New projects will have codes like PRJ-001, PRJ-002, etc.' as status;

