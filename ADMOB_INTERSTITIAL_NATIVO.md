# Integración de Anuncios Intersticiales Nativos con SDK de Google AdMob

## Resumen

Se ha implementado un plugin nativo personalizado para Android que utiliza directamente el SDK oficial de Google AdMob para anuncios intersticiales, siguiendo exactamente el patrón del manual oficial de Google.

## Arquitectura

### 1. Plugin Nativo de Android (`InterstitialAdPlugin.java`)

Implementación Java que sigue el manual oficial de Google:

**Características:**
- `InterstitialAd.load()` con `InterstitialAdLoadCallback`
- `FullScreenContentCallback` para manejar eventos del ciclo de vida
- `interstitialAd.show()` para mostrar el anuncio
- Modo test y producción con IDs configurables
- Eventos notificados a JavaScript: showed, dismissed, failedToShow, impression, clicked

**IDs de AdMob:**
```java
// Test
TEST_AD_UNIT_ID = "ca-app-pub-3940256099942544/1033173712"

// Producción
PRODUCTION_AD_UNIT_ID = "ca-app-pub-2140112688604592/1393094754"
```

**Métodos del Plugin:**
- `loadAd(options)` - Carga un anuncio intersticial
- `showAd()` - Muestra el anuncio cargado
- `isAdReady()` - Verifica si hay un anuncio listo
- `destroyAd()` - Destruye el anuncio actual

### 2. Puente TypeScript (`interstitialAdPlugin.ts`)

Interface de Capacitor que registra el plugin y proporciona tipos:

```typescript
export interface InterstitialAdPlugin {
  loadAd(options: { testMode: boolean }): Promise<{ success: boolean; message: string }>;
  showAd(): Promise<{ success: boolean; message: string }>;
  isAdReady(): Promise<{ ready: boolean }>;
  destroyAd(): Promise<{ success: boolean }>;
}
```

### 3. Servicio de Alto Nivel (`nativeInterstitial.ts`)

Gestiona la lógica de negocio:

**Características:**
- Inicialización automática
- Precarga de anuncios
- Recarga automática después de mostrar
- Sistema de cooldown (60s entre cargas)
- Listeners de eventos
- Simulación para modo web

**Métodos:**
```typescript
initialize(testMode: boolean)  // Inicializa el servicio
loadAd(): Promise<boolean>     // Carga un anuncio
showAd(): Promise<boolean>     // Muestra un anuncio
isReady(): Promise<boolean>    // Verifica si está listo
```

### 4. Hook de React (`useNativeInterstitial.ts`)

Hook personalizado para usar en componentes:

```typescript
const { initialized, isReady, showAd, loadAd, testMode } = useNativeInterstitial(
  true,  // autoInitialize
  false  // testMode
);
```

## Integración en el Juego

### Estrategia de Frecuencia

Los anuncios se muestran de manera no intrusiva:

**1. Después de completar niveles:**
- Se muestra cada 3 niveles completados (nivel 3, 6, 9, 12...)
- Solo si el anuncio está listo
- Antes de avanzar al siguiente nivel

```typescript
// En GameCore.tsx - Botón "Siguiente Nivel"
const shouldShowAd = activeLevel % 3 === 0 && activeLevel >= 3 && isInterstitialReady;

if (shouldShowAd) {
  await showInterstitialAd();
}
```

**2. Después de Game Over:**
- Se muestra cada 4 niveles (nivel 8, 12, 16...)
- Solo después del nivel 5
- Al hacer clic en "Reintentar"

```typescript
// En GameCore.tsx - Botón "Reintentar" (Game Over)
const shouldShowAd = activeLevel >= 5 && activeLevel % 4 === 0 && isInterstitialReady;

if (shouldShowAd) {
  await showInterstitialAd();
}
```

### Puntos de Integración

**App.tsx:**
```typescript
import { nativeInterstitialService } from './lib/nativeInterstitial';

useEffect(() => {
  // ...
  nativeInterstitialService.initialize(false); // false = modo producción
}, []);
```

**GameCore.tsx:**
```typescript
import { useNativeInterstitial } from '../hooks/useNativeInterstitial';

const { showAd: showInterstitialAd, isReady: isInterstitialReady } = useNativeInterstitial(true, false);

// Usar showInterstitialAd() en momentos estratégicos
```

