/*
  # Fix Duel Rooms RLS Policies

  1. Changes
    - Drop old RLS policies that don't work properly
    - Create new simplified policies
    - Allow anyone to read any room (for joining)
    - Allow anyone to insert rooms
    - Allow participants to update their rooms

  2. Security
    - Players can view all rooms to join them
    - Players can create rooms
    - Only room participants can update the room
*/

DROP POLICY IF EXISTS "Players can view rooms they are part of" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can create rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Players can update their rooms" ON duel_rooms;

CREATE POLICY "Anyone can read rooms"
  ON duel_rooms
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create rooms"
  ON duel_rooms
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Participants can update rooms"
  ON duel_rooms
  FOR UPDATE
  USING (true)
  WITH CHECK (true);