/*
  # Create scores table for daily leaderboard

  1. New Tables
    - `scores`
      - `id` (uuid, primary key) - Unique identifier for each score entry
      - `seed` (text, not null) - Daily challenge seed (YYYY-MM-DD format)
      - `time_ms` (integer, not null) - Time taken to complete in milliseconds
      - `moves` (integer, not null) - Number of moves made
      - `client_id` (text, not null) - Anonymous client identifier
      - `created_at` (timestamptz, not null) - Timestamp when score was submitted

  2. Security
    - Enable RLS on `scores` table
    - Add policy for anonymous users to insert their own scores
    - Add policy for anonymous users to read all scores

  3. Indexes
    - Create index on (seed, time_ms, moves) for efficient leaderboard queries
*/

CREATE TABLE IF NOT EXISTS public.scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seed text NOT NULL,
  time_ms integer NOT NULL CHECK (time_ms > 0),
  moves integer NOT NULL CHECK (moves > 0),
  client_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scores_seed_time ON public.scores (seed, time_ms ASC, moves ASC);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_insert" ON public.scores
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "allow_anon_select" ON public.scores
  FOR SELECT
  TO anon
  USING (true);
