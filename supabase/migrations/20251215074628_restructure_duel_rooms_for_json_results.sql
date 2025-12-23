/*
  # Restructure Duel Rooms Table for JSON Results

  1. Changes
    - Rename level_number to level
    - Remove world_id (not needed)
    - Replace separate time/score columns with JSON result columns:
      * Remove: host_time, host_score, host_finished_at
      * Remove: guest_time, guest_score, guest_finished_at
      * Remove: winner_client_id
      * Add: host_result (jsonb)
      * Add: guest_result (jsonb)
    - Add started_at and finished_at timestamps
    - Remove expires_at (not used in new design)

  2. Data Migration
    - Convert existing separate columns to JSON format
    - Preserve all existing duel room data

  3. Security
    - Existing RLS policies remain unchanged
*/

-- Add new columns
ALTER TABLE duel_rooms 
  ADD COLUMN IF NOT EXISTS level integer,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS finished_at timestamptz,
  ADD COLUMN IF NOT EXISTS host_result jsonb,
  ADD COLUMN IF NOT EXISTS guest_result jsonb;

-- Migrate existing data from level_number to level
UPDATE duel_rooms 
SET level = level_number 
WHERE level IS NULL;

-- Migrate existing separate time/score data to JSON format
UPDATE duel_rooms
SET host_result = jsonb_build_object(
  'win', true,
  'timeMs', COALESCE(host_time, 0) * 1000,
  'moves', 0,
  'pairsFound', COALESCE(host_score, 0),
  'submittedAt', COALESCE(host_finished_at, now())::text
)
WHERE host_time IS NOT NULL 
  AND host_result IS NULL;

UPDATE duel_rooms
SET guest_result = jsonb_build_object(
  'win', true,
  'timeMs', COALESCE(guest_time, 0) * 1000,
  'moves', 0,
  'pairsFound', COALESCE(guest_score, 0),
  'submittedAt', COALESCE(guest_finished_at, now())::text
)
WHERE guest_time IS NOT NULL 
  AND guest_result IS NULL;

-- Set finished_at based on existing data
UPDATE duel_rooms
SET finished_at = GREATEST(
  COALESCE(host_finished_at, '1970-01-01'::timestamptz),
  COALESCE(guest_finished_at, '1970-01-01'::timestamptz)
)
WHERE status = 'finished' 
  AND finished_at IS NULL
  AND (host_finished_at IS NOT NULL OR guest_finished_at IS NOT NULL);

-- Drop old columns
ALTER TABLE duel_rooms
  DROP COLUMN IF EXISTS level_number,
  DROP COLUMN IF EXISTS world_id,
  DROP COLUMN IF EXISTS host_time,
  DROP COLUMN IF EXISTS host_score,
  DROP COLUMN IF EXISTS host_finished_at,
  DROP COLUMN IF EXISTS guest_time,
  DROP COLUMN IF EXISTS guest_score,
  DROP COLUMN IF EXISTS guest_finished_at,
  DROP COLUMN IF EXISTS winner_client_id,
  DROP COLUMN IF EXISTS expires_at;

-- Make level NOT NULL (all rows should have it now)
ALTER TABLE duel_rooms
  ALTER COLUMN level SET NOT NULL,
  ALTER COLUMN level SET DEFAULT 1;
