/*
  # Add crew_id and is_bot fields to scores table

  1. New Columns
    - `crew_id` (text, nullable) - Identifier for friend groups/crews
    - `is_bot` (boolean, not null, default false) - Marks test/bot scores
    - `display_name` (text, nullable) - Optional display name for users

  2. Indexes
    - Create index on (seed, crew_id, time_ms, moves) for crew leaderboards
    - Create index on (seed, is_bot) for filtering human scores

  3. Notes
    - crew_id allows creating private leaderboards among friends
    - is_bot marks test scores transparently (shown with 🧪 icon)
    - display_name allows personalization without authentication
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scores' AND column_name = 'crew_id'
  ) THEN
    ALTER TABLE public.scores ADD COLUMN crew_id text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scores' AND column_name = 'is_bot'
  ) THEN
    ALTER TABLE public.scores ADD COLUMN is_bot boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scores' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE public.scores ADD COLUMN display_name text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_scores_seed_crew ON public.scores (seed, crew_id, time_ms ASC, moves ASC);
CREATE INDEX IF NOT EXISTS idx_scores_seed_bot ON public.scores (seed, is_bot);
