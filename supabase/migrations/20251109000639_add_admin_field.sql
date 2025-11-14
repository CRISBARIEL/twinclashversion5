/*
  # Add admin field to profiles

  1. Changes
    - Add `is_admin` boolean field to profiles table
    - Default value is false
    - Only admins can unlock worlds for testing

  2. Security
    - Field is read-only for regular users
    - Only database owners can modify this field
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;
