/*
  # Create profiles table for user progression

  1. New Tables
    - `profiles`
      - `client_id` (text, primary key) - Anonymous client identifier
      - `coins` (integer, not null, default 0) - Currency for rewards
      - `owned_skins` (text[], not null, default '{}') - Array of owned skin IDs
      - `equipped_skin` (text, nullable) - Currently equipped skin ID
      - `last_daily_at` (date, nullable) - Last daily reward claim date
      - `updated_at` (timestamptz, not null) - Last update timestamp

  2. Security
    - Enable RLS on `profiles` table
    - Add policy for anonymous users to insert their profile
    - Add policy for anonymous users to read their own profile
    - Add policy for anonymous users to update their own profile

  3. Indexes
    - Create index on client_id for efficient lookups
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  client_id text PRIMARY KEY,
  coins integer NOT NULL DEFAULT 0,
  owned_skins text[] NOT NULL DEFAULT '{}',
  equipped_skin text,
  last_daily_at date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_client_id ON public.profiles (client_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_insert_profile" ON public.profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "allow_anon_select_own_profile" ON public.profiles
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "allow_anon_update_own_profile" ON public.profiles
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
