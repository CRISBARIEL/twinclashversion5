# Instrucciones de Prueba - Virus Progresivo

## Sistema Implementado

Se ha implementado el sistema de **Virus Progresivo** con las siguientes características:

### Mecánica
1. **Timer Global de 20 segundos** - Todos los virus comparten un solo timer
2. **Contagio Automático** - Cada 20 segundos, cada virus contagia 1 carta adyacente aleatoria
3. **Desbloqueo por Match Adyacente** - Los virus se eliminan haciendo matches en cartas adyacentes
4. **Reinicio del Timer** - Después de propagar, el timer se reinicia a 20 segundos

### Activación
El sistema solo se activa cuando se cumplen **TODAS** estas condiciones:
- **Mundo 40 o superior** (world >= 40)
- **Dificultad: very_hard O expert**
- **El nivel tiene obstáculos de virus**

### Niveles de Prueba

**Mundo 40 (Spring):**
- **Nivel 199** (Mundo 40, Nivel 4) - very_hard, 3 virus, 2 fuegos - ✅ Activo
- **Nivel 200** (Mundo 40, Nivel 5) - expert, 4 virus, 2 fuegos, 1 bomba - ✅ Activo

**Otros niveles con virus en Mundo 40+:**
Los siguientes niveles también tienen virus pero en dificultades menores (NO se activa el virus progresivo):
- Nivel 197 (Mundo 40, Nivel 2) - easy, 2 virus
- Nivel 198 (Mundo 40, Nivel 3) - hard, 3 virus, 1 fuego

## Cómo Probar

### Paso 1: Abrir la Consola del Navegador
Abre las herramientas de desarrollo (F12) y ve a la pestaña "Console" para ver los logs.

### Paso 2: Jugar un Nivel con Virus Progresivo
1. Ve al **Mundo 40**
2. Juega el **Nivel 4 (very_hard)** o **Nivel 5 (expert)**
3. Observa la **UI del timer** en la parte superior del juego:
   - Fondo morado/rojo
   - Contador de segundos
   - Icono de virus 🦠
   - Mensaje de advertencia cuando quedan ≤5 segundos

### Paso 3: Observar los Logs en la Consola

Deberías ver estos logs:

#### Al iniciar el nivel:
```
[GameCore] Progressive virus enabled: true {worldId: 40, difficulty: "very_hard", hasVirus: true}
[GameCore] Iniciando timer global de virus. Virus count: 3
[startGlobalVirusTimer] Llamada a función. GlobalTimer activo? false
[startGlobalVirusTimer] Virus detectados: 3
[startGlobalVirusTimer] Creando nuevo timer global
[startGlobalVirusTimer] Timer creado con ID: xxx
```

#### Cada segundo:
```
[VirusTimer] Tick del timer
[VirusTimer] Tiempo restante: 19
[VirusTimer] Tiempo restante: 18
...
```

#### Cuando el timer llega a 0:
```
[VirusTimer] Tiempo restante: 0
[VirusTimer] ¡Tiempo agotado! Propagando virus...
[VirusTimer] Llamando a spreadVirus con 20 cartas
[spreadVirus] Iniciando propagación. Total cartas: 20
[spreadVirus] Virus encontrados: 3
[spreadVirus] Virus en índice X tiene adyacentes: [Y, Z, ...]
[spreadVirus] Targets válidos para virus en X: N
[spreadVirus] Infectando carta en índice: Y
[spreadVirus] Total de cartas a infectar: 3 - índices: [Y, Z, W]
[spreadVirus] Convirtiendo carta en índice Y a virus
[spreadVirus] Propagación completa
[VirusTimer] Reiniciando timer a 20s
```

#### Al hacer un match adyacente a un virus:
```
[GameCore] handleVirusMatch llamado con cartas: [id1, id2]
(El virus debería reducir su blockedHealth y eventualmente desaparecer)
```

## Qué Observar

### ✅ Funcionamiento Correcto:
1. El timer aparece en la UI cuando juegas niveles 199 o 200
2. El contador baja de 20 a 0 cada segundo
3. Cuando llega a 0, nuevas cartas se convierten en virus (con ícono de virus 🦠)
4. El timer se reinicia a 20 segundos automáticamente
5. Los virus se pueden eliminar haciendo matches adyacentes
6. Cuando no hay más virus, el timer desaparece

### ❌ Problemas Potenciales:
1. **El timer no aparece** → Verificar que estás en nivel 199 o 200
2. **El timer no cuenta** → Revisar logs de `[VirusTimer] Tick del timer`
3. **No se propaga el virus** → Revisar logs de `[spreadVirus]`
4. **El timer no se reinicia** → Verificar logs después del contagio

## Notas Importantes

- El sistema **NO se activa** en niveles easy, normal o hard, solo en **very_hard** y **expert**
- El sistema **NO se activa** antes del mundo 40
- Los power-ups siguen funcionando normalmente
- Puedes usar power-ups para revelar o eliminar cartas aunque estén bloqueadas por virus

## Depuración

Si el sistema no funciona:
1. Verifica los logs en la consola desde el inicio del nivel
2. Busca el log `[GameCore] Progressive virus enabled: true/false`
3. Si es `false`, verifica las condiciones (mundo, dificultad, tiene virus)
4. Si es `true` pero no se inicia el timer, revisa los logs de `[startGlobalVirusTimer]`
5. Reporta los logs de la consola para análisis
