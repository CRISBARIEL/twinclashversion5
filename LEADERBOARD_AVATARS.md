# Sistema de Avatares en Rankings

## Problema Resuelto

El usuario identificó dos problemas en los rankings:

1. **Rankings son simulados con bots** - Mientras no haya jugadores reales, se muestran bots para dar contexto competitivo
2. **Todos los avatares eran iguales** - No había avatares en el ranking del reto diario, y cuando los había, todos se veían iguales

## Solución Implementada

### 1. Avatares Únicos por Jugador

Cada jugador (bot o real) ahora tiene un avatar único generado consistentemente basado en su `client_id`.

```typescript
const AVATAR_STYLES = ['adventurer', 'adventurer-neutral', 'avataaars', 'big-ears', 'lorelei', 'micah', 'personas'];

const getAvatarForPlayer = (clientId: string) => {
  const hash = clientId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const styleIndex = hash % AVATAR_STYLES.length;

  return {
    style: AVATAR_STYLES[styleIndex],
    seed: clientId,
  };
};
```

**Cómo funciona:**
- Genera un hash numérico del `client_id`
- Selecciona un estilo de avatar basado en ese hash
- Usa el `client_id` como seed para DiceBear
- Resultado: El mismo jugador SIEMPRE tiene el mismo avatar

### 2. Visualización en Rankings

Cada entrada del ranking ahora muestra:
- **Posición** (medalla para top 3)
- **Avatar único** del jugador
- **Nombre** del jugador
- **Estadísticas** (tiempo, movimientos)
- **Timestamp** (solo para jugadores reales)

## Sistema de Bots

### ¿Cuándo aparecen los bots?

Los bots se generan SOLO cuando:
- Es el primer día de un nuevo reto diario (nuevo seed)
- NO hay ningún jugador real que haya jugado todavía

### ¿Cómo se identifican?

Cada bot tiene:
- `is_bot: true` en la base de datos
- `client_id: "bot-{seed}-{índice}"` único
- `display_name: "CPU Kiwi #1"`, `"CPU Kiwi #2"`, etc.
- Emoji 🧪 junto a su nombre
- Etiqueta "(Prueba)" en gris

### ¿Qué pasa cuando llegan jugadores reales?

1. **Primer jugador real:**
   - Los bots SE QUEDAN en el ranking (para dar contexto)
   - El jugador real obtiene +20 monedas por "Medalla Pionero"
   - Aparece banner azul: "¡Sé el primero en jugar hoy!"

2. **Más jugadores reales:**
   - Los bots siguen visibles pero más transparentes
   - Todos compiten en el mismo ranking
   - Los jugadores reales se destacan sin el emoji 🧪

3. **Ranking lleno de jugadores reales:**
   - Los bots se empujan hacia abajo naturalmente
   - Si hay 20 jugadores reales mejores que los bots, los bots desaparecen del top 20

## Diferencias entre Rankings

### Leaderboard (Reto Diario)
- **Ubicación:** Al terminar un nivel del reto diario
- **Datos:** Puntajes del seed específico de ese día
- **Bots:** SÍ, cuando no hay jugadores reales
- **Avatares:** Generados automáticamente por `getAvatarForPlayer()`
- **Propósito:** Competencia del desafío diario

### DailyLeaderboard (Clasificación Global)
- **Ubicación:** Menú principal → Botón "Clasificación"
- **Datos:** Puntajes acumulados de todos los niveles
- **Bots:** NO, solo jugadores reales
- **Avatares:** Avatares personalizados de cada jugador (avatar_config)
- **Propósito:** Ranking global acumulativo

## Características de los Avatares

### Para Bots
```typescript
// Bot client_id: "bot-daily-2026-02-01-0"
// Genera: { style: 'lorelei', seed: 'bot-daily-2026-02-01-0' }
```

### Para Jugadores Reales
```typescript
// Player client_id: "abc123def456"
// Genera: { style: 'personas', seed: 'abc123def456' }
```

### Ventajas

1. **Consistencia:** El mismo jugador siempre tiene el mismo avatar
2. **Variedad:** 7 estilos diferentes distribuidos equitativamente
3. **Único:** El seed (client_id) hace que cada avatar sea único incluso dentro del mismo estilo
4. **Sin configuración:** Se genera automáticamente, no requiere que el usuario configure nada

## UI/UX Mejorada

### Antes
```
[#1] [Nombre del jugador] 23.0s | 10 movs
[#2] [Nombre del jugador] 27.0s | 11 movs
```

