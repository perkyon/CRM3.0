-- Fix kanban_boards table - add missing description column
ALTER TABLE kanban_boards ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing boards to have empty description
UPDATE kanban_boards SET description = '' WHERE description IS NULL;

-- Make description column NOT NULL with default value
ALTER TABLE kanban_boards ALTER COLUMN description SET DEFAULT '';
ALTER TABLE kanban_boards ALTER COLUMN description SET NOT NULL;

-- Refresh schema cache (this will help Supabase recognize the changes)
NOTIFY pgrst, 'reload schema';
