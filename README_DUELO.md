# Sistema de Duelos 1v1 - TwinClash

Este documento explica cómo funciona el sistema de duelos en TwinClash y cómo configurarlo correctamente en producción.

## Descripción General

El modo Duelo permite que dos jugadores compitan en tiempo real jugando el mismo nivel con el mismo seed. Al finalizar, se comparan los resultados y se declara un ganador.

## Arquitectura

### Base de Datos: Supabase

El sistema usa **exclusivamente Supabase** (no Firebase) para:
- Almacenar salas de duelo
- Sincronizar estado entre jugadores
- Realtime subscriptions para actualizaciones en vivo

### Tabla: `duel_rooms`

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

CREATE INDEX IF NOT EXISTS idx_duel_rooms_room_code ON duel_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_duel_rooms_status ON duel_rooms(status);
```

### Row Level Security (RLS)

```sql
ALTER TABLE duel_rooms ENABLE ROW LEVEL SECURITY;

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
```

### Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE duel_rooms;
```

## Configuración

### 1. Variables de Entorno

#### Desarrollo Local

Crea un archivo `.env` en la raíz del proyecto:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
```

#### Producción (Vercel/Netlify)

Configura las siguientes variables en tu plataforma de hosting:

- `VITE_SUPABASE_URL`: La URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: La clave pública anon de Supabase

**IMPORTANTE:**
- NO uses comillas en los valores
- Los nombres deben ser exactos (con el prefijo `VITE_`)
- Después de configurar, realiza un nuevo deploy

### 2. Ejecutar Migraciones SQL

En el dashboard de Supabase:

1. Ve a **SQL Editor**
2. Ejecuta los archivos de migración en orden:
   - `supabase/migrations/20251113222358_create_duel_rooms_system.sql`
   - `supabase/migrations/20251113222621_fix_duel_rooms_rls_policies.sql`
   - `supabase/migrations/20251205225430_add_duel_level_and_results.sql`
   - `supabase/migrations/20251205231950_fix_duel_rooms_rls_for_anon_users.sql`
   - `supabase/migrations/20251214212439_enable_realtime_for_duel_rooms.sql`
   - `supabase/migrations/20251214212622_cleanup_duplicate_duel_policies.sql`

3. Verifica que no haya errores

### 3. Habilitar Realtime

En el dashboard de Supabase:

1. Ve a **Database** → **Replication**
2. Busca la tabla `duel_rooms`
3. Activa el toggle de **Enable Realtime**
4. Guarda los cambios

## Flujo del Juego

### 1. Crear Sala

```typescript
const room = await createDuelRoom(clientId, levelNumber);
// Retorna: { room_code: "ABC123", ... }
```

- Genera un código de 6 caracteres único
- Crea registro en la base de datos con status `waiting`
- El creador es el `host`

### 2. Compartir Código

El host comparte el código de la sala:
- Copiar al portapapeles
- Compartir por WhatsApp/redes sociales
- URL directa: `https://tu-app.com/?room=ABC123`

### 3. Unirse a Sala

```typescript
const room = await joinDuelRoom(clientId, roomCode);
```

- El segundo jugador es el `guest`
- Al unirse, el status cambia a `playing`
- Ambos jugadores reciben notificación vía Realtime

### 4. Jugar

- Ambos juegan el mismo nivel (`level_number`)
- Con el mismo seed → mismas cartas en mismo orden
- Cada jugador juega de forma independiente
- No hay interferencia entre jugadores

### 5. Finalizar

Cuando un jugador termina (o se agota el tiempo):

```typescript
await finishDuel(roomId, clientId, timeElapsed, score);
```

- Guarda el resultado del jugador
- Si ambos terminaron, calcula el ganador automáticamente
- Status cambia a `finished`

### 6. Resultados

Criterios para determinar ganador:

1. **Más pares encontrados** gana
2. Si hay empate → **menor tiempo** gana
3. Si persiste empate → se muestra como empate

