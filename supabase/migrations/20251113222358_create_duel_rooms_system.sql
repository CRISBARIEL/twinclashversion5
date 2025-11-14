/*
  # Create Duel Rooms System

  1. New Tables
    - `duel_rooms`
      - `id` (uuid, primary key)
      - `room_code` (text, unique) - Random 6-character code to join
      - `world_id` (integer) - Selected world (1-10)
      - `seed` (text) - Game seed so both players have same cards
      - `host_client_id` (text) - Player who created the room
      - `guest_client_id` (text, nullable) - Player who joined
      - `status` (text) - 'waiting', 'playing', 'finished'
      - `winner_client_id` (text, nullable) - Who won
      - `host_finished_at` (timestamptz, nullable)
      - `guest_finished_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz) - Rooms expire after 30 minutes

  2. Security
    - Enable RLS on `duel_rooms` table
    - Players can read rooms they're part of
    - Players can create rooms
    - Players can update rooms they're part of
    - Players can join rooms that are waiting

  3. Indexes
    - Index on room_code for fast lookups
    - Index on status for filtering active rooms
*/

CREATE TABLE IF NOT EXISTS duel_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  world_id integer NOT NULL CHECK (world_id >= 1 AND world_id <= 10),
  seed text NOT NULL,
  host_client_id text NOT NULL,
  guest_client_id text,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished', 'cancelled')),
  winner_client_id text,
  host_finished_at timestamptz,
  guest_finished_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 minutes')
);

ALTER TABLE duel_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view rooms they are part of"
  ON duel_rooms
  FOR SELECT
  USING (
    host_client_id = current_setting('request.jwt.claims', true)::json->>'client_id'
    OR guest_client_id = current_setting('request.jwt.claims', true)::json->>'client_id'
  );

CREATE POLICY "Anyone can create rooms"
  ON duel_rooms
  FOR INSERT
  WITH CHECK (
    host_client_id = current_setting('request.jwt.claims', true)::json->>'client_id'
  );

CREATE POLICY "Players can update their rooms"
  ON duel_rooms
  FOR UPDATE
  USING (
    host_client_id = current_setting('request.jwt.claims', true)::json->>'client_id'
    OR guest_client_id = current_setting('request.jwt.claims', true)::json->>'client_id'
  )
  WITH CHECK (
    host_client_id = current_setting('request.jwt.claims', true)::json->>'client_id'
    OR guest_client_id = current_setting('request.jwt.claims', true)::json->>'client_id'
  );

CREATE INDEX IF NOT EXISTS idx_duel_rooms_code ON duel_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_duel_rooms_status ON duel_rooms(status);
CREATE INDEX IF NOT EXISTS idx_duel_rooms_expires ON duel_rooms(expires_at);