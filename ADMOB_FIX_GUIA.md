# AdMob - Solución a Problema de Anuncios No Se Muestran

## PROBLEMA IDENTIFICADO

Tus anuncios de AdMob NO se están mostrando porque:

1. ✅ **Tu cuenta AdMob está aprobada** (según captura)
2. ✅ **App ID configurado correctamente**: `ca-app-pub-2140112688604592~6170461480`
3. ⚠️ **Solo tienes 1 bloque de anuncios creado**: `ca-app-pub-2140112688604592/4482879255`
4. ❌ **La app está usando IDs de producción pero AdMob necesita tráfico REAL de Play Store**
5. ❌ **Faltan bloques de anuncios separados para Rewarded e Interstitial**

---

## SOLUCIÓN PASO A PASO

### PASO 1: Verificar con Anuncios de Prueba (AHORA)

He cambiado el código para usar **IDs de prueba de Google**. Esto te permitirá verificar que AdMob funciona ANTES de usar tus IDs reales.

**Cambios realizados:**
```typescript
// src/lib/admob.ts
private testMode = true; // MODO PRUEBA activado

// Usará estos IDs de Google (SIEMPRE funcionan):
// Rewarded: ca-app-pub-3940256099942544/5224354917
// Interstitial: ca-app-pub-3940256099942544/1033173712
```

**Qué hacer:**
1. Compila y prueba la app:
   ```bash
   npm run android:sync
   npm run android:open
   ```

2. Ejecuta la app en tu dispositivo

3. **Intenta ver un anuncio recompensado** (desde la tienda de monedas o power-ups)

4. **Deberías ver un anuncio de PRUEBA de Google** (dirá "Test Ad" en la esquina)

**Si ves los anuncios de prueba:** ✅ AdMob está configurado correctamente
**Si NO ves anuncios:** ❌ Hay un problema de configuración

---

### PASO 2: Crear Bloques de Anuncios en AdMob

Actualmente solo tienes **1 bloque** (`ca-app-pub-2140112688604592/4482879255`). Necesitas crear bloques separados:

#### Ir a AdMob Console

1. Ve a https://apps.admob.com/
2. Selecciona tu app "Twin Clash"
3. Clic en **"Unidades de anuncios"** (Ad Units)

#### Crear Anuncio Recompensado

1. Clic en **"Añadir unidad de anuncio"**
2. Selecciona **"Recompensado"** (Rewarded)
3. Nombre: `Twin Clash Rewarded`
4. Clic en **"Crear unidad de anuncio"**
5. **COPIA el ID** (será algo como `ca-app-pub-2140112688604592/XXXXXXXXX`)

#### Crear Anuncio Intersticial

1. Clic en **"Añadir unidad de anuncio"** de nuevo
2. Selecciona **"Intersticial"** (Interstitial)
3. Nombre: `Twin Clash Interstitial`
4. Clic en **"Crear unidad de anuncio"**
5. **COPIA el ID** (será algo como `ca-app-pub-2140112688604592/YYYYYYYYY`)

---

### PASO 3: Actualizar IDs en el Código

Una vez que tengas los 2 IDs nuevos, actualiza `src/lib/admob.ts`:

```typescript
const PRODUCTION_IDS = {
  rewarded: 'ca-app-pub-2140112688604592/XXXXXXXXX',      // ← TU ID REWARDED
  interstitial: 'ca-app-pub-2140112688604592/YYYYYYYYY', // ← TU ID INTERSTITIAL
};
```

Y cambia el modo a producción:

```typescript
private testMode = false; // ← Cambiar a false para producción
```

También en `src/hooks/useAdMob.ts`:

```typescript
export function useAdMob(autoInitialize: boolean = true, testMode: boolean = false)
//                                                                          ↑ false
```

---

### PASO 4: Por Qué No Ves Ingresos en AdMob

AdMob muestra **0,00 €** porque:

#### 1. Necesitas Tráfico REAL de Play Store

- Los anuncios de producción SOLO funcionan cuando:
  - La app está **publicada en Play Store**
  - Los usuarios la **instalan desde Play Store**
  - Los usuarios NO son tú (el desarrollador)

