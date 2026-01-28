/*
  # Create transactions table for payment tracking

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key) - Unique transaction ID
      - `client_id` (text) - User's client ID
      - `session_id` (text, unique) - Stripe session ID
      - `package_id` (text) - Package purchased
      - `coins` (integer) - Coins purchased
      - `amount` (integer) - Amount paid in cents
      - `status` (text) - Payment status (pending, completed, failed, refunded)
      - `stripe_payment_status` (text) - Stripe payment status
      - `created_at` (timestamp) - When transaction was created
      - `completed_at` (timestamp, nullable) - When transaction was completed

  2. Security
    - Enable RLS on `transactions` table
    - Allow anonymous users to read transactions (filtered by client_id in app)
    - Service role can manage all transactions

  3. Indexes
    - Index on client_id for fast user transaction lookups
    - Index on session_id for fast session lookups
    - Index on status for filtering
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  session_id text UNIQUE NOT NULL,
  package_id text NOT NULL,
  coins integer NOT NULL DEFAULT 0,
  amount integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  stripe_payment_status text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_session_id ON transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read all transactions (they filter by client_id in app)
CREATE POLICY "Anonymous users can read transactions"
  ON transactions
  FOR SELECT
  TO anon
  USING (true);

-- Service role can manage all transactions (for webhooks)
CREATE POLICY "Service role can manage transactions"
  ON transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);