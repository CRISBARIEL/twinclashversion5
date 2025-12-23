/*
  # Fix Level Number Constraint
  
  1. Changes
    - Remove old constraint limiting level_number to 1-10
    - Add new constraint allowing level_number from 1-100
  
  2. Reason
    - The game has 5 worlds with 20 levels each (total: 100 levels)
    - Previous constraint only allowed levels 1-10, causing insert failures
*/

DO $$
BEGIN
  -- Drop the old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'duel_rooms' AND constraint_name = 'duel_rooms_level_number_check'
  ) THEN
    ALTER TABLE duel_rooms DROP CONSTRAINT duel_rooms_level_number_check;
  END IF;
  
  -- Add new constraint allowing levels 1-100
  ALTER TABLE duel_rooms ADD CONSTRAINT duel_rooms_level_number_check CHECK (level_number >= 1 AND level_number <= 100);
END $$;
