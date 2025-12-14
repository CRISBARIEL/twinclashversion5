-- ============================================================================
-- CONFIGURACIÓN COMPLETA DE DUEL ROOMS
-- ============================================================================
--
-- Este archivo contiene toda la configuración necesaria para el sistema de
-- duelos 1v1 de TwinClash.
--
-- INSTRUCCIONES:
-- 1. Abre el SQL Editor en tu dashboard de Supabase
-- 2. Copia y pega este archivo completo
-- 3. Ejecuta el script
-- 4. Verifica que no haya errores
--
-- ============================================================================

-- ============================================================================
-- 1. CREAR TABLA duel_rooms
-- ============================================================================

CREATE TABLE IF NOT EXISTS duel_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  world_id integer NOT NULL,
  level_number integer NOT NULL CHECK (level_number >= 1),
  seed text NOT NULL,
  host_client_id text NOT NULL,
  guest_client_id text,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished', 'cancelled')),
  winner_client_id text,
  host_finished_at timestamptz,
  guest_finished_at timestamptz,
  host_time integer CHECK (host_time >= 0),
  host_score integer CHECK (host_score >= 0),
  guest_time integer CHECK (guest_time >= 0),
  guest_score integer CHECK (guest_score >= 0),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 hour')
);

-- ============================================================================
-- 2. CREAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_duel_rooms_room_code ON duel_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_duel_rooms_status ON duel_rooms(status);
CREATE INDEX IF NOT EXISTS idx_duel_rooms_created_at ON duel_rooms(created_at);
CREATE INDEX IF NOT EXISTS idx_duel_rooms_host_client_id ON duel_rooms(host_client_id);
CREATE INDEX IF NOT EXISTS idx_duel_rooms_guest_client_id ON duel_rooms(guest_client_id);

-- ============================================================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE duel_rooms ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. LIMPIAR POLÍTICAS EXISTENTES (por si hay duplicados)
-- ============================================================================

DROP POLICY IF EXISTS "Players can view rooms they are part of" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can create rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Players can update their rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can view duel rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can create duel rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can update duel rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Participants can update rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can read rooms" ON duel_rooms;

-- ============================================================================
-- 5. CREAR POLÍTICAS RLS
-- ============================================================================

-- Política para SELECT (lectura)
-- Permite que cualquier usuario pueda ver salas de duelo
CREATE POLICY "Anyone can view duel rooms"
  ON duel_rooms
  FOR SELECT
  TO public
  USING (true);

-- Política para INSERT (creación)
-- Permite que cualquier usuario pueda crear salas de duelo
CREATE POLICY "Anyone can create duel rooms"
  ON duel_rooms
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Política para UPDATE (actualización)
-- Permite que cualquier usuario pueda actualizar salas de duelo
-- (necesario para que guest pueda unirse y para actualizar resultados)
CREATE POLICY "Anyone can update duel rooms"
  ON duel_rooms
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 6. HABILITAR REALTIME
-- ============================================================================

-- Agregar la tabla a la publicación de Realtime
-- Esto permite suscripciones en tiempo real a cambios en la tabla
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'duel_rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE duel_rooms;
  END IF;
END $$;

-- ============================================================================
-- 7. FUNCIÓN PARA LIMPIAR SALAS EXPIRADAS (OPCIONAL)
-- ============================================================================

-- Esta función limpia salas expiradas automáticamente
-- Puedes configurar un cron job en Supabase para ejecutarla periódicamente

CREATE OR REPLACE FUNCTION cleanup_expired_duel_rooms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cancelar salas expiradas que aún están en waiting
  UPDATE duel_rooms
  SET status = 'cancelled'
  WHERE status = 'waiting'
    AND expires_at < now();

  -- Opcionalmente, eliminar salas muy antiguas (más de 7 días)
  -- DELETE FROM duel_rooms
  -- WHERE created_at < now() - interval '7 days';
END;
$$;

-- ============================================================================
-- 8. VERIFICACIÓN
-- ============================================================================

-- Verifica que la tabla existe
SELECT
  'duel_rooms table exists' as check_name,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'duel_rooms')
    THEN '✓ PASSED'
    ELSE '✗ FAILED'
  END as status;

-- Verifica que RLS está habilitado
SELECT
  'RLS enabled' as check_name,
  CASE
    WHEN relrowsecurity = true
    THEN '✓ PASSED'
    ELSE '✗ FAILED'
  END as status
FROM pg_class
WHERE relname = 'duel_rooms';

-- Verifica que hay políticas creadas
SELECT
  'RLS policies exist' as check_name,
  CASE
    WHEN COUNT(*) >= 3
    THEN '✓ PASSED (' || COUNT(*) || ' policies)'
    ELSE '✗ FAILED (only ' || COUNT(*) || ' policies)'
  END as status
FROM pg_policies
WHERE tablename = 'duel_rooms';

-- Verifica que Realtime está habilitado
SELECT
  'Realtime enabled' as check_name,
  CASE
    WHEN COUNT(*) > 0
    THEN '✓ PASSED'
    ELSE '✗ FAILED'
  END as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'duel_rooms';

-- ============================================================================
-- FIN DE LA CONFIGURACIÓN
-- ============================================================================
--
-- Si todos los checks muestran "✓ PASSED", la configuración está completa.
--
-- SIGUIENTE PASO:
-- Ve a Database → Replication en tu dashboard de Supabase y verifica que
-- el toggle de Realtime esté activado para la tabla duel_rooms.
--
-- ============================================================================
