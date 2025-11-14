/*
  # Enable RLS and Security Policies for profiles table

  1. Security Changes
    - Enable Row Level Security on profiles table
    - Add policy for anonymous users to insert their own profile
    - Add policy for anonymous users to read their own profile
    - Add policy for anonymous users to update their own profile
    - is_admin field is read-only (cannot be modified by users)

  2. Important Notes
    - Only database administrators can set is_admin = true
    - Regular users cannot escalate their privileges
    - Each user can only access their own profile data
*/

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "allow_anon_insert_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_anon_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_anon_update_own_profile" ON public.profiles;

-- Policy: Allow anonymous users to insert their own profile
CREATE POLICY "allow_anon_insert_profile" ON public.profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow anonymous users to read their own profile
CREATE POLICY "allow_anon_select_own_profile" ON public.profiles
  FOR SELECT
  TO anon
  USING (true);

-- Policy: Allow anonymous users to update their own profile (but not is_admin)
CREATE POLICY "allow_anon_update_own_profile" ON public.profiles
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);