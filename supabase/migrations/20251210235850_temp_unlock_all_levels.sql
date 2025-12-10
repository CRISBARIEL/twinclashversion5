/*
  # TEMPORAL: Desbloquear todos los niveles para pruebas
  
  Este es un script temporal para debugging. Desbloquea todos los niveles
  en todos los mundos para que los jugadores puedan jugar libremente mientras
  se depura el sistema de progresión.
  
  1. Cambios
    - Actualiza todos los registros de world_progress
    - Marca todos los niveles como unlocked: true
    - Preserva el estado de completed y stars
  
  IMPORTANTE: Esto es temporal y debe revertirse cuando se arregle el bug.
*/

-- Función para actualizar todos los niveles a desbloqueado
DO $$
DECLARE
  record RECORD;
  updated_levels jsonb;
  level_obj jsonb;
BEGIN
  -- Iterar sobre todos los registros de world_progress
  FOR record IN SELECT id, levels FROM world_progress
  LOOP
    -- Inicializar el array de niveles actualizados
    updated_levels := '[]'::jsonb;
    
    -- Procesar cada nivel
    FOR level_obj IN SELECT * FROM jsonb_array_elements(record.levels)
    LOOP
      -- Actualizar el nivel para estar desbloqueado
      updated_levels := updated_levels || jsonb_build_object(
        'unlocked', true,
        'completed', COALESCE((level_obj->>'completed')::boolean, false),
        'stars', COALESCE((level_obj->>'stars')::integer, 0)
      );
    END LOOP;
    
    -- Actualizar el registro con los niveles modificados
    UPDATE world_progress 
    SET 
      levels = updated_levels,
      updated_at = now()
    WHERE id = record.id;
  END LOOP;
END $$;

-- Verificar la actualización
SELECT 
  world_id,
  jsonb_array_length(levels) as total_levels,
  (SELECT COUNT(*) FROM jsonb_array_elements(levels) WHERE value->>'unlocked' = 'true') as unlocked_count
FROM world_progress
LIMIT 5;
