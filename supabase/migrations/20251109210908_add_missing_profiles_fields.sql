/*
  # Add missing fields to profiles table

  1. New Columns
    - `coins` (integer) - User's coin balance
    - `owned_skins` (text[]) - Array of owned skin IDs
    - `equipped_skin` (text) - Currently equipped skin
    - `last_daily_at` (date) - Last daily reward claim
    - `updated_at` (timestamptz) - Last update timestamp

  2. Notes
    - Add columns if they don't exist
    - Set reasonable defaults
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'coins'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN coins integer NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'owned_skins'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN owned_skins text[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'equipped_skin'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN equipped_skin text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_daily_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_daily_at date;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;