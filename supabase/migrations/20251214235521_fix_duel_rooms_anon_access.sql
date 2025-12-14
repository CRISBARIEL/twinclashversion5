/*
  # Fix Duel Rooms Access for Anonymous Users

  1. Problem
    - PGRST204 error when inserting into duel_rooms
    - Policies are set TO public but anon users need explicit permissions
    
  2. Changes
    - Drop existing policies
    - Create new policies explicitly for anon and authenticated users
    - Allow INSERT, SELECT, UPDATE operations
    
  3. Security
    - Allows anonymous users to create, view, and update duel rooms
    - Required for duel functionality to work
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view duel rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can create duel rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can update duel rooms" ON duel_rooms;

-- Create policies for both anon and authenticated users
CREATE POLICY "Anon and authenticated can view duel rooms"
  ON duel_rooms
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anon and authenticated can create duel rooms"
  ON duel_rooms
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anon and authenticated can update duel rooms"
  ON duel_rooms
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
