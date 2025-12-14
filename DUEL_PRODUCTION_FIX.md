# Solución de Problemas de Duelo en Producción

## Problema
Los duelos funcionaban en preview pero no en producción.

## Causas Identificadas y Soluciones

### 1. ✅ Realtime Deshabilitado
**Problema:** La tabla `duel_rooms` no estaba publicada en el canal de Realtime de Supabase.

**Solución:** Se habilitó Realtime para la tabla con la migración `enable_realtime_for_duel_rooms.sql`

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE duel_rooms;
```

### 2. ✅ Logging Mejorado
**Problema:** Era difícil diagnosticar errores en producción.

**Solución:** Se añadieron logs detallados en:
- `src/lib/supabase.ts` - Inicialización del cliente
- `src/lib/duelApi.ts` - Creación y unión de salas

Esto ayuda a identificar problemas de:
- Variables de entorno faltantes
- Errores de conexión
- Problemas con RLS

### 3. ✅ Configuración de Realtime
**Problema:** El cliente de Supabase no tenía configuración óptima para Realtime.

**Solución:** Se añadió configuración explícita:
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

## Herramienta de Diagnóstico

Se creó una página de diagnóstico disponible en: **`/diagnostics.html`**

Esta herramienta verifica:
1. ✅ Variables de entorno configuradas correctamente
2. ✅ Conexión a Supabase funcional
3. ✅ Capacidad de crear salas de duelo
4. ✅ Capacidad de leer salas de duelo

### Cómo usar la herramienta de diagnóstico:

1. **En desarrollo:**
   ```
   http://localhost:5173/diagnostics.html
   ```

2. **En producción:**
   ```
   https://tu-dominio.com/diagnostics.html
   ```

La página ejecuta automáticamente los tests y muestra:
- ✅ Verde = OK
- ❌ Rojo = Error
- ⏳ Naranja = Pendiente

## Verificaciones Post-Despliegue

### 1. Verificar Variables de Entorno en Producción

En tu plataforma de hosting (Vercel/Netlify), asegúrate de que están configuradas:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 2. Verificar la Consola del Navegador

Abre la consola del navegador (F12) y busca logs que empiecen con:
- `[Supabase]` - Inicialización del cliente
- `[createDuelRoom]` - Creación de salas
- `[joinDuelRoom]` - Unión a salas

### 3. Probar el Flujo Completo

1. Abre dos navegadores diferentes (o modo incógnito)
2. En el primero:
   - Click en "Duelo"
   - Click en "Crear Sala"
   - Copia el código de la sala
3. En el segundo:
   - Click en "Duelo"
   - Click en "Unirse a Sala"
   - Pega el código
   - Debería comenzar el juego

## Problemas Comunes y Soluciones

### Error: "ROOM_NOT_FOUND"
**Causa:** Variables de entorno no configuradas o diferentes entre entornos
**Solución:** Verifica que las variables de entorno en producción apunten al mismo proyecto de Supabase

### Error: "FAILED_TO_CREATE_ROOM"
**Causa:** Problemas con políticas RLS o conexión a Supabase
**Solución:**
1. Verifica que las políticas RLS permiten acceso anónimo
2. Ejecuta la herramienta de diagnóstico

### El juego no sincroniza
**Causa:** Realtime no está habilitado o hay problemas de red
**Solución:**
1. Verifica que Realtime está habilitado (ya está con la migración)
2. Revisa la consola del navegador para errores de WebSocket

## Estado de las Políticas RLS

Las políticas actuales permiten acceso anónimo (público) a `duel_rooms`:

```sql
-- Cualquiera puede ver salas
CREATE POLICY "Anyone can view duel rooms"
  ON duel_rooms FOR SELECT USING (true);

-- Cualquiera puede crear salas
CREATE POLICY "Anyone can create duel rooms"
  ON duel_rooms FOR INSERT WITH CHECK (true);

-- Cualquiera puede actualizar salas
CREATE POLICY "Anyone can update duel rooms"
  ON duel_rooms FOR UPDATE USING (true) WITH CHECK (true);
```

Esto es seguro porque:
- Las salas expiran automáticamente después de 30 minutos
- Los códigos son aleatorios de 6 caracteres (difíciles de adivinar)
- Es un juego, no datos sensibles

## Contacto y Soporte

Si los problemas persisten después de aplicar estas soluciones:

1. Ejecuta `/diagnostics.html` en producción
2. Copia los resultados de todos los tests
3. Abre la consola del navegador (F12)
4. Copia todos los logs que aparecen
5. Revisa los logs para identificar el error específico