## Ciclo de Vida del Anuncio

1. **Inicialización** - Al abrir la app
2. **Precarga** - El anuncio se carga en background
3. **Listo** - `isReady` = true cuando está cargado
4. **Mostrar** - Se muestra en pantalla completa
5. **Eventos:**
   - `showed` - El anuncio se mostró
   - `impression` - Se registró una impresión
   - `clicked` - Usuario hizo clic (opcional)
   - `dismissed` - Usuario cerró el anuncio
6. **Recarga automática** - Se precarga el siguiente anuncio

## Ventajas de esta Implementación

### vs Plugin de Capacitor existente:

1. **Control total del SDK nativo** - Acceso directo a todas las funcionalidades
2. **FullScreenContentCallback** - Todos los eventos del ciclo de vida
3. **Callbacks detallados** - onAdLoaded, onAdFailedToLoad con códigos de error
4. **Mejor debugging** - Logs nativos directos
5. **Personalización** - Fácil agregar lógica específica

### Funcionalidades:

- ✅ Carga asíncrona con callback
- ✅ Precarga automática
- ✅ Recarga después de mostrar
- ✅ Sistema de cooldown
- ✅ Eventos de impresión y clics
- ✅ Modo test y producción
- ✅ Simulación web
- ✅ Gestión de errores
- ✅ Integración no intrusiva

## Testing

### Modo Test (Anuncios de Google)

```typescript
// En App.tsx
nativeInterstitialService.initialize(true); // true = test mode
```

### Modo Producción (Anuncios Reales)

```typescript
// En App.tsx
nativeInterstitialService.initialize(false); // false = production
```

### Verificar en Logcat

```bash
adb logcat | grep InterstitialAdPlugin
```

**Logs esperados:**
```
[InterstitialAdPlugin] Loading interstitial ad... (testMode: false)
[InterstitialAdPlugin] Ad Unit ID: ca-app-pub-2140112688604592/1393094754
[InterstitialAdPlugin] ✅ Ad was loaded successfully
[InterstitialAdPlugin] Showing interstitial ad...
[InterstitialAdPlugin] Ad showed fullscreen content
[InterstitialAdPlugin] Ad recorded an impression
[InterstitialAdPlugin] Ad was dismissed
```

## Compilar y Probar

### 1. Build del proyecto

```bash
npm run build
```

### 2. Sincronizar con Android

```bash
npm run android:sync
```

### 3. Abrir en Android Studio

```bash
npm run android:open
```

### 4. Compilar APK

```bash
npm run android:build
```

### 5. Instalar en dispositivo

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Archivos Creados/Modificados

### Nuevos Archivos:

1. `android/app/src/main/java/com/twinclash/game/InterstitialAdPlugin.java`
   - Plugin nativo con SDK de Google

2. `src/lib/interstitialAdPlugin.ts`
   - Interface de Capacitor

3. `src/lib/interstitialAdPluginWeb.ts`
   - Implementación web (simulación)

4. `src/lib/nativeInterstitial.ts`
   - Servicio de alto nivel

5. `src/hooks/useNativeInterstitial.ts`
   - Hook de React

6. `ADMOB_INTERSTITIAL_NATIVO.md`
   - Esta documentación

### Archivos Modificados:

1. `android/app/src/main/java/com/twinclash/game/MainActivity.java`
   - Registrado `InterstitialAdPlugin`

2. `src/App.tsx`
   - Inicialización del servicio

3. `src/components/GameCore.tsx`
   - Integración en botones (Siguiente Nivel, Reintentar)

## Configuración de AdMob

### IDs Actuales:

**App ID (AndroidManifest.xml):**
```
ca-app-pub-2140112688604592~6170461480
```

**Ad Unit ID (Intersticial):**
```
ca-app-pub-2140112688604592/1393094754
```

### Crear Nuevo Ad Unit (Opcional)

Si quieres un Ad Unit específico para intersticiales:

