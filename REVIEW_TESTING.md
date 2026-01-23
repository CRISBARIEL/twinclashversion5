# Cómo Probar el Sistema de Reseñas

## Pruebas en Preview/Navegador

El sistema de reseñas funciona en modo web para testing. Al ganar el nivel 5, deberías ver el modal de satisfacción 2.5 segundos después de la pantalla de victoria.

### Pasos para Probar

1. **Juega nivel 5 y gana:**
   ```
   npm run dev
   ```
   - Selecciona nivel 5 desde el mapa
   - Completa el nivel con victoria
   - Espera 2.5 segundos después de que aparezca la pantalla de victoria

2. **Verifica los logs en consola:**
   Abre DevTools (F12) y busca estos mensajes:
   ```
   [GameCore] Triggering review check for level: 5
   [useReviewFlow] Checking review for level: 5 win: true
   [ReviewService] Checking if should show prompt: { levelCompleted: 5, isWin: true }
   [ReviewService] ✅ Should show review prompt!
   [useReviewFlow] ✅ Showing satisfaction modal
   ```

3. **Si NO aparece el modal:**
   - Abre la consola del navegador
   - Ejecuta esto para resetear el tracking:
     ```javascript
     localStorage.removeItem('review_tracking')
     ```
   - Recarga la página y vuelve a ganar el nivel 5

## Flujos de Usuario

### Flujo Positivo (👍)
1. Gana nivel 5
2. Aparece modal: "¿Te está gustando Twin Clash?"
3. Clic en "Sí, me encanta" 👍
4. Aparece modal: "¿Nos dejas una reseña?"
5. Clic en "Valorar ahora"
6. En web: Muestra mensaje de simulación
7. En Android: Abre Google Play In-App Review

### Flujo Negativo (👎)
1. Gana nivel 5
2. Aparece modal: "¿Te está gustando Twin Clash?"
3. Clic en "No mucho" 👎
4. Aparece formulario de feedback
5. Selecciona una opción (⚡ Lag, 🎯 Dificultad, 💰 Anuncios, 💬 Otro)
6. (Opcional) Escribe comentario
7. Clic en "Enviar feedback"
8. Feedback se guarda en tabla `user_feedback` de Supabase

## Condiciones de Disparo

El modal se muestra SOLO si:
- ✅ Usuario **ganó** el nivel (no perdió)
- ✅ Nivel es 5, 10, 20, 30 o 50
- ✅ Han pasado al menos 14 días desde el último prompt
- ✅ No se han alcanzado los 3 intentos máximos
- ✅ No se ha mostrado el flujo de In-App Review previamente
- ✅ No se ha enviado feedback negativo previamente

## Verificar en Base de Datos

### Ver tracking de reseñas:
```sql
-- En Supabase SQL Editor:
SELECT * FROM review_tracking ORDER BY updated_at DESC;
```

### Ver feedback de usuarios:
```sql
SELECT
  feedback_type,
  feedback_text,
  created_at
FROM user_feedback
ORDER BY created_at DESC
LIMIT 10;
```

## Testing en Android

1. **Build y sync:**
   ```bash
   npm run android:sync
   ```

2. **Abre en Android Studio**

3. **Ejecuta en dispositivo/emulador**

4. **Gana nivel 5**

5. **Observa:**
   - El flujo es idéntico al web
   - Al hacer clic en "Valorar ahora" debería abrirse el In-App Review de Google Play
   - **NOTA:** Google Play limita cuándo se muestra el In-App Review (cuotas por dispositivo)
   - Si no se muestra, el sistema abrirá automáticamente la página de Play Store

## Modificar Parámetros para Testing

Para probar más fácilmente, puedes modificar temporalmente estos valores en `src/lib/reviewService.ts`:

```typescript
// VALORES ORIGINALES (PRODUCCIÓN)
const DAYS_BETWEEN_PROMPTS = 14;  // 14 días entre prompts
const MAX_PROMPTS = 3;            // Máximo 3 intentos
const TRIGGER_LEVEL = 5;          // Nivel 5

// VALORES PARA TESTING (cambiar temporalmente)
const DAYS_BETWEEN_PROMPTS = 0;   // Sin espera
const MAX_PROMPTS = 999;          // Sin límite
const TRIGGER_LEVEL = 1;          // Nivel 1 (más fácil de probar)
```

**IMPORTANTE:** Restaura los valores originales antes de subir a producción.

## Resetear Tracking Local

Si necesitas probar múltiples veces:

### En navegador (DevTools Console):
```javascript
localStorage.removeItem('review_tracking')
```

### En Android:
- Desinstala y reinstala la app
- O limpia los datos de la app desde Configuración

## Problemas Comunes

### "No aparece el modal"
**Solución:**
1. Verifica que completaste el nivel 5 con **victoria** (no derrota)
2. Verifica logs en consola
3. Limpia localStorage: `localStorage.removeItem('review_tracking')`
4. Recarga la página

### "Aparece pero solo una vez"
**Comportamiento esperado:** El sistema está diseñado para no molestar. Después de mostrarse, espera 14 días o hasta el siguiente hito (nivel 10, 20, etc.)

### "El In-App Review no se abre en Android"
**Normal:** Google Play tiene cuotas y restricciones. El sistema abrirá automáticamente Play Store como fallback.

## Logs Útiles

Busca estos mensajes en la consola:

```
✅ Éxito:
[ReviewService] ✅ Should show review prompt!
[useReviewFlow] ✅ Showing satisfaction modal

❌ Bloqueado:
[ReviewService] Not a win, skipping
[ReviewService] Not a trigger level, skipping
[ReviewService] Review flow already shown
[ReviewService] Max prompts reached
[ReviewService] Too soon since last prompt: X days
```

## Producción

En producción:
- El sistema funciona automáticamente
- Se respetan los límites de frecuencia (14 días, 3 intentos)
- Google Play controla cuándo mostrar el In-App Review real
- Los fallbacks garantizan que el usuario siempre pueda dejar una reseña si lo desea

## Análisis Post-Lanzamiento

Después de lanzar, monitorea:

```sql
-- Tasa de conversión
SELECT
  COUNT(CASE WHEN review_flow_shown THEN 1 END) * 100.0 / COUNT(*) as conversion_rate,
  COUNT(CASE WHEN feedback_sent THEN 1 END) * 100.0 / COUNT(*) as negative_rate,
  AVG(prompt_count) as avg_prompts
FROM review_tracking
WHERE prompt_count > 0;

-- Feedback más común
SELECT
  feedback_type,
  COUNT(*) as count
FROM user_feedback
GROUP BY feedback_type
ORDER BY count DESC;
```
