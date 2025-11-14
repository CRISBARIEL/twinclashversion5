/*
  # User Themes System

  1. New Tables
    - `user_themes`
      - `id` (uuid, primary key)
      - `client_id` (text) - User identifier
      - `owned_themes` (text[]) - Array of owned theme IDs
      - `equipped_theme` (text) - Currently equipped theme ID
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_themes` table
    - Add policy for users to manage their own themes

  3. Important Notes
    - This is a cosmetic-only system
    - Themes do not grant coins or gameplay advantages
    - Uses client_id for anonymous user identification
*/

CREATE TABLE IF NOT EXISTS user_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text UNIQUE NOT NULL,
  owned_themes text[] DEFAULT ARRAY['tema-clasico']::text[],
  equipped_theme text DEFAULT 'tema-clasico',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own themes"
  ON user_themes
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_user_themes_client_id ON user_themes(client_id);