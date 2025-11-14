# 🎮 Sistema de Obstáculos - Twin Clash

## 📋 Resumen de Cambios

He mejorado completamente el sistema visual de obstáculos (hielo y piedra) sin tocar la lógica del juego. Los obstáculos ahora tienen efectos visuales profesionales y realistas.

---

## 🧊 HIELO - Un Solo Golpe

### Comportamiento

- **Vida inicial**: 1 (se establece en `GameCore.tsx` línea 175)
- **Se rompe**: Con un solo golpe/match adyacente
- **Eliminación**: Cuando `health` llega a 0, se elimina automáticamente del estado

### Apariencia Visual

**Overlay de hielo translúcido:**
- Degradado celeste/azul (`from-cyan-200/80 to-sky-400/80`)
- Efecto de cristal con `backdrop-blur-sm`
- Copo de nieve ❄️ centrado con animación pulse
- Bordes brillantes que simulan hielo real
- Reflejos de luz para efecto 3D

**Animación de rotura mejorada:**
- El overlay completo se expande y desvanece (`scale-100` → `scale-125` + fade)
- **8 partículas grandes** salen disparadas en diferentes direcciones
- **6 chispas pequeñas** adicionales para más dramatismo
- Las partículas rotan mientras se mueven
- Cada partícula tiene un delay escalonado (0-200ms)
- Duración total: 600ms
- Las partículas tienen 3 tonos diferentes de azul/celeste/blanco

### Sistema de Detección de Rotura

El componente `ObstacleOverlay.tsx` usa un `useEffect` inteligente que detecta automáticamente cuándo el hielo se rompe:

**Cómo funciona** (líneas 72-92 de `ObstacleOverlay.tsx`):

1. **Guarda la salud anterior** en un estado local `previousHealth`
2. **Compara** la salud anterior con la salud actual en cada render
3. **Detecta el momento exacto** cuando `previousHealth > 0` y `currentHealth <= 0`
4. **Activa la animación** estableciendo `isShatteringIce = true`
5. **Espera 600ms** para que termine la animación
6. **Limpia el estado** estableciendo `isShatteringIce = false`

```typescript
useEffect(() => {
  if (
    card.obstacle === 'ice' &&
    previousHealth !== undefined &&
    previousHealth > 0 &&
    (card.obstacleHealth ?? 0) <= 0
  ) {
    // ¡El hielo acaba de romperse!
    setIsShatteringIce(true);

    const timeout = setTimeout(() => {
      setIsShatteringIce(false);
    }, 600); // Duración de la animación

    return () => clearTimeout(timeout);
  }

  setPreviousHealth(card.obstacleHealth);
}, [card.obstacle, card.obstacleHealth, previousHealth]);
```

Este sistema es completamente automático y no requiere cambios en la lógica del juego.

### Código Relevante

**Inicialización del hielo** (`GameCore.tsx` líneas 170-179):
```typescript
if (obstacles.ice) {
  let placed = 0;
  for (let i = 0; i < shuffleIndices.length && placed < obstacles.ice; i++) {
    const idx = shuffleIndices[i];
    if (canPlaceObstacle(idx, occupiedIndices, false)) {
      shuffled[idx].obstacle = 'ice';
      shuffled[idx].obstacleHealth = 1;  // ← Vida inicial = 1
      occupiedIndices.add(idx);
      placed++;
    }
  }
}
```

**Aplicación de daño** (`GameCore.tsx` líneas 418-424):
```typescript
if (adjacentIndices.includes(idx) && c.obstacle && (c.obstacleHealth ?? 0) > 0) {
  const newHealth = (c.obstacleHealth ?? 0) - 1;
  if (newHealth <= 0) {
    // ← El hielo desaparece completamente
    return { ...c, obstacle: null, obstacleHealth: 0 };
  }
  return { ...c, obstacleHealth: newHealth };
}
```

---

## 🪨 PIEDRA - Doble Bloqueo

### Comportamiento

- **Vida inicial**: 2 (se establece en `GameCore.tsx` línea 188)
- **Requiere**: Dos golpes para romperse completamente
- **Estados**: Sólida (health=2) → Agrietada (health=1) → Destruida (health=0)

### Apariencia Visual

#### Estado 1: Piedra Sólida (health = 2)

**Características:**
- Degradado oscuro de marrón/gris (`stone-600` → `stone-900`)
- Textura de roca con patrones y manchas
- Sombra interna para dar profundidad
- Emoji de roca 🪨 grande y visible
- **Indicador rojo con "2"** en esquina inferior derecha
- Bordes de roca oscuros

#### Estado 2: Piedra Agrietada (health = 1)

**Características:**
- Colores más claros (`stone-400` → `stone-600`)
- **Grietas visibles:**
  - Grieta diagonal principal
  - Grieta horizontal
  - Grieta diagonal secundaria
- Emoji de roca más tenue (opacity 60%)
- **Indicador naranja con "1"** en esquina inferior derecha
- Overlay de daño semi-transparente

### Código Relevante

