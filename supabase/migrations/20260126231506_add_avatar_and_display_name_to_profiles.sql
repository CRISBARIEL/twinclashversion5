/*
  # Add Avatar System to Profiles

  1. Changes to `profiles` table
    - Add `display_name` (text) - Player's display name (3-16 characters)
    - Add `avatar_config` (jsonb) - Avatar configuration object containing:
      - faceColor: hex color string
      - eyesId: integer (0-4)
      - mouthId: integer (0-4)
      - hairId: integer (0-4)
      - accessoryId: integer (0-3, nullable)

  2. Notes
    - `display_name` defaults to null until player sets it
    - `avatar_config` defaults to null, will be created on first avatar edit
    - Both fields are optional to maintain backwards compatibility
*/

DO $$
BEGIN
  -- Add display_name column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN display_name text;
  END IF;

  -- Add avatar_config column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_config'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_config jsonb;
  END IF;
END $$;