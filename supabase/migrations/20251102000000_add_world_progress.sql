/*
  # Add World Progress System

  1. Changes
    - Add current_world column to track active world (1-5)
    - Add current_level column to track current level (1-25)
    - Add worlds_completed column to track unlocked worlds (0-5)

  2. Notes
    - current_world defaults to 1 (first world)
    - current_level defaults to 1 (first level overall)
    - worlds_completed defaults to 0 (only world 1 unlocked)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'current_world'
  ) THEN
    ALTER TABLE profiles ADD COLUMN current_world INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'current_level'
  ) THEN
    ALTER TABLE profiles ADD COLUMN current_level INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'worlds_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN worlds_completed INTEGER DEFAULT 0;
  END IF;
END $$;
