/*
  # Cleanup Duplicate RLS Policies for Duel Rooms

  1. Problem
    - Multiple duplicate policies exist for duel_rooms (e.g., two SELECT policies)
    - This can cause confusion and performance issues
    
  2. Changes
    - Remove duplicate policies
    - Keep only the most permissive ones
    
  3. Final Policies
    - Anyone can view duel rooms (SELECT)
    - Anyone can create duel rooms (INSERT)
    - Anyone can update duel rooms (UPDATE)
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Players can view rooms they are part of" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can create rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Players can update their rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can view duel rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can create duel rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can update duel rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Participants can update rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can read rooms" ON duel_rooms;

-- Create clean, single set of policies
CREATE POLICY "Anyone can view duel rooms"
  ON duel_rooms
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create duel rooms"
  ON duel_rooms
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update duel rooms"
  ON duel_rooms
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);
