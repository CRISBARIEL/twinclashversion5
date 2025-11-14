/*
  # Add bot and display name fields to scores table

  1. New Columns
    - `is_bot` (boolean) - Indicates if the score is from a bot
    - `display_name` (text) - Optional display name for the score
    - `crew_id` (text) - Optional crew identifier

  2. Notes
    - Add columns if they don't exist
    - Set reasonable defaults
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'scores' AND column_name = 'is_bot'
  ) THEN
    ALTER TABLE public.scores ADD COLUMN is_bot boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'scores' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE public.scores ADD COLUMN display_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'scores' AND column_name = 'crew_id'
  ) THEN
    ALTER TABLE public.scores ADD COLUMN crew_id text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_scores_crew_id ON public.scores(crew_id);
CREATE INDEX IF NOT EXISTS idx_scores_is_bot ON public.scores(is_bot);