### Ahora
```
[🏆] [Avatar único] [Nombre] 23.0s | 10 movs
[🥈] [Avatar único] [Nombre] 27.0s | 11 movs
```

### Elementos Visuales

- **Avatares circulares** con fondo blanco
- **Medallas** para top 3 (oro, plata, bronce)
- **Resaltado azul** para el jugador actual
- **Opacidad reducida** para bots
- **Badges** "¡Tú!" para el jugador actual
- **Responsive:** Se adapta a diferentes tamaños de pantalla

## Datos Técnicos

### Tablas de Base de Datos

**scores**
```sql
- id: uuid
- seed: text (ej: "daily-2026-02-01")
- time_ms: integer
- moves: integer
- client_id: text (único por jugador)
- display_name: text
- is_bot: boolean
- created_at: timestamp
```

### Generación de Bots

```typescript
const botTimes = [23000, 27000, 31000, 35000, 40000];
const bots = botTimes.map((timeMs, i) => ({
  seed,
  time_ms: timeMs,
  moves: 10 + i,
  client_id: `bot-${seed}-${i}`,
  display_name: `CPU Kiwi #${i + 1}`,
  is_bot: true,
}));
```

## Testing Checklist

- [x] Cada jugador tiene un avatar único
- [x] El mismo jugador siempre tiene el mismo avatar
- [x] Los bots tienen avatares diferentes entre sí
- [x] Los avatares se ven en círculos con fondo blanco
- [x] Los bots tienen emoji 🧪 y etiqueta "(Prueba)"
- [x] El jugador actual está resaltado en azul
- [x] Las medallas top 3 se muestran correctamente
- [x] El banner de "Marcas de prueba" aparece cuando solo hay bots
- [x] Los avatares son responsive
- [x] Build compila sin errores
- [x] No hay errores en consola

## Flujo del Usuario

### Día 1 de Reto Diario - Sin jugadores

```
1. Usuario abre el juego
2. Completa un nivel
3. Ve el ranking con 5 bots (CPU Kiwi #1-5)
4. Cada bot tiene un avatar diferente y único
5. Banner: "¡Sé el primero en jugar hoy y gana +20 monedas!"
6. Usuario juega
```

### Día 1 - Usuario es el primero

```
1. Usuario completa el nivel
2. Sistema verifica: ¿Hay jugadores reales? NO
3. Otorga +20 monedas (Medalla Pionero)
4. Inserta score del usuario
5. Ranking muestra: Usuario (1º) + 5 bots (2º-6º)
6. Usuario ve su avatar único en el ranking
```

### Día 1 - Más jugadores se unen

```
1. Segundo usuario juega
2. Sistema verifica: ¿Hay jugadores reales? SÍ (1 jugador)
3. NO otorga medalla Pionero
4. Inserta score del usuario
5. Ranking muestra: Jugador 1, Usuario, Bots mezclados
6. Cada uno con su avatar único
```

### Día 2 - Nuevo reto

```
1. Nuevo seed: "daily-2026-02-02"
2. Sistema verifica: ¿Hay jugadores reales con este seed? NO
3. Genera nuevos 5 bots para este seed
4. Los bots tienen client_id: "bot-daily-2026-02-02-{i}"
5. Los bots tienen avatares diferentes a los de ayer
6. Ciclo se repite
```

## Archivos Modificados

```
src/components/Leaderboard.tsx
  - Importado: AvatarView
  - Agregado: AVATAR_STYLES array
  - Agregada: getAvatarForPlayer() function
  - Modificado: Renderizado de cada entrada con avatar
  - Agregado: truncate para nombres largos
  - Agregado: flex-shrink-0 para evitar compresión de avatares
```

## Mejoras Futuras Posibles

1. **Avatares personalizados para bots:** Diseños especiales para bots temáticos
2. **Animaciones:** Transición suave al aparecer avatares
3. **Hover effects:** Mostrar detalles del jugador al pasar el mouse
4. **Badges especiales:** Iconos para pioneros, rachas, etc.
5. **Agrupación visual:** Separar bots de jugadores reales con divisor

## Resultado

Los rankings ahora son visualmente atractivos, cada jugador es fácilmente identificable por su avatar único, y el sistema de bots proporciona contexto competitivo sin confundir a los usuarios sobre qué es simulado y qué es real.

**Antes:** Rankings sin avatares, difícil diferenciar jugadores
**Ahora:** Cada jugador tiene un avatar único y consistente
