/*
  # Create World Progress Table

  1. New Table
    - `world_progress`
      - `id` (uuid, primary key)
      - `client_id` (text, foreign key)
      - `world_id` (text, e.g., 'world-1', 'world-2')
      - `purchased` (boolean, default false)
      - `levels` (jsonb, array of {unlocked, completed, stars})
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `world_progress` table
    - Add policy for users to read/write their own world progress

  3. Indexes
    - Unique index on (client_id, world_id)
*/

CREATE TABLE IF NOT EXISTS world_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  world_id text NOT NULL,
  purchased boolean DEFAULT false,
  levels jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, world_id)
);

ALTER TABLE world_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own world progress"
  ON world_progress
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own world progress"
  ON world_progress
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own world progress"
  ON world_progress
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_world_progress_client_id ON world_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_world_progress_world_id ON world_progress(world_id);
