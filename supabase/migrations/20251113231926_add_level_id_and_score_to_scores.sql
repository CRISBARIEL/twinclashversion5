/*
  # Agregar campos level_id y score a tabla scores

  1. Cambios en tabla `scores`
    - Agregar columna `level_id` (integer, nullable) para identificar el nivel jugado
    - Agregar columna `score` (integer, nullable) para almacenar puntuación calculada
    - Agregar índice en level_id para búsquedas rápidas
  
  2. Notas
    - level_id es nullable para mantener compatibilidad con scores existentes
    - score se calculará como una combinación de tiempo y movimientos
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scores' AND column_name = 'level_id'
  ) THEN
    ALTER TABLE scores ADD COLUMN level_id integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scores' AND column_name = 'score'
  ) THEN
    ALTER TABLE scores ADD COLUMN score integer;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_scores_level_id ON scores(level_id);
CREATE INDEX IF NOT EXISTS idx_scores_client_level ON scores(client_id, level_id);