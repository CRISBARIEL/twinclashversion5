# Fix Crítico: Botón "Siguiente Nivel" Bloqueado Después de Anuncios

## Problema Reportado

Después de completar el nivel 5 (o cualquier múltiplo de 5), al mostrar el anuncio recompensado:
1. El botón "Siguiente Nivel" se quedaba bloqueado en "Cargando..."
2. El botón back de Android no funcionaba correctamente durante el anuncio
3. En intentos posteriores, ni siquiera permitía continuar
4. Los usuarios abandonaban el juego por esta mala experiencia

## Causa Raíz

El problema tenía múltiples causas:

### 1. **Promesa Sin Resolver**
La promesa `adCompletionPromise` en `admob.ts` esperaba indefinidamente si:
- El usuario cerraba el anuncio con el botón back de Android
- Los eventos `Dismissed` o `FailedToShow` no se disparaban correctamente
- Había un error de red durante el anuncio

### 2. **Estado Bloqueado**
El estado `isProcessingNextLevel` se establecía a `true` antes de mostrar el anuncio, y si algo fallaba, nunca se reseteaba a `false`.

### 3. **Manejo Inadecuado de Errores**
No había timeouts de seguridad para recuperarse de fallos en el proceso de anuncios.

## Soluciones Implementadas

### 1. **Timeout de Seguridad en AdMob (admob.ts)**

```typescript
// Safety timeout - auto-resolve after 30 seconds
const safetyTimeout = setTimeout(() => {
  console.warn('[AdMob] ⚠️ Ad timeout - auto-resolving after 30 seconds');
  listenerPromises.reward?.then((l: any) => l.remove());
  listenerPromises.dismiss?.then((l: any) => l.remove());
  listenerPromises.failed?.then((l: any) => l.remove());
  resolveOnce();
}, 30000);
```

**Beneficios:**
- Si el anuncio no responde en 30 segundos, la promesa se resuelve automáticamente
- Los listeners se limpian correctamente
- El juego siempre puede continuar

### 2. **Flujo Simplificado del Botón (GameCore.tsx)**

**Antes:**
```typescript
// Bloqueaba el botón ANTES del anuncio
setIsProcessingNextLevel(true);
await showRewardedAd(); // Si falla aquí, el botón queda bloqueado
```

**Ahora:**
```typescript
// 1. Bloquear botón
setIsProcessingNextLevel(true);

// 2. Mostrar anuncio con try-catch
try {
  if (isMultipleOf5 && isRewardedReady) {
    const result = await showRewardedAd();
    if (result.rewarded) {
      setCurrentCoins(getLocalCoins());
    }
  }
} catch (error) {
  console.error('[GameCore] ❌ Ad error:', error);
}

// 3. SIEMPRE proceder (con o sin anuncio)
setShowWinModal(false);
setIsProcessingNextLevel(false);
setTimeout(() => onComplete(), 50);
```

**Beneficios:**
- El botón SIEMPRE se desbloquea
- El juego SIEMPRE continúa, independientemente de si el anuncio se completó o no
- Manejo robusto de errores

### 3. **Resolver Solo Una Vez**

```typescript
let isResolved = false;
const resolveOnce = () => {
  if (isResolved) return;
  isResolved = true;
  resolve();
};
```

**Beneficios:**
- Previene múltiples resoluciones de la promesa
- Evita condiciones de carrera entre eventos

## Flujo Actual (Nivel 5)

```
1. Usuario completa nivel 5
   ↓
2. Se muestra modal de victoria
   ↓
3. Usuario hace clic en "Siguiente Nivel"
   ↓
4. Botón muestra "Cargando..." (bloqueado por 1-2 segundos máximo)
   ↓
5. Se intenta mostrar anuncio recompensado
   ├─ Si se muestra: Usuario ve el anuncio
   │  ├─ Usuario completa el anuncio: Gana 1000 monedas
   │  └─ Usuario cierra con botón back: No gana monedas
   └─ Si falla: Continúa sin anuncio
   ↓
6. Anuncio se cierra (máximo 30 segundos)
   ↓
7. Modal se cierra automáticamente
   ↓
8. Botón se desbloquea
   ↓
9. Juego avanza al nivel 6 (WorldUnlockModal si corresponde)
```

## Sobre el Botón Back de Android

El botón físico back de Android durante los anuncios es manejado por:

1. **AdMob SDK nativo**: El SDK controla directamente el cierre del anuncio
2. **Eventos Capacitor**: El plugin escucha eventos de cierre
3. **Timeout de seguridad**: Garantiza que el juego continúe incluso si los eventos fallan

**No se intercepta** el botón back durante los anuncios porque:
- Podría violar políticas de Google AdMob
- Los usuarios deben poder cerrar anuncios
- El SDK maneja esto mejor que JavaScript

## Logs para Debugging

Si el problema persiste, revisar estos logs en la consola:

```
[GameCore] ===== CLICK SIGUIENTE NIVEL =====
[GameCore] Level: 5
[GameCore] Is multiple of 5: true Rewarded ready: true
[GameCore] 🎁 Showing rewarded ad...
[AdMob] 🎯 Setting up listeners for rewarded ad...
[AdMob] ▶️ Showing rewarded ad...
[AdMob] ⏳ Waiting for ad to be dismissed...
[AdMob] 📱 DISMISSED EVENT FIRED. Reward granted: true/false
[AdMob] ✅ Ad interaction complete. Reward granted: true/false
[GameCore] 🎁 Ad result: { success: true, rewarded: true/false }
[GameCore] ✅ Proceeding to next level...
```

## Si el Problema Persiste

Si después de estos cambios el botón aún se bloquea, considera estas alternativas:

### Opción 1: Anuncios en Transición
Mostrar el anuncio DESPUÉS de cambiar de nivel, no antes:
```typescript
onComplete(); // Cambiar nivel primero
setTimeout(() => showRewardedAd(), 1000); // Anuncio después
```

### Opción 2: Anuncios Solo en Menú
Solo mostrar anuncios cuando el usuario vuelve al menú principal, no durante el juego.

### Opción 3: Anuncios Intersticiales Simples
Usar solo anuncios intersticiales (no recompensados) que son más simples y tienen menos puntos de fallo.

### Opción 4: Frecuencia Reducida
Mostrar anuncios cada 10 niveles en vez de cada 5, reduciendo el número de oportunidades de error.

## Testing Recomendado

1. **Nivel 5 - Flujo Normal:**
   - Completar nivel 5
   - Ver anuncio completo
   - Verificar que avanza al nivel 6

2. **Nivel 5 - Cerrar con Back:**
   - Completar nivel 5
   - Cerrar anuncio con botón back
   - Verificar que avanza al nivel 6

3. **Nivel 5 - Sin Conexión:**
   - Desactivar WiFi/datos
   - Completar nivel 5
   - Verificar que avanza al nivel 6 (sin anuncio)

4. **Nivel 5 - Múltiples Intentos:**
   - Completar niveles 5, 10, 15, 20
   - Verificar que siempre funciona

## Contacto de Emergencia

Si necesitas cambiar urgentemente el sistema de anuncios, estos son los puntos críticos:

**Deshabilitar anuncios recompensados:**
```typescript
// En GameCore.tsx línea ~1965
if (false) { // Cambiar a false
  const result = await showRewardedAd();
}
```

**Cambiar frecuencia:**
```typescript
// En GameCore.tsx línea ~1961
const isMultipleOf5 = activeLevel % 10 === 0; // 5 -> 10
```
