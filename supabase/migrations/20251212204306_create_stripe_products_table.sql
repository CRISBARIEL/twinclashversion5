/*
  # Stripe Products Table

  ## Overview
  This migration creates a table to store Stripe product information for the coin shop system.
  
  ## Changes
  
  1. New Tables
    - `stripe_products`
      - `id` (uuid, primary key) - Internal unique identifier
      - `package_id` (text, unique) - Package identifier matching frontend (small, medium, large, xlarge)
      - `coins` (integer) - Number of coins in the package
      - `bonus_coins` (integer) - Bonus coins included
      - `price_cents` (integer) - Price in cents (EUR)
      - `price_display` (text) - Display price for frontend (e.g., "0,99€")
      - `name` (text) - Product name
      - `stripe_price_id` (text, nullable) - Stripe Price ID if using Stripe Products
      - `active` (boolean) - Whether product is available for purchase
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `stripe_products` table
    - Add policy for public read access (anyone can see products)
    - Add policy for admin-only write access
  
  3. Initial Data
    - Insert the 4 current coin packages with correct pricing
*/

-- Create stripe_products table
CREATE TABLE IF NOT EXISTS stripe_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id text UNIQUE NOT NULL,
  coins integer NOT NULL CHECK (coins > 0),
  bonus_coins integer DEFAULT 0 CHECK (bonus_coins >= 0),
  price_cents integer NOT NULL CHECK (price_cents > 0),
  price_display text NOT NULL,
  name text NOT NULL,
  stripe_price_id text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read products (needed for shop display)
CREATE POLICY "Anyone can view active products"
  ON stripe_products
  FOR SELECT
  USING (active = true);

-- Policy: Only admins can insert products
CREATE POLICY "Only admins can create products"
  ON stripe_products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.client_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND profiles.is_admin = true
    )
  );

-- Policy: Only admins can update products
CREATE POLICY "Only admins can update products"
  ON stripe_products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.client_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND profiles.is_admin = true
    )
  );

-- Policy: Only admins can delete products
CREATE POLICY "Only admins can delete products"
  ON stripe_products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.client_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND profiles.is_admin = true
    )
  );

-- Insert initial products (matching current system)
INSERT INTO stripe_products (package_id, coins, bonus_coins, price_cents, price_display, name, active)
VALUES
  ('small', 100, 0, 99, '0,99€', '100 Monedas', true),
  ('medium', 550, 50, 399, '3,99€', '550 Monedas (+50 Bonus)', true),
  ('large', 1200, 200, 799, '7,99€', '1400 Monedas (1200+200 bonus)', true),
  ('xlarge', 3000, 700, 1499, '14,99€', '3700 Monedas (3000+700 bonus)', true)
ON CONFLICT (package_id) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stripe_products_package_id ON stripe_products(package_id);
CREATE INDEX IF NOT EXISTS idx_stripe_products_active ON stripe_products(active);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_stripe_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_stripe_products_updated_at ON stripe_products;
CREATE TRIGGER trigger_update_stripe_products_updated_at
  BEFORE UPDATE ON stripe_products
  FOR EACH ROW
  EXECUTE FUNCTION update_stripe_products_updated_at();