1. Ve a [AdMob Console](https://apps.admob.com)
2. Selecciona tu app "Twin Clash"
3. Unidades de anuncios → Agregar unidad de anuncios
4. Selecciona "Intersticial"
5. Copia el ID generado
6. Actualiza `InterstitialAdPlugin.java`:

```java
private static final String PRODUCTION_AD_UNIT_ID = "ca-app-pub-XXXXXXXX/YYYYYYYYYY";
```

## Troubleshooting

### El anuncio no se carga

**Revisar:**
1. AdMob está inicializado en MainActivity
2. El Ad Unit ID es correcto
3. Internet está disponible
4. Revisa logcat para errores

**Comandos:**
```bash
adb logcat | grep -E "(InterstitialAd|AdMob)"
```

### El anuncio no se muestra

**Verificar:**
1. `isReady` es `true`
2. El anuncio fue cargado correctamente
3. No hay errores en `onAdFailedToLoad`

**Test:**
```typescript
const ready = await nativeInterstitialService.isReady();
console.log('Ad ready?', ready);
```

### Error de política de AdMob

Si ves errores tipo "Policy violation":
1. Asegúrate de usar IDs de test durante desarrollo
2. En producción, verifica que la app cumple políticas
3. Revisa que app-ads.txt esté configurado

### Anuncio no recarga después de mostrar

El servicio debería recargar automáticamente. Si no:

```typescript
// Forzar recarga manual
await nativeInterstitialService.loadAd();
```

## Prácticas Recomendadas

### 1. Frecuencia de Anuncios

- ✅ Cada 3-5 niveles completados
- ✅ Ocasionalmente después de game over
- ❌ No en cada nivel
- ❌ No interrumpir gameplay activo

### 2. UX

- ✅ Mostrar en transiciones naturales
- ✅ Verificar `isReady` antes de mostrar
- ✅ No bloquear UI si el ad falla
- ❌ No forzar anuncios continuos

### 3. Testing

- ✅ Usar test mode durante desarrollo
- ✅ Probar en dispositivo real
- ✅ Verificar logs en logcat
- ✅ Validar eventos (showed, dismissed, impression)

### 4. Producción

- ✅ Cambiar a production mode
- ✅ Verificar Ad Unit IDs
- ✅ Testear frecuencia de anuncios
- ✅ Monitorear métricas en AdMob Console

## Métricas en AdMob Console

Una vez en producción, revisa:

1. **Impresiones** - Cuántos anuncios se mostraron
2. **Tasa de clics (CTR)** - % de clics vs impresiones
3. **eCPM** - Ingresos por 1000 impresiones
4. **Fill rate** - % de solicitudes con anuncio disponible

**Acceso:**
https://apps.admob.com → Tu App → Intersticiales

## Diferencias con Implementación Anterior

### Plugin de Capacitor (@capacitor-community/admob):

```typescript
// Antes
await AdMob.prepareInterstitial({ adId: 'xxx' });
await AdMob.showInterstitial();
```

### Plugin Nativo Personalizado:

```typescript
// Ahora (más control y flexibilidad)
await InterstitialAdPlugin.loadAd({ testMode: false });
await InterstitialAdPlugin.showAd();

// Con callbacks y eventos completos
InterstitialAdPlugin.addListener('adEvent', (event) => {
  if (event.event === 'dismissed') {
    // Recargar siguiente anuncio
  }
});
```

## Próximos Pasos

1. ✅ Plugin nativo creado
2. ✅ Servicio TypeScript implementado
3. ✅ Hook de React creado
4. ✅ Integrado en GameCore
5. ✅ Inicializado en App
6. 🟡 Testing en dispositivo Android
7. 🟡 Ajustar frecuencia según métricas
8. 🟡 Monitorear AdMob Console
9. 🔲 Optimizar posicionamiento (opcional)
10. 🔲 A/B testing de frecuencia (opcional)

## Recursos

- [AdMob Android SDK](https://developers.google.com/admob/android/quick-start)
- [Intersticiales - Guía Oficial](https://developers.google.com/admob/android/interstitial)
- [Capacitor Plugin Development](https://capacitorjs.com/docs/plugins)
- [AdMob Console](https://apps.admob.com)

## Soporte

Para dudas o issues:
1. Revisa logs en logcat
2. Verifica IDs de AdMob
3. Consulta AdMob Console
4. Revisa esta documentación