## Testing

### Modo de Prueba Local

Para probar duelos localmente:

1. Abre 2 ventanas de incógnito del navegador
2. En la primera: crea una sala
3. Copia el código
4. En la segunda: únete con el código
5. Juega en ambas ventanas

**Nota:** Cada ventana tendrá un `client_id` diferente almacenado en localStorage.

### Verificar Configuración

Si ves errores 401/404/400:

1. Verifica las variables de entorno en `.env`
2. Verifica que las credenciales sean correctas
3. Verifica que RLS esté habilitado
4. Verifica que Realtime esté activo
5. Revisa los logs del navegador (Console → Network)

### Modo Debug

El código incluye logs útiles:

```javascript
console.log('[createDuelRoom] Creating room:', { clientId, levelNumber });
console.log('[joinDuelRoom] Joining room:', { clientId, roomCode });
console.log('[DuelScene] Room updated:', payload);
```

Abre la consola del navegador para ver estos mensajes.

## Solución de Problemas

### Error: "Cannot read properties of undefined (reading 'startsWith')"

**Causa:** El componente GameCard recibió una imagen undefined/null

**Solución:** Ya está corregido en `GameCard.tsx`. Si persiste:
1. Verifica que `levelImages[card.imageIndex]` exista
2. Verifica que el nivel tenga suficientes imágenes configuradas
3. Verifica que `pairs` no exceda el número de imágenes

### Error 401: "Invalid API key"

**Causa:** Las credenciales de Supabase son incorrectas o están mal configuradas

**Solución:**
1. Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén correctas
2. Ve a Supabase → Settings → API y copia las credenciales correctas
3. Si giraste la llave, actualiza el `.env`
4. Reinicia el servidor de desarrollo

### Error 404/400 en duel_rooms

**Causa:** La tabla no existe o RLS está bloqueando el acceso

**Solución:**
1. Ejecuta todas las migraciones SQL
2. Verifica que RLS esté habilitado con las políticas correctas
3. Verifica que la tabla `duel_rooms` existe en Supabase

### Pantalla en blanco al unirse

**Causa:** Error de JavaScript no manejado

**Solución:**
1. Abre la consola del navegador para ver el error exacto
2. Verifica que el nivel sea válido
3. Verifica que las imágenes estén disponibles
4. GameCard ahora tiene manejo de errores robusto

### Realtime no funciona

**Causa:** Realtime no está habilitado o la suscripción falló

**Solución:**
1. Ve a Supabase → Database → Replication
2. Activa Realtime para `duel_rooms`
3. Ejecuta: `ALTER PUBLICATION supabase_realtime ADD TABLE duel_rooms;`
4. Verifica la consola para mensajes de error de suscripción

### El segundo jugador no puede unirse

**Causa:** Validaciones de la sala

**Solución:**
1. Verifica que el código sea correcto (6 caracteres, mayúsculas)
2. Verifica que la sala esté en status `waiting`
3. Verifica que no haya otro `guest` ya unido
4. Verifica que no haya expirado (1 hora)

## API Reference

### `createDuelRoom(clientId, levelNumber)`

Crea una nueva sala de duelo.

**Parámetros:**
- `clientId`: ID único del cliente (host)
- `levelNumber`: Número de nivel (1-200)

**Retorna:** `Promise<DuelRoom>`

**Errores:**
- `INVALID_CLIENT_ID`: clientId vacío o inválido
- `INVALID_LEVEL`: levelNumber inválido
- `FAILED_TO_CREATE_ROOM`: Error al crear la sala
- `FAILED_TO_GENERATE_CODE`: No se pudo generar código único

### `joinDuelRoom(clientId, roomCode)`

Únete a una sala existente.

**Parámetros:**
- `clientId`: ID único del cliente (guest)
- `roomCode`: Código de 6 caracteres de la sala

