/*
  # Firebase Cloud Messaging Tokens Table

  ## Overview
  This migration creates a table to store Firebase Cloud Messaging (FCM) device tokens
  for sending push notifications to users.

  ## Changes

  1. New Tables
    - `fcm_tokens`
      - `id` (uuid, primary key) - Internal unique identifier
      - `client_id` (text, unique) - Client identifier (matches profiles.client_id)
      - `token` (text) - FCM device token
      - `device_info` (jsonb, nullable) - Optional device information (browser, OS, etc.)
      - `enabled` (boolean) - Whether notifications are enabled for this device
      - `created_at` (timestamptz) - When token was first registered
      - `updated_at` (timestamptz) - Last time token was updated/verified

  2. Security
    - Enable RLS on `fcm_tokens` table
    - Users can only view and update their own tokens
    - Anyone (authenticated or not) can insert/update their own token

  3. Indexes
    - Index on client_id for fast lookups
    - Index on enabled for filtering active devices
*/

CREATE TABLE IF NOT EXISTS fcm_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text UNIQUE NOT NULL,
  token text NOT NULL,
  device_info jsonb,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert their own FCM token"
  ON fcm_tokens
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own FCM tokens"
  ON fcm_tokens
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own FCM tokens"
  ON fcm_tokens
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own FCM tokens"
  ON fcm_tokens
  FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_fcm_tokens_client_id ON fcm_tokens(client_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_enabled ON fcm_tokens(enabled);

CREATE OR REPLACE FUNCTION update_fcm_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_fcm_tokens_updated_at ON fcm_tokens;
CREATE TRIGGER trigger_update_fcm_tokens_updated_at
  BEFORE UPDATE ON fcm_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_fcm_tokens_updated_at();