**Solución:**
- Sube la app a Play Store (en Internal Testing o Production)
- Instala desde Play Store (NO desde Android Studio)

#### 2. AdMob Requiere Tiempo para Activarse

Después de vincular tu app con AdMob:
- **Primera vez:** 24-48 horas para activarse
- **Nuevos bloques de anuncios:** 1-2 horas

**Solución:**
- Espera 24-48 horas después de crear los bloques de anuncios
- Mientras tanto, usa IDs de prueba para verificar que funciona

#### 3. Necesitas Usuarios Reales

- Los anuncios de producción NO se muestran al desarrollador
- Necesitas usuarios reales que:
  - NO sean tú
  - Instalen desde Play Store
  - Usen la app normalmente

**Solución:**
- Invita a amigos/familia a probar la app
- Publica en Internal Testing primero
- Monitorea métricas en AdMob después de 24 horas

---

## CHECKLIST COMPLETO

### ✅ Configuración Básica (YA HECHO)

- [x] App ID en AndroidManifest.xml: `ca-app-pub-2140112688604592~6170461480`
- [x] App ID en google-services.json
- [x] Permisos en AndroidManifest.xml
- [x] AdMob inicializado en MainActivity.java
- [x] Código de AdMob en src/lib/admob.ts

### 🔄 Por Hacer (IMPORTANTE)

- [ ] **PASO 1:** Probar con IDs de prueba (testMode = true)
- [ ] **PASO 2:** Crear bloque Rewarded en AdMob
- [ ] **PASO 3:** Crear bloque Interstitial en AdMob
- [ ] **PASO 4:** Actualizar PRODUCTION_IDS con los nuevos IDs
- [ ] **PASO 5:** Cambiar testMode = false
- [ ] **PASO 6:** Generar APK/AAB de producción
- [ ] **PASO 7:** Subir a Play Store (Internal Testing)
- [ ] **PASO 8:** Instalar desde Play Store y probar
- [ ] **PASO 9:** Esperar 24-48 horas
- [ ] **PASO 10:** Verificar ingresos en AdMob

---

## COMANDOS ÚTILES

### Compilar y Probar

```bash
# Sincronizar cambios
npm run android:sync

# Abrir en Android Studio
npm run android:open

# Ver logs de AdMob en tiempo real
adb logcat | grep -i admob
```

### Verificar en Logcat

Deberías ver algo como:

```
[AdMob] Initializing... { testMode: true, rewardedId: 'ca-app-pub-3940256099942544/5224354917', ... }
[AdMob] ✅ Initialized successfully
[AdMob] Rewarded ad preloaded
[AdMob] Interstitial ad preloaded
```

**Si ves errores:**
```
[AdMob] ❌ Failed to preload rewarded ad: ...
```

Esto significa:
- IDs incorrectos (si testMode = false)
- Bloques de anuncios no existen en AdMob
- Conexión a internet necesaria

---

## DIFERENCIA: IDs de Prueba vs Producción

### IDs de Prueba (testMode = true)

**Ventajas:**
- ✅ SIEMPRE funcionan
- ✅ Anuncios se muestran inmediatamente
- ✅ No requiere aprobación de AdMob
- ✅ Funciona en cualquier dispositivo

**Desventajas:**
- ❌ NO generan ingresos
- ❌ Dice "Test Ad" en la esquina
- ❌ Solo para desarrollo/testing

**Cuándo usar:**
- Durante desarrollo
- Para verificar que AdMob funciona
- Para mostrar a testers

### IDs de Producción (testMode = false)

**Ventajas:**
- ✅ Generan ingresos REALES
- ✅ Anuncios reales de anunciantes
- ✅ Métricas en AdMob

**Desventajas:**
- ❌ Requieren aprobación de AdMob (24-48 horas)
- ❌ SOLO funcionan con instalaciones desde Play Store
- ❌ NO se muestran al desarrollador
- ❌ Requieren usuarios reales

**Cuándo usar:**
- Después de publicar en Play Store
- Cuando tengas usuarios reales
- Para generar ingresos

---

## ERRORES COMUNES Y SOLUCIONES

