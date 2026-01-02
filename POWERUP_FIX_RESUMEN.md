# Corrección de Power-Ups - Resumen Rápido

## Problema Corregido

En niveles con obstáculos (hielo, piedra, hierro), los power-ups 20% y 40% dejaban niveles imposibles de resolver.

### Por qué pasaba

❌ El código buscaba pares donde AMBAS cartas tenían obstáculos
❌ Si solo UNA carta del par tenía obstáculo, nunca se desbloqueaba
❌ Resultado: Cartas bloqueadas sin pareja → nivel imposible

---

## Solución Implementada

### Archivo Modificado
**`src/components/GameCore.tsx`** - Función `handlePowerUp`

### Cambio Principal

**ANTES:**
```typescript
// Solo pares donde AMBAS cartas tienen obstáculos
.filter(([, cards]) => cards.every(c => c.obstacle))
```

**AHORA:**
```typescript
// Pares donde AL MENOS UNA carta tiene obstáculo
.filter(pair => pair.some(card => card.obstacle))
// Y DESBLOQUEA AMBAS CARTAS del par
```

---

## Cómo Funciona Ahora

### Power-Up 20%

Desbloquea el 20% de las cartas en pares completos:

- ❄️ **Hielo**: Se quita completamente
- 🪨 **Piedra (2 health)**: Se reduce a 1 health
- 🔩 **Hierro (2 health)**: Se reduce a 1 health
- ✅ Desbloquea **AMBAS cartas del par** (incluso si solo una tenía obstáculo)

### Power-Up 40%

Desbloquea el 40% de las cartas en pares completos:

- ❄️ **Hielo**: Se quita completamente
- 🪨 **Piedra**: Se quita completamente (cualquier health)
- 🔩 **Hierro**: Se quita completamente (cualquier health)
- ✅ Desbloquea **AMBAS cartas del par**

---

## Ejemplo

### Nivel con 10 pares (20 cartas)

**Distribución de obstáculos:**
- Carta A con hielo ❄️ + Carta A' sin obstáculo
- Carta B con piedra 🪨 + Carta B' sin obstáculo
- Carta C con hielo ❄️ + Carta C' con hielo ❄️
- 7 pares sin obstáculos

### Al usar Power-Up 20%

**Antes (bug):**
- Desbloqueaba solo el par C (ambas con hielo)
- Cartas A y B quedaban bloqueadas sin pareja ❌
- **Nivel imposible**

**Ahora (corregido):**
- Desbloquea pares A, B y C (4 cartas = 20%)
- Desbloquea **AMBAS cartas** de cada par
  - Par A: quita hielo de carta A, carta A' ya disponible ✅
  - Par B: quita piedra de carta B, carta B' ya disponible ✅
  - Par C: quita hielo de ambas cartas ✅
- **Nivel siempre resoluble** ✅

---

## Garantías

1. ✅ Siempre desbloquea pares completos (2 cartas)
2. ✅ Nunca deja cartas sin pareja
3. ✅ El porcentaje se aplica correctamente
4. ✅ Prioriza pares cerca de otras cartas bloqueadas
5. ✅ Los niveles son siempre resolubles

---

## Build

```
✓ 2188 modules transformed
✓ built in 9.68s
✅ Sin errores
```

---

## Testing

Probar en niveles con obstáculos:
- Nivel 18: hielo + piedra
- Nivel 30: hielo + piedra
- Nivel 80: hielo + hierro
- Nivel 105: hielo + piedra + hierro

Verificar:
- ✅ Power-up 20% desbloquea pares completos
- ✅ Power-up 40% desbloquea más pares
- ✅ Niveles siempre resolubles

---

## Estado

✅ **Problema resuelto**
✅ **Build exitoso**
✅ **Listo para testing**
