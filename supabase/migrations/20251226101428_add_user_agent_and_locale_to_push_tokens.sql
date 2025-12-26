/*
  # Add user_agent and locale fields to push_tokens

  1. Changes
    - Add `user_agent` (text) - Browser user agent string
    - Add `locale` (text) - User's locale/language preference

  2. Purpose
    - Better tracking of device types and user demographics
    - Enables locale-specific notifications in the future
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'push_tokens' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE push_tokens ADD COLUMN user_agent text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'push_tokens' AND column_name = 'locale'
  ) THEN
    ALTER TABLE push_tokens ADD COLUMN locale text;
  END IF;
END $$;
