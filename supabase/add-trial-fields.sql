-- ============================================
-- Добавление колонок для триала/планов
-- ============================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS plan subscription_plan NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS trial_starts_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS trial_active BOOLEAN DEFAULT false;

-- Обновляем существующие организации: ставим plan = 'free'
UPDATE organizations
SET plan = 'free'
WHERE plan IS NULL;


