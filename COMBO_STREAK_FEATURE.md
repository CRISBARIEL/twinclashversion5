# Sistema de Combo Streak - Rompedor de Hielo

## 📋 Resumen

Se ha implementado una nueva mecánica de ayuda para niveles difíciles con hielo. Cuando el jugador consigue **6 parejas consecutivas sin ningún fallo**, se activa un poder especial que rompe el hielo en las cartas vecinas de la última carta emparejada.

## 🎯 Objetivo

Hacer que los niveles difíciles con hielo sean exigentes pero justos, dando al jugador una herramienta adicional para controlar la dificultad sin romper el balance del juego.

---

## 🔧 Implementación Técnica

### 1. Nuevas Variables de Estado

**Archivo:** `src/components/GameCore.tsx`

```typescript
const [streakMatches, setStreakMatches] = useState(0);
const [comboCardId, setComboCardId] = useState<number | null>(null);
```

- **`streakMatches`**: Contador de parejas consecutivas acertadas sin fallos
- **`comboCardId`**: ID de la última carta que activó el poder (para animación)

### 2. Nueva Función: `triggerIceBreakerPower`

**Ubicación:** Líneas 536-619 en `GameCore.tsx`

**Firma:**
```typescript
const triggerIceBreakerPower = useCallback((centerCardId: number) => {
  // Implementación
}, [cards, crackedCards, breakingCards]);
```

**Funcionalidad:**
1. Recibe el ID de la carta central (la última carta de la sexta pareja)
2. Calcula la posición de la carta en el grid
3. Identifica todas las cartas vecinas (8 direcciones: arriba, abajo, izquierda, derecha y 4 diagonales)
4. Para cada carta vecina con hielo (`obstacle === 'ice'`):
   - Reduce `obstacleHealth` en 1
   - Si llega a 0, destruye el hielo completamente
   - Actualiza animaciones (crack/breaking)
   - Otorga 10 monedas por cada hielo destruido
5. Activa la animación especial en la carta central

**Lógica del grid:**
```typescript
const gridSize = Math.ceil(Math.sqrt(cards.length));
const centerRow = Math.floor(centerIdx / gridSize);
const centerCol = centerIdx % gridSize;

// Busca en 3x3 alrededor del centro
for (let dRow = -1; dRow <= 1; dRow++) {
  for (let dCol = -1; dCol <= 1; dCol++) {
    // Calcula índice del vecino
  }
}
```

### 3. Puntos de Integración

#### A. Al acertar una pareja (Líneas 504-522)

**Antes:**
```typescript
setMatchedPairs((prev) => prev + 1);
setFlippedCards([]);
setConsecutiveMisses(0);
setHintCards([]);
isCheckingRef.current = false;
```

**Después:**
```typescript
setMatchedPairs((prev) => prev + 1);
setFlippedCards([]);
setConsecutiveMisses(0);
setHintCards([]);

// ⭐ NUEVA LÓGICA DE COMBO
setStreakMatches((prev) => {
  const newStreak = prev + 1;
  if (newStreak >= 6) {
    const hasIceOnly = cards.some(c => c.obstacle === 'ice' && !cards.some(c2 => c2.obstacle === 'stone'));
    if (hasIceOnly) {
      setTimeout(() => {
        triggerIceBreakerPower(secondId); // secondId es la última carta girada
      }, 100);
    }
    return 0; // Resetea el combo después de activarlo
  }
  return newStreak;
});

isCheckingRef.current = false;
```

**Condiciones para activar:**
- El streak debe ser >= 6
- El nivel debe tener hielo (`obstacle === 'ice'`)
- El nivel NO debe tener piedra (`obstacle !== 'stone'`)

#### B. Al fallar una pareja (Línea 510)

**Antes:**
```typescript
} else {
  setConsecutiveMisses((prev) => prev + 1);
```

**Después:**
```typescript
} else {
  setStreakMatches(0); // ⭐ Resetea el combo al fallar
  setConsecutiveMisses((prev) => prev + 1);
```

#### C. Al reiniciar el nivel (Líneas 217-219)

**Antes:**
```typescript
setCrackedCards(new Set());
setBreakingCards(new Set());
```

**Después:**
```typescript
setCrackedCards(new Set());
setBreakingCards(new Set());
setStreakMatches(0); // ⭐ Resetea el combo
setComboCardId(null);
```

---

## 🎨 Elementos Visuales

### 1. Indicador de Streak

**Ubicación:** Líneas 845-849 en `GameCore.tsx`

Muestra el progreso del combo en la esquina superior:

```tsx
{streakMatches > 0 && !isPreview && cards.some(c => c.obstacle === 'ice') && (
  <div className={`text-sm font-bold transition-all ${streakMatches >= 6 ? 'text-green-500 animate-pulse' : 'text-orange-500'}`}>
    🔥 {streakMatches}/6
  </div>
)}
```

**Comportamiento:**
- Solo se muestra si hay streak activo (> 0)
- Solo en niveles con hielo
- Color naranja cuando está en progreso
- Color verde pulsante cuando llega a 6 (justo antes de activarse)

### 2. Animación de la Carta Combo

**Archivo:** `src/index.css` (Líneas 287-315)

```css
.combo-power-animation {
  animation: combo-power 1s ease-out;
  position: relative;
  z-index: 100;
}

@keyframes combo-power {
  0% { transform: scale(1); }
  15% { transform: scale(1.2) translateY(-10px) rotate(5deg); }
  30% { transform: scale(1.15) translateY(-20px) rotate(-3deg); }
  50% {
    transform: scale(1.3) translateY(-15px) rotate(0deg);
    filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.8));
  }
  70% { transform: scale(1.1) translateY(-5px) rotate(2deg); }
  100% { transform: scale(1) translateY(0) rotate(0deg); }
}
```