**Inicialización de la piedra** (`GameCore.tsx` líneas 182-193):
```typescript
if (obstacles.stone) {
  let placed = 0;
  for (let i = 0; i < shuffleIndices.length && placed < obstacles.stone; i++) {
    const idx = shuffleIndices[i];
    if (!occupiedIndices.has(idx) && canPlaceObstacle(idx, occupiedIndices, true)) {
      shuffled[idx].obstacle = 'stone';
      shuffled[idx].obstacleHealth = 2;  // ← Vida inicial = 2
      occupiedIndices.add(idx);
      placed++;
    }
  }
}
```

---

## 📁 Archivos Modificados

### 1. **`src/components/ObstacleOverlay.tsx`** ⭐ NUEVO
Componente principal que renderiza todos los overlays de obstáculos.

**Responsabilidades:**
- Renderizar el overlay de hielo con efectos visuales
- Renderizar piedra sólida (health = 2)
- Renderizar piedra agrietada (health = 1)
- Manejar animación de rotura para hielo

### 2. **`src/components/GameCard.tsx`**
Integración del componente ObstacleOverlay.

**Cambios:**
- Importa `ObstacleOverlay`
- Añade prop `isBreaking` para animación de rotura
- Elimina renderizado antiguo de obstáculos (código inline)
- Renderiza `<ObstacleOverlay />` como overlay absoluto sobre la carta

### 3. **`src/components/GameCore.tsx`**
Pasa la información de animación al componente de carta.

**Cambios:**
- Pasa prop `isBreaking={breakingCards.has(card.id)}` a GameCard
- No se modificó la lógica de daño ni de eliminación de obstáculos

### 4. **`tailwind.config.js`**
Añade colores personalizados de piedra.

**Cambios:**
- Añade paleta de colores `stone` (400, 500, 600, 700, 800, 900)

### 5. **`src/index.css`**
Limpieza de estilos antiguos.

**Cambios:**
- Elimina `.obstacle-ice` y sus pseudo-elementos
- Elimina `.obstacle-stone` y sus pseudo-elementos
- Mantiene solo `.obstacle-crack` para animaciones

---

## 🎨 Cómo Personalizar

### Cambiar el estilo visual del HIELO

**Archivo**: `src/components/ObstacleOverlay.tsx` (líneas 30-56)

**Colores del degradado:**
```typescript
bg-gradient-to-br from-cyan-200/80 via-sky-300/80 to-sky-400/80
```
Cambia `cyan-200`, `sky-300`, `sky-400` por otros tonos de azul/celeste.

**Intensidad del blur:**
```typescript
backdrop-blur-sm  // Opciones: backdrop-blur-none, backdrop-blur, backdrop-blur-md, backdrop-blur-lg
```

**Cambiar el emoji:**
```typescript
<div className="text-5xl drop-shadow-lg animate-pulse">❄️</div>
```
Reemplaza `❄️` por `🧊` (cubo de hielo) o cualquier otro emoji.

**Opacidad del fondo:**
```typescript
from-cyan-200/80  // El /80 es la opacidad (0-100)
```

### Cambiar el estilo visual de la PIEDRA

**Archivo**: `src/components/ObstacleOverlay.tsx` (líneas 62-145)

**Colores de piedra sólida:**
```typescript
bg-gradient-to-br from-stone-600 via-stone-700 to-stone-900
```

**Colores de piedra agrietada:**
```typescript
bg-gradient-to-br from-stone-400 via-stone-500 to-stone-600
```

**Cambiar el emoji:**
```typescript
<div className="text-5xl drop-shadow-2xl">🪨</div>
```
Reemplaza `🪨` por `⛰️` (montaña) o `🗿` (moai).

**Modificar grietas** (solo en piedra agrietada, líneas 105-116):
```typescript
// Grieta diagonal principal
<div className="absolute top-0 left-1/4 w-1 h-full bg-black/60 transform -rotate-12"></div>
```
Cambia `w-1` (ancho), `-rotate-12` (ángulo), `left-1/4` (posición).

### Cambiar el daño que recibe cada obstáculo

**Archivo**: `src/components/GameCore.tsx`

**Para cambiar vida inicial del HIELO:**
```typescript
// Línea 175
shuffled[idx].obstacleHealth = 1;  // Cambia el 1 por 2 o más
```

**Para cambiar vida inicial de la PIEDRA:**
```typescript
// Línea 188
shuffled[idx].obstacleHealth = 2;  // Cambia el 2 por 3 o más
```

**IMPORTANTE**: Si cambias la vida de la piedra a 3 o más, necesitarás añadir más estados visuales en `ObstacleOverlay.tsx` (por ejemplo, `obstacleHealth === 3`, `obstacleHealth === 2`, etc.).

---

## 🔧 Ajustes Avanzados

### Personalizar las partículas de hielo

**Archivo**: `src/components/ObstacleOverlay.tsx`

#### Añadir o quitar partículas

**Líneas 22-31**: El array `ICE_PARTICLES` define las 8 partículas principales.

Para añadir más partículas:
```typescript
const ICE_PARTICLES = [
  // ... partículas existentes
  { initialX: '50%', initialY: '50%', translateX: 30, translateY: 70, delay: 250 }, // Nueva partícula
];
```

