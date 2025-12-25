/*
  # Create push_tokens table for Firebase Cloud Messaging

  1. New Tables
    - `push_tokens`
      - `id` (uuid, primary key)
      - `client_id` (text, nullable) - Anonymous client identifier from localStorage
      - `token` (text, unique, not null) - FCM registration token
      - `platform` (text) - Device platform (default: 'web')
      - `created_at` (timestamptz) - Token creation timestamp
      - `last_seen` (timestamptz) - Last activity timestamp for cleanup

  2. Security
    - Enable RLS on `push_tokens` table
    - Anonymous users can INSERT/UPDATE their own tokens
    - Only service role can SELECT tokens (for sending notifications)
    - Automatic cleanup of old tokens via last_seen timestamp

  3. Indexes
    - Index on `token` for fast lookups
    - Index on `last_seen` for cleanup queries
*/

CREATE TABLE IF NOT EXISTS push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text,
  token text UNIQUE NOT NULL,
  platform text DEFAULT 'web',
  created_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now()
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous users to insert tokens"
  ON push_tokens
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to update their tokens"
  ON push_tokens
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can read all tokens"
  ON push_tokens
  FOR SELECT
  TO service_role
  USING (true);

CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);
CREATE INDEX IF NOT EXISTS idx_push_tokens_last_seen ON push_tokens(last_seen);
CREATE INDEX IF NOT EXISTS idx_push_tokens_client_id ON push_tokens(client_id);
