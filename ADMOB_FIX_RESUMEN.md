# AdMob - Problema y Solución Rápida

## POR QUÉ NO FUNCIONA AHORA

Tu cuenta AdMob está aprobada ✅ pero los anuncios no se muestran porque:

1. **Solo tienes 1 bloque de anuncios** en AdMob
   - Tu ID: `ca-app-pub-2140112688604592/4482879255`
   - Necesitas 2 bloques separados: Rewarded + Interstitial

2. **AdMob de producción requiere:**
   - App publicada en Play Store
   - Usuarios instalando desde Play Store (no desde Android Studio)
   - 24-48 horas después de vincular la app

3. **Los ingresos muestran 0,00 € porque:**
   - Solo tú has probado la app
   - No tienes suficiente tráfico real
   - AdMob necesita usuarios reales, no el desarrollador

---

## QUÉ CAMBIÉ

### 1. Activé Modo Prueba (testMode = true)

Ahora la app usa **IDs de prueba de Google** que SIEMPRE funcionan.

**Archivo:** `src/lib/admob.ts`
```typescript
private testMode = true; // ← MODO PRUEBA activado
```

**Qué hace:**
- Usa IDs de prueba de Google
- Muestra anuncios inmediatamente
- Los anuncios dicen "Test Ad"
- NO genera ingresos (es para testing)

### 2. Actualicé IDs de Producción

Ambos IDs apuntan a tu único bloque:
```typescript
const PRODUCTION_IDS = {
  rewarded: 'ca-app-pub-2140112688604592/4482879255',
  interstitial: 'ca-app-pub-2140112688604592/4482879255', // Mismo ID
};
```

### 3. Agregué Mejor Logging

Ahora verás en logcat:
```
[AdMob] ✅ Initialized successfully
[AdMob] Rewarded ad preloaded
```

---

## QUÉ HACER AHORA

### PASO 1: Probar con IDs de Prueba (5 minutos)

```bash
npm run android:sync
npm run android:open
```

1. Ejecuta la app en tu dispositivo
2. Ve a la tienda de monedas
3. Toca "Ver anuncio para ganar monedas"
4. **Deberías ver un anuncio de prueba de Google**

**Si lo ves:** ✅ AdMob funciona perfectamente
**Si NO lo ves:** Revisa logcat

### PASO 2: Crear Bloques de Anuncios en AdMob

Ve a https://apps.admob.com/ y crea:

1. **Anuncio Recompensado:**
   - Apps → Twin Clash → Unidades de anuncio → Añadir
   - Tipo: **Recompensado**
   - Nombre: `Twin Clash Rewarded`
   - Copia el ID: `ca-app-pub-2140112688604592/XXXXXXXXX`

2. **Anuncio Intersticial:**
   - Añadir otra unidad
   - Tipo: **Intersticial**
   - Nombre: `Twin Clash Interstitial`
   - Copia el ID: `ca-app-pub-2140112688604592/YYYYYYYYY`

### PASO 3: Actualizar Código con Tus IDs

En `src/lib/admob.ts`, actualiza:

```typescript
const PRODUCTION_IDS = {
  rewarded: 'ca-app-pub-2140112688604592/XXXXXXXXX',      // ← TU ID REWARDED
  interstitial: 'ca-app-pub-2140112688604592/YYYYYYYYY', // ← TU ID INTERSTITIAL
};
```

Y cambia a producción:

```typescript
private testMode = false; // ← Cambiar a false
```

También en `src/hooks/useAdMob.ts`:

```typescript
export function useAdMob(autoInitialize: boolean = true, testMode: boolean = false)
//                                                                          ↑ false
```

### PASO 4: Generar AAB y Subir a Play Store

```bash
npm run android:bundle
```

- versionCode: 2
- versionName: 1.1

Sube a Play Store y espera 24-48 horas para ver ingresos.

---

## POR QUÉ VES 0,00 € EN ADMOB

AdMob muestra **0 ingresos** porque:

### 1. No Tienes Tráfico Real de Play Store

**Los anuncios de producción NO funcionan con:**
- Instalaciones desde Android Studio
- Tú probando la app (el desarrollador)
- APKs compartidos por WhatsApp

**SOLO funcionan con:**
- ✅ Usuarios instalando desde Play Store
- ✅ Usuarios reales (no tú)
- ✅ App publicada (Internal Testing o Production)

### 2. AdMob Necesita Tiempo

- Primera vinculación: **24-48 horas**
- Nuevos bloques de anuncios: **1-2 horas**
- Primeros ingresos visibles: **24 horas después de las primeras impresiones**

### 3. Necesitas Más Usuarios

Según Firebase Analytics:
- 522 usuarios en 30 días
- 7 usuarios activos ahora

**Ingresos estimados:** $0.50 - $1.50 USD/mes

Para aumentar:
- Más usuarios activos
- Más engagement (más anuncios vistos)
- Compartir la app públicamente

---

## RESUMEN RÁPIDO

**Ahora mismo:**
- ✅ testMode = true (anuncios de prueba funcionan)
- ✅ Logging mejorado
- ✅ Código listo para probar

**Para producción:**
1. Crear 2 bloques en AdMob (Rewarded + Interstitial)
2. Actualizar IDs en el código
3. testMode = false
4. Subir AAB a Play Store (versión 2)
5. Esperar 24-48 horas
6. Usuarios reales generarán ingresos

**Documentación completa:** `ADMOB_FIX_GUIA.md`

---

## VERIFICAR EN LOGCAT

```bash
adb logcat | grep -i admob
```

**Deberías ver:**
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

Revisa:
- Conexión a internet
- Permisos en AndroidManifest.xml
- google-services.json presente

---

## ARCHIVOS MODIFICADOS

- ✅ `src/lib/admob.ts` - testMode = true, IDs actualizados, logging mejorado
- ✅ `src/hooks/useAdMob.ts` - testMode = true por defecto

**NO modificados:**
- `android/app/src/main/AndroidManifest.xml` - Ya tiene el App ID correcto
- `android/app/google-services.json` - Ya tiene el App ID correcto

---

¡Prueba ahora con los IDs de prueba y verás que funciona! 🚀