**Retorna:** `Promise<DuelRoom>`

**Errores:**
- `INVALID_CLIENT_ID`: clientId vacío o inválido
- `INVALID_ROOM_CODE`: roomCode vacío o inválido
- `ROOM_NOT_FOUND`: La sala no existe
- `ROOM_NOT_WAITING`: La sala ya está en juego o finalizada
- `ROOM_FULL`: Ya hay otro jugador en la sala
- `ROOM_NO_LONGER_AVAILABLE`: Condición de carrera al unirse

### `getDuelRoom(roomCode)`

Obtiene información de una sala.

**Parámetros:**
- `roomCode`: Código de 6 caracteres de la sala

**Retorna:** `Promise<DuelRoom | null>`

### `finishDuel(roomId, clientId, timeElapsed, score)`

Registra que un jugador terminó el juego.

**Parámetros:**
- `roomId`: UUID de la sala
- `clientId`: ID del cliente
- `timeElapsed`: Tiempo transcurrido en segundos
- `score`: Número de pares encontrados

**Retorna:** `Promise<void>`

### `subscribeToDuelRoom(roomCode, callback)`

Suscribe a actualizaciones de una sala en tiempo real.

**Parámetros:**
- `roomCode`: Código de la sala
- `callback`: Función que recibe las actualizaciones `(room: DuelRoom | null) => void`

**Retorna:** Función de cleanup `() => void`

**Ejemplo:**
```typescript
const unsubscribe = subscribeToDuelRoom(roomCode, (room) => {
  if (room?.status === 'playing') {
    startGame();
  }
});

// Al desmontar el componente:
unsubscribe();
```

## Checklist de Producción

- [ ] Variables de entorno configuradas en plataforma de hosting
- [ ] Todas las migraciones SQL ejecutadas
- [ ] RLS habilitado y políticas creadas
- [ ] Realtime habilitado para `duel_rooms`
- [ ] Build exitoso sin errores
- [ ] Probado en 2 navegadores diferentes
- [ ] Verificado que no haya errores 401/404/400
- [ ] Verificado que Realtime funcione
- [ ] Verificado que los resultados se guarden correctamente
- [ ] Verificado que el ganador se calcule correctamente

## Notas Técnicas

### Por qué no usar Firebase

- TwinClash usa Supabase como base de datos principal
- Supabase ofrece Realtime built-in
- Evita dependencias adicionales
- Más fácil de mantener con una sola base de datos

### Client ID

Cada cliente tiene un ID único almacenado en localStorage:
```typescript
const clientId = getOrCreateClientId();
// Genera: crypto.randomUUID()
```

Este ID persiste entre sesiones y se usa para identificar al jugador en duelos.

### Códigos de Sala

Los códigos son de 6 caracteres:
- Letras mayúsculas (A-Z, excluyendo O, I para evitar confusión)
- Números (2-9, excluyendo 0, 1)
- Ejemplo: `H3K9PW`

### Seed

El seed garantiza que ambos jugadores tengan:
- Las mismas cartas
- En el mismo orden
- Con los mismos pares

Formato: `duel-{roomCode}-{timestamp}`

### Status de Sala

- `waiting`: Esperando al segundo jugador
- `playing`: Ambos jugadores conectados, juego en curso
- `finished`: Juego terminado, resultados disponibles
- `cancelled`: Sala cancelada (host salió antes de empezar)

## Soporte

Si encuentras problemas:

1. Revisa los logs de la consola del navegador
2. Revisa la pestaña Network para ver las requests a Supabase
3. Verifica la configuración paso por paso
4. Asegúrate de tener las credenciales correctas
5. Verifica que todas las migraciones estén aplicadas

Para más ayuda, revisa los archivos:
- `src/lib/duelApi.ts`: Lógica de la API
- `src/components/DuelScene.tsx`: UI y flujo del juego
- `supabase/migrations/`: Migraciones SQL
