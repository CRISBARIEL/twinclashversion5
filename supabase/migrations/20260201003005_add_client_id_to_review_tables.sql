/*
  # Agregar client_id a tablas de review

  1. Agregar columna client_id a review_tracking
  2. Agregar columna client_id a user_feedback
  3. Crear índices para client_id
  4. Actualizar políticas RLS para soportar client_id
*/

-- Agregar client_id si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'review_tracking' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE review_tracking ADD COLUMN client_id text;
    CREATE INDEX review_tracking_client_id_idx ON review_tracking(client_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_feedback' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE user_feedback ADD COLUMN client_id text;
    CREATE INDEX user_feedback_client_id_idx ON user_feedback(client_id);
  END IF;
END $$;

-- Eliminar políticas antiguas
DROP POLICY IF EXISTS "Anonymous users can insert review tracking" ON review_tracking;
DROP POLICY IF EXISTS "Anonymous users can read own review tracking" ON review_tracking;
DROP POLICY IF EXISTS "Anonymous users can update review tracking" ON review_tracking;
DROP POLICY IF EXISTS "Users can insert own review tracking" ON review_tracking;
DROP POLICY IF EXISTS "Users can read own review tracking" ON review_tracking;
DROP POLICY IF EXISTS "Users can update own review tracking" ON review_tracking;
DROP POLICY IF EXISTS "Anon can read own review tracking" ON review_tracking;
DROP POLICY IF EXISTS "Anon can insert review tracking" ON review_tracking;
DROP POLICY IF EXISTS "Anon can update own review tracking" ON review_tracking;

DROP POLICY IF EXISTS "Users can insert feedback" ON user_feedback;
DROP POLICY IF EXISTS "Users can read own feedback" ON user_feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON user_feedback;
DROP POLICY IF EXISTS "Anon can read own feedback" ON user_feedback;
DROP POLICY IF EXISTS "Anon can insert feedback" ON user_feedback;
DROP POLICY IF EXISTS "Admins can read all feedback" ON user_feedback;

-- Políticas para review_tracking (usuarios autenticados)
CREATE POLICY "Authenticated can read own review tracking"
  ON review_tracking FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can insert review tracking"
  ON review_tracking FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated can update own review tracking"
  ON review_tracking FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para review_tracking (usuarios anónimos con client_id)
CREATE POLICY "Anon can read by client_id"
  ON review_tracking FOR SELECT
  TO anon
  USING (client_id IS NOT NULL);

CREATE POLICY "Anon can insert with client_id"
  ON review_tracking FOR INSERT
  TO anon
  WITH CHECK (client_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Anon can update by client_id"
  ON review_tracking FOR UPDATE
  TO anon
  USING (client_id IS NOT NULL)
  WITH CHECK (client_id IS NOT NULL AND user_id IS NULL);

-- Políticas para user_feedback (usuarios autenticados)
CREATE POLICY "Authenticated can read own feedback"
  ON user_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can insert feedback"
  ON user_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Políticas para user_feedback (usuarios anónimos con client_id)
CREATE POLICY "Anon can read own feedback by client_id"
  ON user_feedback FOR SELECT
  TO anon
  USING (client_id IS NOT NULL);

CREATE POLICY "Anon can insert feedback with client_id"
  ON user_feedback FOR INSERT
  TO anon
  WITH CHECK (client_id IS NOT NULL AND user_id IS NULL);