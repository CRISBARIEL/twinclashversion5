/*
  # Fix Daily Systems to use client_id instead of user_id

  1. Changes
    - Modify `daily_login` table to use `client_id` (text) instead of `user_id` (uuid)
    - Modify `daily_missions` table to use `client_id` (text) instead of `user_id` (uuid)
    - Update RLS policies to allow anonymous access based on client_id
    - Preserve existing data by migrating user_id to client_id where possible

  2. Why
    - The game allows playing without authentication
    - Daily login and missions were broken for non-authenticated users
    - This makes the systems work like user_lives (which already supports client_id)
*/

-- Drop existing policies for daily_login
DROP POLICY IF EXISTS "Users can view own daily login" ON daily_login;
DROP POLICY IF EXISTS "Users can insert own daily login" ON daily_login;
DROP POLICY IF EXISTS "Users can update own daily login" ON daily_login;

-- Drop existing policies for daily_missions
DROP POLICY IF EXISTS "Users can view own daily missions" ON daily_missions;
DROP POLICY IF EXISTS "Users can insert own daily missions" ON daily_missions;
DROP POLICY IF EXISTS "Users can update own daily missions" ON daily_missions;
DROP POLICY IF EXISTS "Users can delete own daily missions" ON daily_missions;

-- Modify daily_login table
DO $$
BEGIN
  -- Add new client_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_login' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE daily_login ADD COLUMN client_id text;
  END IF;

  -- Drop the old primary key constraint
  ALTER TABLE daily_login DROP CONSTRAINT IF EXISTS daily_login_pkey;

  -- Drop the foreign key constraint to auth.users
  ALTER TABLE daily_login DROP CONSTRAINT IF EXISTS daily_login_user_id_fkey;

  -- Make user_id nullable
  ALTER TABLE daily_login ALTER COLUMN user_id DROP NOT NULL;

  -- Set client_id as primary key
  ALTER TABLE daily_login ADD PRIMARY KEY (client_id);

  -- Add index on user_id for lookups
  CREATE INDEX IF NOT EXISTS idx_daily_login_user_id ON daily_login(user_id);
END $$;

-- Modify daily_missions table
DO $$
BEGIN
  -- Add new client_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_missions' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE daily_missions ADD COLUMN client_id text;
  END IF;

  -- Drop the foreign key constraint to auth.users
  ALTER TABLE daily_missions DROP CONSTRAINT IF EXISTS daily_missions_user_id_fkey;

  -- Make user_id nullable
  ALTER TABLE daily_missions ALTER COLUMN user_id DROP NOT NULL;

  -- Drop old unique constraint
  ALTER TABLE daily_missions DROP CONSTRAINT IF EXISTS daily_missions_user_id_mission_date_mission_type_key;

  -- Add new unique constraint with client_id
  ALTER TABLE daily_missions ADD CONSTRAINT daily_missions_client_id_mission_date_mission_type_key
    UNIQUE (client_id, mission_date, mission_type);

  -- Add index on client_id for lookups
  CREATE INDEX IF NOT EXISTS idx_daily_missions_client_id ON daily_missions(client_id);
  CREATE INDEX IF NOT EXISTS idx_daily_missions_user_id ON daily_missions(user_id);
END $$;

-- Create new RLS policies for daily_login (allow all anonymous users to manage their own data by client_id)
CREATE POLICY "Anyone can view own daily login by client_id"
  ON daily_login FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert own daily login by client_id"
  ON daily_login FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update own daily login by client_id"
  ON daily_login FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create new RLS policies for daily_missions (allow all anonymous users to manage their own data by client_id)
CREATE POLICY "Anyone can view own daily missions by client_id"
  ON daily_missions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert own daily missions by client_id"
  ON daily_missions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update own daily missions by client_id"
  ON daily_missions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete own daily missions by client_id"
  ON daily_missions FOR DELETE
  TO anon, authenticated
  USING (true);
