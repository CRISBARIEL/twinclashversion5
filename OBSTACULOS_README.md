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

**Animación de rotura:**
- Transición suave de `opacity-100` a `opacity-0`
- Escala de `scale-100` a `scale-110` (se expande ligeramente al romperse)
- Duración: 500ms

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

### Cambiar duración de animación de rotura del hielo

**Archivo**: `src/components/ObstacleOverlay.tsx` (línea 34)
```typescript
transition-all duration-500  // Cambia 500 por 300, 700, 1000, etc. (milisegundos)
```

### Cambiar el efecto de escala al romperse

**Archivo**: `src/components/ObstacleOverlay.tsx` (línea 35)
```typescript
scale-110  // Opciones: scale-105, scale-125, scale-150
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
- ✅ Animación suave al romperse el hielo
- ✅ Piedra requiere dos golpes (health 2 → 1 → 0)
- ✅ Piedra sólida (health=2) se ve como roca completa
- ✅ Piedra agrietada (health=1) tiene grietas visibles
- ✅ Indicadores numéricos de vida en la piedra
- ✅ No se modificó la lógica del juego principal
- ✅ No se cambió el nombre del proyecto
- ✅ Código comentado en español
- ✅ Sistema modular y fácil de personalizar

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
