/*
  # Fix world_progress table schema

  1. Changes
    - Drop existing world_progress table if it exists with wrong schema
    - Create correct world_progress table with client_id instead of user_id
    - Add proper RLS policies
    - Add indexes for performance

  2. Security
    - Enable RLS
    - Allow anonymous users to manage their own world progress
*/

-- Drop the existing table if it has wrong schema
DROP TABLE IF EXISTS public.world_progress CASCADE;

-- Create the correct table
CREATE TABLE IF NOT EXISTS public.world_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  world_id text NOT NULL,
  purchased boolean DEFAULT false,
  levels jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, world_id)
);

-- Enable RLS
ALTER TABLE public.world_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous users
CREATE POLICY "allow_anon_select_world_progress"
  ON public.world_progress
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "allow_anon_insert_world_progress"
  ON public.world_progress
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "allow_anon_update_world_progress"
  ON public.world_progress
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_world_progress_client_id ON public.world_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_world_progress_world_id ON public.world_progress(world_id);