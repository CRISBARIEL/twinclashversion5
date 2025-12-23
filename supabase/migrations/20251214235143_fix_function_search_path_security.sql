/*
  # Fix Function Search Path Security

  1. Changes
    - Add SECURITY DEFINER and fixed search_path to `update_stripe_products_updated_at` function
    - Add SECURITY DEFINER and fixed search_path to `update_fcm_tokens_updated_at` function
  
  2. Security
    - Fixes mutable search_path warnings by setting search_path = ''
    - Uses SECURITY DEFINER to ensure functions run with proper privileges
    - Prevents potential schema injection attacks
*/

-- Fix update_stripe_products_updated_at function
CREATE OR REPLACE FUNCTION update_stripe_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

-- Fix update_fcm_tokens_updated_at function
CREATE OR REPLACE FUNCTION update_fcm_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';
