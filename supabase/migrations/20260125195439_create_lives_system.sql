/*
  # Sistema de Vidas

  1. Nueva Tabla
    - `user_lives` - Sistema de vidas con regeneración
      - `user_id` (uuid, primary key)
      - `current_lives` (int, vidas actuales 0-5)
      - `max_lives` (int, máximo de vidas, default 5)
      - `last_life_lost_at` (timestamptz, última vez que perdió una vida)
      - `updated_at` (timestamptz)

  2. Seguridad
    - Enable RLS en la tabla
    - Políticas para que usuarios solo accedan a sus propios datos

  3. Lógica
    - Al perder un game over, se pierde 1 vida
    - Las vidas se regeneran automáticamente cada hora
    - Máximo 5 vidas
*/

-- Tabla de vidas de usuario
CREATE TABLE IF NOT EXISTS user_lives (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_lives int DEFAULT 5 CHECK (current_lives >= 0 AND current_lives <= 5),
  max_lives int DEFAULT 5 CHECK (max_lives > 0),
  last_life_lost_at timestamptz DEFAULT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_lives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lives"
  ON user_lives FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lives"
  ON user_lives FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lives"
  ON user_lives FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_user_lives_user_id ON user_lives(user_id);
