-- STEP 1: Add new enum values
-- Run this first, then run step 2 in a separate transaction

-- Add 'preliminary_design' if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'preliminary_design' AND enumtypid = 'project_stage'::regtype) THEN
    ALTER TYPE project_stage ADD VALUE 'preliminary_design';
  END IF;
END $$;

-- Add 'client_approval' if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'client_approval' AND enumtypid = 'project_stage'::regtype) THEN
    ALTER TYPE project_stage ADD VALUE 'client_approval';
  END IF;
END $$;

-- Add 'tech_approval' if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'tech_approval' AND enumtypid = 'project_stage'::regtype) THEN
    ALTER TYPE project_stage ADD VALUE 'tech_approval';
  END IF;
END $$;

-- Add 'quality_check' if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'quality_check' AND enumtypid = 'project_stage'::regtype) THEN
    ALTER TYPE project_stage ADD VALUE 'quality_check';
  END IF;
END $$;

-- Add 'packaging' if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'packaging' AND enumtypid = 'project_stage'::regtype) THEN
    ALTER TYPE project_stage ADD VALUE 'packaging';
  END IF;
END $$;

-- Add 'delivery' if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'delivery' AND enumtypid = 'project_stage'::regtype) THEN
    ALTER TYPE project_stage ADD VALUE 'delivery';
  END IF;
END $$;

-- Add 'installation' if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'installation' AND enumtypid = 'project_stage'::regtype) THEN
    ALTER TYPE project_stage ADD VALUE 'installation';
  END IF;
END $$;

-- Add 'completed' if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'completed' AND enumtypid = 'project_stage'::regtype) THEN
    ALTER TYPE project_stage ADD VALUE 'completed';
  END IF;
END $$;

-- Add 'cancelled' if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'cancelled' AND enumtypid = 'project_stage'::regtype) THEN
    ALTER TYPE project_stage ADD VALUE 'cancelled';
  END IF;
END $$;

SELECT 'Новые значения enum добавлены! Теперь выполните второй скрипт.' as status;

-- Show current enum values
SELECT enumlabel as stage_value 
FROM pg_enum 
WHERE enumtypid = 'project_stage'::regtype 
ORDER BY enumsortorder;