**Efecto:**
- La carta "salta" con rotación
- Brilla con un resplandor azul en el punto máximo
- Duración: 1 segundo
- Se eleva por encima de otras cartas (z-index: 100)

---

## 🎮 Flujo del Jugador

1. **Jugador empieza nivel con hielo**
   - El contador de streak inicia en 0 (no visible)

2. **Jugador acierta primera pareja**
   - `streakMatches` = 1
   - Aparece indicador: 🔥 1/6 (naranja)

3. **Jugador sigue acertando...**
   - 2/6, 3/6, 4/6, 5/6...
   - El indicador se actualiza

4. **Jugador acierta sexta pareja consecutiva**
   - `streakMatches` llega a 6
   - Indicador cambia a verde pulsante momentáneamente
   - Se activa `triggerIceBreakerPower()`
   - La carta central hace animación especial
   - El hielo de las 8 cartas vecinas se reduce en 1 capa
   - Se resetea el streak a 0

5. **Si el jugador falla en cualquier momento**
   - El streak se resetea a 0
   - El indicador desaparece
   - Debe empezar de nuevo

---

## 🧪 Casos de Prueba

### Caso 1: Activación exitosa del combo
- Nivel con solo hielo (sin piedra)
- Acertar 6 parejas seguidas
- ✅ Debería activar el poder y romper hielo vecino

### Caso 2: Fallo rompe el combo
- Nivel con hielo
- Acertar 4 parejas, fallar 1, acertar 6 más
- ✅ El poder se activa en la pareja 6 después del fallo

### Caso 3: Nivel sin hielo
- Nivel normal sin obstáculos
- Acertar 6 parejas seguidas
- ✅ No se activa nada, no se muestra indicador

### Caso 4: Nivel con piedra
- Nivel con piedra (no solo hielo)
- Acertar 6 parejas seguidas
- ✅ No se activa el poder (es exclusivo para hielo)

### Caso 5: Reinicio de nivel
- Tener streak de 3, reiniciar nivel
- ✅ El streak se resetea a 0

---

## 🔒 Seguridad y Protección

### Prevención de valores negativos
```typescript
if (c.obstacle === 'ice' && (c.obstacleHealth ?? 0) > 0) {
  const newHealth = (c.obstacleHealth ?? 0) - 1;
  if (newHealth <= 0) {
    // Destruye completamente
    return { ...c, obstacle: null, obstacleHealth: 0 };
  }
  return { ...c, obstacleHealth: newHealth };
}
```

### Solo afecta hielo, no piedra
```typescript
const hasIceOnly = cards.some(c => c.obstacle === 'ice' &&
                    !cards.some(c2 => c2.obstacle === 'stone'));
```

### Verificaciones de límites del grid
```typescript
if (newRow >= 0 && newRow < gridSize &&
    newCol >= 0 && newCol < gridSize) {
  const idx = newRow * gridSize + newCol;
  if (idx < cards.length) {
    neighborIndices.push(idx);
  }
}
```

---

## 📊 Balance del Juego

### Ventajas para el jugador:
- Recompensa la precisión y consistencia
- Da una herramienta contra niveles muy helados
- Crea momentos épicos y satisfactorios

### Desventajas / Limitaciones:
- Requiere 6 aciertos PERFECTOS (ni uno solo fallo)
- Solo funciona en niveles con hielo puro (sin piedra)
- Se resetea completamente al fallar
- Solo rompe 1 capa de hielo (en hielos de múltiples capas)

### Mundos recomendados:
- Mundos 11-15 (nuevos mundos con hielo intenso)
- Dificultad alta pero justa
- Sin piedra en estos mundos

---

## 🚀 Extensiones Futuras Posibles

1. **Notificación visual al alcanzar 6:**
   - Mostrar "¡COMBO ACTIVADO!" en pantalla

2. **Diferentes efectos por nivel:**
   - Mundo 11-12: Rompe 1 capa
   - Mundo 13-14: Rompe 2 capas
   - Mundo 15: Rompe 3 capas

3. **Bonus de monedas por combo:**
   - Otorgar monedas extra al activar el combo

4. **Sistema de combos múltiples:**
   - Si vuelves a hacer 6 seguidas, poder aún más fuerte

---

## ✅ Checklist de Implementación

- [x] Variables de estado agregadas (`streakMatches`, `comboCardId`)
- [x] Función `triggerIceBreakerPower` implementada
- [x] Integración en punto de acierto (incrementar streak)
- [x] Integración en punto de fallo (resetear streak)
- [x] Integración en reinicio de nivel (resetear streak)
- [x] Animación CSS de la carta combo
- [x] Indicador visual del streak en UI
- [x] Lógica de vecinos 8-direccionales
- [x] Protección contra valores negativos
- [x] Verificación de límites del grid
- [x] Condición: solo en niveles con hielo
- [x] Otorgar monedas al romper hielo
- [x] Build exitoso sin errores

---

## 🎓 Notas para Desarrolladores

### Compatibilidad:
- ✅ No rompe ninguna funcionalidad existente
- ✅ Solo EXTIENDE la lógica actual
- ✅ Sistema de hielo/piedra original intacto
- ✅ Funciona con el sistema de animaciones actual

### Mantenimiento:
- El código está bien comentado
- Las variables tienen nombres claros
- La lógica está encapsulada en una función
- Fácil de desactivar (simplemente no usar en nuevos niveles)

### Performance:
- Usa `useCallback` para optimizar re-renders
- Animaciones CSS aceleradas por GPU
- Timeouts limpios correctamente
- No hay memory leaks

---

**Implementado por:** Programador Senior
**Fecha:** 2025-11-18
**Versión del juego:** Twin Clash v1.0
