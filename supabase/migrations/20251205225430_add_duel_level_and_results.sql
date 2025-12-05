/*
  # Add Level Selection and Game Results to Duel Rooms

  1. Changes to `duel_rooms` table
    - Add `level_number` (integer) - Specific level within the selected world (1-10)
    - Add `host_time` (integer) - Time in seconds taken by host to complete the game
    - Add `host_score` (integer) - Number of matched pairs by host
    - Add `guest_time` (integer) - Time in seconds taken by guest to complete the game
    - Add `guest_score` (integer) - Number of matched pairs by guest
  
  2. Purpose
    - Allow players to select specific levels within worlds for duels
    - Store detailed game results (time and score) for both players
    - Determine winner based on fastest completion time
    - Display comparative results at the end of the duel
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'duel_rooms' AND column_name = 'level_number'
  ) THEN
    ALTER TABLE duel_rooms ADD COLUMN level_number integer NOT NULL DEFAULT 1 CHECK (level_number >= 1 AND level_number <= 10);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'duel_rooms' AND column_name = 'host_time'
  ) THEN
    ALTER TABLE duel_rooms ADD COLUMN host_time integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'duel_rooms' AND column_name = 'host_score'
  ) THEN
    ALTER TABLE duel_rooms ADD COLUMN host_score integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'duel_rooms' AND column_name = 'guest_time'
  ) THEN
    ALTER TABLE duel_rooms ADD COLUMN guest_time integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'duel_rooms' AND column_name = 'guest_score'
  ) THEN
    ALTER TABLE duel_rooms ADD COLUMN guest_score integer;
  END IF;
END $$;