# ⚠️ ACCIÓN URGENTE: Crear Tabla duel_rooms

## El Problema

Tu aplicación está intentando acceder a la tabla `duel_rooms` pero **NO EXISTE** en tu base de datos Supabase.

Error: `400 Bad Request - PGRST204` (tabla no encontrada)

## Solución Rápida (5 minutos)

### Paso 1: Abre el SQL Editor

Ve directamente a:
```
https://supabase.com/dashboard/project/jbqaznerntjlbdhcmodj/sql/new
```

O manualmente:
1. Abre https://supabase.com/dashboard
2. Selecciona tu proyecto `jbqaznerntjlbdhcmodj`
3. Ve a **SQL Editor** (en el menú lateral)
4. Click en **New Query**

### Paso 2: Copia ESTE SQL Completo

```sql
-- ============================================================================
-- CREAR TABLA DUEL_ROOMS - EJECUCIÓN URGENTE
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_duel_rooms_room_code ON duel_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_duel_rooms_status ON duel_rooms(status);
CREATE INDEX IF NOT EXISTS idx_duel_rooms_created_at ON duel_rooms(created_at);
CREATE INDEX IF NOT EXISTS idx_duel_rooms_host_client_id ON duel_rooms(host_client_id);
CREATE INDEX IF NOT EXISTS idx_duel_rooms_guest_client_id ON duel_rooms(guest_client_id);

-- RLS
ALTER TABLE duel_rooms ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas duplicadas
DROP POLICY IF EXISTS "Players can view rooms they are part of" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can create rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Players can update their rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can view duel rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can create duel rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can update duel rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Participants can update rooms" ON duel_rooms;
DROP POLICY IF EXISTS "Anyone can read rooms" ON duel_rooms;

-- Políticas RLS
CREATE POLICY "Anyone can view duel rooms"
  ON duel_rooms
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create duel rooms"
  ON duel_rooms
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update duel rooms"
  ON duel_rooms
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Realtime
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

-- Verificación
SELECT
  'duel_rooms table created' as message,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'duel_rooms')
    THEN '✓ SUCCESS'
    ELSE '✗ FAILED'
  END as status;
```

### Paso 3: Ejecuta el Script

1. Pega todo el SQL en el editor
2. Click en **Run** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
3. Espera a que termine (debería tomar menos de 1 segundo)
4. Verifica que veas el mensaje: `✓ SUCCESS`

### Paso 4: Habilitar Realtime (IMPORTANTE)

1. Ve a **Database** → **Replication**
   ```
   https://supabase.com/dashboard/project/jbqaznerntjlbdhcmodj/database/replication
   ```

2. Busca la tabla `duel_rooms` en la lista

3. **Activa el toggle** que dice "Enable Realtime"

4. Guarda los cambios

### Paso 5: Verificar

Después de ejecutar el SQL:

1. Ve a **Table Editor**
   ```
   https://supabase.com/dashboard/project/jbqaznerntjlbdhcmodj/editor
   ```

2. Busca `duel_rooms` en la lista de tablas

3. Deberías ver la tabla con todas sus columnas

### Paso 6: Probar en la App

1. Vuelve a https://www.twinclash.org
2. Recarga la página (F5)
3. Intenta crear un duelo nuevamente
4. **Debería funcionar** ✅

## ¿Por Qué Pasó Esto?

El código del sistema de duelos está completo y funcional, pero **la base de datos no tenía la tabla creada**. Es como tener una app lista pero sin la base de datos configurada.

## Si Aún Tienes Problemas

### Error: "permission denied"

Verifica que estés logueado en Supabase con la cuenta correcta del proyecto.

### Error: "relation already exists"

Está bien, significa que la tabla ya existe. Continúa con el Paso 4 (Realtime).

### La verificación muestra "FAILED"

Intenta ejecutar solo la parte de creación de tabla:

```sql
CREATE TABLE IF NOT EXISTS duel_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  world_id integer NOT NULL,
  level_number integer NOT NULL CHECK (level_number >= 1),
  seed text NOT NULL,
  host_client_id text NOT NULL,
  guest_client_id text,
  status text NOT NULL DEFAULT 'waiting',
  winner_client_id text,
  host_finished_at timestamptz,
  guest_finished_at timestamptz,
  host_time integer,
  host_score integer,
  guest_time integer,
  guest_score integer,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 hour')
);
```

## Resumen

1. ✅ Abre SQL Editor en Supabase
2. ✅ Copia y pega el SQL completo
3. ✅ Ejecuta (Run)
4. ✅ Verifica el mensaje de éxito
5. ✅ Habilita Realtime para duel_rooms
6. ✅ Prueba en la app

**Tiempo estimado: 5 minutos**

Una vez hecho esto, el sistema de duelos funcionará perfectamente.