Para quitar partículas, simplemente elimina líneas del array.

#### Cambiar direcciones y velocidad

```typescript
{
  initialX: '50%',      // Posición inicial X (siempre '50%' para centrar)
  initialY: '50%',      // Posición inicial Y (siempre '50%' para centrar)
  translateX: -40,      // Movimiento horizontal (-izquierda, +derecha) en px
  translateY: -50,      // Movimiento vertical (-arriba, +abajo) en px
  delay: 0              // Retraso de la animación en ms (0-200 recomendado)
}
```

#### Cambiar tamaño de partículas

**Línea 166**: Tamaño de partículas grandes
```typescript
className="absolute w-3 h-3 rounded-full..."  // w-3 h-3 = 12px × 12px
// Opciones: w-2 h-2 (8px), w-4 h-4 (16px), w-5 h-5 (20px)
```

**Línea 184**: Tamaño de chispas pequeñas
```typescript
className="absolute w-1.5 h-1.5 bg-white..."  // w-1.5 h-1.5 = 6px × 6px
```

#### Cambiar colores de partículas

**Línea 170**: Colores de las partículas principales (3 tonos alternados)
```typescript
backgroundColor: index % 3 === 0 ? '#e0f2fe' : index % 3 === 1 ? '#bae6fd' : '#ffffff'
// #e0f2fe = Azul muy claro
// #bae6fd = Celeste medio
// #ffffff = Blanco
```

#### Cambiar duración de la animación

**Línea 83**: Duración del timeout (debe coincidir con la animación)
```typescript
setTimeout(() => {
  setIsShatteringIce(false);
}, 600);  // ← Cambiar este número (en ms)
```

**Línea 166**: Duración de partículas grandes
```typescript
className="... transition-all duration-[600ms] ease-out"
// Cambiar 600ms por 400ms, 800ms, 1000ms, etc.
```

**Línea 184**: Duración de chispas pequeñas
```typescript
className="... transition-all duration-[400ms] ease-out"
// Normalmente más rápido que las partículas grandes
```

#### Cambiar número de chispas

**Línea 181**: Cantidad de chispas pequeñas adicionales
```typescript
{[...Array(6)].map((_, i) =>
// Cambiar el 6 por cualquier número (4, 8, 10, etc.)
```

### Cambiar duración de animación del overlay principal

**Línea 123**: Duración del fade y scale del overlay
```typescript
className="... duration-500 opacity-0 scale-125"
// duration-500 = 500ms (cambiar por duration-300, duration-700, etc.)
// scale-125 = expande al 125% (cambiar por scale-110, scale-150, etc.)
```

### Añadir un tercer estado a la piedra

Si quieres que la piedra tenga `health = 3`, añade este código en `ObstacleOverlay.tsx` ANTES del estado `health === 2`:

```typescript
if (card.obstacleHealth === 3) {
  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden">
      {/* Piedra super sólida - diseño aún más oscuro */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-700 via-stone-800 to-black"></div>

      {/* Emoji */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-5xl drop-shadow-2xl">🪨</div>
      </div>

      {/* Indicador con "3" */}
      <div className="absolute bottom-2 right-2 w-8 h-8 bg-red-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white z-20">
        3
      </div>
    </div>
  );
}
```

---

## ✅ Checklist de Implementación

- ✅ Hielo se rompe con un solo golpe
- ✅ Hielo tiene efecto visual translúcido y bonito
- ✅ **Animación de rotura con partículas explosivas**
- ✅ **8 partículas grandes + 6 chispas pequeñas**
- ✅ **Rotación y movimiento direccional de partículas**
- ✅ **Delays escalonados para efecto natural**
- ✅ Piedra requiere dos golpes (health 2 → 1 → 0)
- ✅ Piedra sólida (health=2) se ve como roca completa
- ✅ Piedra agrietada (health=1) tiene grietas visibles
- ✅ Indicadores numéricos de vida en la piedra
- ✅ No se modificó la lógica del juego principal
- ✅ No se cambió el nombre del proyecto
- ✅ Código comentado en español
- ✅ Sistema modular y fácil de personalizar
- ✅ useEffect detecta automáticamente la rotura del hielo
- ✅ pointer-events-none para no bloquear clics

---

## 🎯 Resumen Final

**Lo que se mantuvo igual:**
- Lógica de emparejar cartas
- Sistema de daño a obstáculos
- Estructura del estado del juego
- Flujo de juego de Twin Clash

**Lo que mejoró:**
- Visualización profesional de obstáculos
- Hielo translúcido con efectos de cristal
- Piedra realista con texturas y grietas
- Animaciones suaves
- Código modular y fácil de mantener

**Ventajas del nuevo sistema:**
- Todo el código visual está en un solo componente (`ObstacleOverlay.tsx`)
- Fácil de personalizar colores, emojis y efectos
- Separación clara entre lógica y presentación
- Más fácil añadir nuevos tipos de obstáculos en el futuro

---

¿Necesitas más ajustes? Solo edita `ObstacleOverlay.tsx` para cambios visuales, o `GameCore.tsx` (líneas 175 y 188) para cambiar la vida inicial de los obstáculos.