### Error: "Ad failed to load (3)"

**Causa:** IDs incorrectos o bloques no creados en AdMob

**Solución:**
1. Verifica que los IDs existen en AdMob console
2. Espera 1-2 horas después de crear los bloques
3. Usa IDs de prueba temporalmente

### Error: "Ad failed to load (1)"

**Causa:** Conexión a internet

**Solución:**
- Verifica WiFi/datos móviles
- Verifica que el dispositivo tiene internet

### Error: No se muestran anuncios pero no hay error

**Causa:** testMode = false pero no instalaste desde Play Store

**Solución:**
1. Cambia a testMode = true
2. O sube a Play Store e instala desde ahí

### Ingresos en 0,00 € después de días

**Causas posibles:**
1. Usuarios instalaron desde Android Studio (no cuenta)
2. Solo tú has probado la app (no cuenta)
3. AdMob aún procesando (espera 48 horas)
4. Muy pocos usuarios activos

**Solución:**
- Necesitas usuarios REALES
- Instalar desde Play Store
- Compartir la app públicamente

---

## PRÓXIMOS PASOS RECOMENDADOS

### HOY (Verificación)

1. **Compila con testMode = true**
   ```bash
   npm run android:sync
   npm run android:open
   ```

2. **Ejecuta la app en tu dispositivo**

3. **Intenta ver un anuncio recompensado**
   - Ve a la tienda de monedas
   - Clic en "Ver anuncio para ganar 1000 monedas"

4. **Verifica que ves el anuncio de prueba**
   - Debe decir "Test Ad" en la esquina
   - Si lo ves: ✅ AdMob funciona

### MAÑANA (Crear Bloques)

1. **Ve a AdMob Console**
   - https://apps.admob.com/

2. **Crea 2 bloques de anuncios:**
   - 1 Rewarded
   - 1 Interstitial

3. **Copia los IDs y actualiza el código**

### EN 2-3 DÍAS (Producción)

1. **Cambia testMode = false**

2. **Genera AAB de producción**
   ```bash
   npm run android:bundle
   ```

3. **Sube a Play Store** (versión 2)

4. **Espera aprobación de Google** (1-3 días)

5. **Instala desde Play Store y prueba**

6. **Espera 24-48 horas para ver primeros ingresos**

---

## MÉTRICAS ESPERADAS

Según tus analytics de Firebase:
- **522 usuarios en 30 días**
- **7 usuarios activos**

**Ingresos estimados** (muy aproximado):
- Con 500 usuarios/mes
- 20% ven anuncios recompensados
- eCPM promedio: $5-15

**Resultado:** $0.50 - $1.50 USD/mes

Para aumentar ingresos:
- Más usuarios activos
- Más engagement (más anuncios vistos)
- Anuncios intersticiales entre niveles
- Optimización de eCPM con el tiempo

---

## CONFIGURACIÓN ACTUAL

**Tu App ID AdMob:** `ca-app-pub-2140112688604592~6170461480`

**Bloque de anuncios que tienes:** `ca-app-pub-2140112688604592/4482879255`

**Configuración en el código (ACTUAL):**
```typescript
// testMode = true (IDs de prueba de Google)
const TEST_IDS = {
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
};

// Tus IDs (se usarán cuando testMode = false)
const PRODUCTION_IDS = {
  rewarded: 'ca-app-pub-2140112688604592/4482879255',
  interstitial: 'ca-app-pub-2140112688604592/4482879255',
};
```

**Estado:** ✅ Listo para probar con IDs de prueba

---

## RESUMEN

1. ✅ **Tu configuración básica está correcta**
2. ⚠️ **Necesitas crear bloques de anuncios separados en AdMob**
3. ⚠️ **AdMob de producción requiere instalación desde Play Store**
4. ⚠️ **Los ingresos tardan 24-48 horas en aparecer**

**Acción inmediata:**
1. Compila con testMode = true
2. Verifica que ves anuncios de prueba
3. Crea bloques de anuncios en AdMob console
4. Actualiza IDs en el código
5. Sube a Play Store

**¡Los anuncios funcionarán una vez que sigas estos pasos!** 🚀
