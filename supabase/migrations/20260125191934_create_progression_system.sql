/*
  # Sistema de Progresión Completo

  1. Nuevas Tablas
    - `level_stats` - Estadísticas y estrellas por nivel de cada usuario
      - `user_id` (uuid, references auth.users)
      - `level_id` (int, ID global del nivel 1-250)
      - `best_stars` (int, 0-3 estrellas conseguidas)
      - `best_time_ms` (bigint, mejor tiempo en milisegundos)
      - `best_moves` (int, mejor número de movimientos)
      - `best_accuracy` (float, mejor precisión 0-100)
      - `completed` (bool, si completó el nivel)
      - `times_played` (int, veces que jugó el nivel)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `chest_progress` - Progreso del sistema de cofres
      - `user_id` (uuid, primary key)
      - `progress` (int, progreso actual 0-2)
      - `chest_level` (int, nivel del cofre)
      - `total_chests_opened` (int)
      - `last_opened_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `daily_login` - Sistema de login diario
      - `user_id` (uuid, primary key)
      - `current_streak` (int, racha actual)
      - `longest_streak` (int, mejor racha)
      - `last_login_date` (date, última fecha de login)
      - `last_claim_date` (date, última fecha de reclamo)
      - `total_logins` (int)
      - `updated_at` (timestamptz)

    - `daily_missions` - Misiones diarias
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `mission_date` (date, fecha de la misión)
      - `mission_type` (text, tipo: complete_levels, earn_stars, perfect_levels)
      - `target` (int, objetivo a alcanzar)
      - `progress` (int, progreso actual)
      - `reward_coins` (int, monedas de recompensa)
      - `reward_boosts` (int, boosts de recompensa)
      - `claimed` (bool, si fue reclamada)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Seguridad
    - Enable RLS en todas las tablas
    - Políticas para que usuarios solo accedan a sus propios datos
*/

-- Tabla de estadísticas por nivel
CREATE TABLE IF NOT EXISTS level_stats (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id int NOT NULL CHECK (level_id >= 1 AND level_id <= 250),
  best_stars int DEFAULT 0 CHECK (best_stars >= 0 AND best_stars <= 3),
  best_time_ms bigint DEFAULT NULL,
  best_moves int DEFAULT NULL,
  best_accuracy float DEFAULT NULL CHECK (best_accuracy IS NULL OR (best_accuracy >= 0 AND best_accuracy <= 100)),
  completed bool DEFAULT false,
  times_played int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, level_id)
);

ALTER TABLE level_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own level stats"
  ON level_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own level stats"
  ON level_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own level stats"
  ON level_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabla de progreso de cofres
CREATE TABLE IF NOT EXISTS chest_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  progress int DEFAULT 0 CHECK (progress >= 0 AND progress <= 2),
  chest_level int DEFAULT 1,
  total_chests_opened int DEFAULT 0,
  last_opened_at timestamptz DEFAULT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chest_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chest progress"
  ON chest_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chest progress"
  ON chest_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chest progress"
  ON chest_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabla de login diario
CREATE TABLE IF NOT EXISTS daily_login (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak int DEFAULT 0,
  longest_streak int DEFAULT 0,
  last_login_date date DEFAULT NULL,
  last_claim_date date DEFAULT NULL,
  total_logins int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE daily_login ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily login"
  ON daily_login FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily login"
  ON daily_login FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily login"
  ON daily_login FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabla de misiones diarias
CREATE TABLE IF NOT EXISTS daily_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_date date NOT NULL DEFAULT CURRENT_DATE,
  mission_type text NOT NULL CHECK (mission_type IN ('complete_levels', 'earn_stars', 'perfect_levels')),
  target int NOT NULL CHECK (target > 0),
  progress int DEFAULT 0 CHECK (progress >= 0),
  reward_coins int DEFAULT 0,
  reward_boosts int DEFAULT 0,
  claimed bool DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, mission_date, mission_type)
);

ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily missions"
  ON daily_missions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily missions"
  ON daily_missions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily missions"
  ON daily_missions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily missions"
  ON daily_missions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_level_stats_user_id ON level_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_level_stats_level_id ON level_stats(level_id);
CREATE INDEX IF NOT EXISTS idx_daily_missions_user_date ON daily_missions(user_id, mission_date);
CREATE INDEX IF NOT EXISTS idx_daily_missions_date ON daily_missions(mission_date);