# Sistema de Valoración - Arreglado y Listo

## Problemas Solucionados

### 1. Base de Datos
- ✅ Agregada columna `client_id` a `review_tracking` y `user_feedback`
- ✅ Políticas RLS actualizadas para soportar usuarios anónimos
- ✅ Índices creados para `client_id`

### 2. Código
- ✅ `reviewService.ts` actualizado para usar `client_id`
- ✅ Persistencia en Supabase para usuarios anónimos
- ✅ Modo debug agregado para pruebas

### 3. Web
- ✅ Modal funciona en navegador web
- ✅ Abre Google Play con parámetro para mostrar sección de reviews
- ✅ Sistema de feedback implementado

## Cómo Probar

### OPCIÓN 1: Página de Pruebas
Abre en tu navegador:
```
http://localhost:5173/test-review.html
```

Esta página te permite:
- Ver el estado de tracking
- Simular completar niveles
- Resetear el estado
- Ver logs detallados

### OPCIÓN 2: Modo Debug en la App
1. Abre la app con este parámetro:
```
http://localhost:5173/?force_review=true
```

2. Completa cualquier nivel ganando
3. El modal de satisfacción aparecerá inmediatamente

### OPCIÓN 3: Prueba Normal
1. Juega normalmente hasta completar el nivel 5, 10, 20, 30 o 50
2. Gana el nivel (debe ser victoria)
3. Después de la animación de victoria, aparecerá el modal

## Flujo del Modal

### 1. Modal de Satisfacción
**Pregunta:** "¿Te está gustando Twin Clash?"
- **Botón Verde (Sí, me encanta)** → Va al Modal de Review
- **Botón Rojo (No mucho)** → Va al Modal de Feedback

### 2. Modal de Review (si responde positivo)
- Muestra 5 estrellas
- **"Valorar ahora"** → Abre Google Play para dejar review
- **"Más tarde"** → Cierra el modal

### 3. Modal de Feedback (si responde negativo)
- Opciones: Lag/Rendimiento, Dificultad, Anuncios, Otro
- Campo de texto opcional
- Envía feedback a Supabase

## Condiciones de Trigger

El modal aparece cuando:
- ✅ El usuario completa el nivel 5, 10, 20, 30 o 50
- ✅ Gana el nivel (no en derrota)
- ✅ No ha completado el flujo antes
- ✅ No ha enviado feedback antes
- ✅ Ha pasado 14 días desde el último prompt (o es la primera vez)
- ✅ No ha alcanzado el máximo de 3 prompts

## En Web
- Abre Google Play en nueva pestaña
- URL: `https://play.google.com/store/apps/details?id=com.twinclash.game&showAllReviews=true`

## En App Android
- Intenta usar In-App Review nativo de Google Play
- Si falla, abre la app de Google Play
- Si no está instalada, abre en navegador

## Ver Feedback Recibido

Ejecuta en Supabase:
```sql
SELECT
  feedback_type,
  feedback_text,
  client_id,
  created_at
FROM user_feedback
ORDER BY created_at DESC;
```

## Ver Estado de Tracking

Ejecuta en Supabase:
```sql
SELECT
  client_id,
  prompt_count,
  review_flow_shown,
  feedback_sent,
  highest_level_completed,
  last_prompt_timestamp
FROM review_tracking
ORDER BY created_at DESC;
```

## Debug en Consola

Abre la consola del navegador (F12) y verás logs como:
```
[ReviewService] Checking if should show prompt: { levelCompleted: 5, isWin: true }
[ReviewService] Current tracking: { prompt_count: 0, ... }
[ReviewService] ✅ Should show review prompt!
```

## Reiniciar Estado (para probar múltiples veces)

### En Web:
1. Abre `test-review.html`
2. Click en "Reset Tracking"

### Manual:
```javascript
// En consola del navegador
const clientId = localStorage.getItem('client_id');
console.log('Client ID:', clientId);

// Para borrar todo
localStorage.removeItem('review_tracking');
```

## Checklist de Pruebas

- [ ] Abrir `test-review.html` y verificar que carga el tracking
- [ ] Simular nivel 5 y ver que dice "¡Debería mostrarse!"
- [ ] Abrir app con `?force_review=true` y ganar un nivel
- [ ] Verificar que aparece modal de satisfacción
- [ ] Click en "Sí, me encanta" → Verificar modal con estrellas
- [ ] Click en "Valorar ahora" → Verificar que abre Google Play
- [ ] Reset y probar flujo negativo → Verificar modal de feedback
- [ ] Enviar feedback y verificar en base de datos

## Archivo Build
El proyecto ya está compilado y listo para deployar.
