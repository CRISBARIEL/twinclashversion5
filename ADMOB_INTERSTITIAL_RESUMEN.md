# Resumen: Anuncios Intersticiales Nativos - Twin Clash

## Implementación Completada

Se ha integrado anuncios intersticiales de AdMob usando el SDK nativo de Android, siguiendo el manual oficial de Google.

## Archivos Creados

### Android (Plugin Nativo)
```
android/app/src/main/java/com/twinclash/game/InterstitialAdPlugin.java
```
- Plugin nativo con `InterstitialAd.load()`, `FullScreenContentCallback`, `interstitialAd.show()`
- IDs: Test `ca-app-pub-3940256099942544/1033173712` / Producción `ca-app-pub-2140112688604592/1393094754`

### TypeScript
```
src/lib/interstitialAdPlugin.ts          # Interface de Capacitor
src/lib/interstitialAdPluginWeb.ts       # Simulación web
src/lib/nativeInterstitial.ts            # Servicio de alto nivel
src/hooks/useNativeInterstitial.ts       # Hook de React
```

### Documentación
```
ADMOB_INTERSTITIAL_NATIVO.md            # Documentación completa
ADMOB_INTERSTITIAL_RESUMEN.md           # Este archivo
```

## Archivos Modificados

### Android
```
android/app/src/main/java/com/twinclash/game/MainActivity.java
```
- Registrado `InterstitialAdPlugin` en onCreate

### React
```
src/App.tsx
```
- Inicializa `nativeInterstitialService.initialize(false)` al abrir la app

```
src/components/GameCore.tsx
```
- Importa `useNativeInterstitial`
- Muestra ad cada 3 niveles completados (botón "Siguiente Nivel")
- Muestra ad cada 4 niveles en game over (botón "Reintentar")

## Estrategia de Frecuencia

### Completar Nivel
```typescript
// Se muestra en niveles: 3, 6, 9, 12, 15...
const shouldShowAd = activeLevel % 3 === 0 && activeLevel >= 3 && isInterstitialReady;
```

### Game Over (Reintentar)
```typescript
// Se muestra en niveles: 8, 12, 16, 20...
const shouldShowAd = activeLevel >= 5 && activeLevel % 4 === 0 && isInterstitialReady;
```

## Flujo de Funcionamiento

1. **App se abre** → `nativeInterstitialService.initialize(false)`
2. **Precarga automática** → Anuncio se carga en background
3. **Usuario completa nivel 3** → Muestra anuncio antes de avanzar
4. **Usuario cierra anuncio** → Precarga el siguiente automáticamente
5. **Usuario completa nivel 6** → Muestra anuncio nuevamente
6. **Repite cada 3 niveles**

## Comandos para Probar

### Build Web
```bash
npm run build
npm run preview
# Abre http://localhost:4173
# Verás simulación de anuncios en consola
```

### Build Android
```bash
# 1. Build + Sync
npm run android:sync

# 2. Abrir Android Studio
npm run android:open

# 3. O compilar APK directamente
npm run android:build

# 4. Instalar en dispositivo
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Ver Logs
```bash
adb logcat | grep InterstitialAdPlugin
```

**Logs esperados:**
```
[InterstitialAdPlugin] Loading interstitial ad... (testMode: false)
[InterstitialAdPlugin] ✅ Ad was loaded successfully
[InterstitialAdPlugin] Showing interstitial ad...
[InterstitialAdPlugin] Ad showed fullscreen content
[InterstitialAdPlugin] Ad recorded an impression
[InterstitialAdPlugin] Ad was dismissed
```

## Testing

### Modo Test (Anuncios de Google)
En `src/App.tsx`:
```typescript
nativeInterstitialService.initialize(true);  // true = test mode
```

### Modo Producción (Anuncios Reales)
En `src/App.tsx`:
```typescript
nativeInterstitialService.initialize(false);  // false = production
```

## Diferencias vs Plugin Anterior

### Antes (@capacitor-community/admob)
- Plugin de Capacitor con abstracción
- Menos control sobre callbacks
- Menos eventos del ciclo de vida

### Ahora (SDK Nativo)
- Control total del SDK de Google
- Todos los callbacks: onAdLoaded, onAdFailedToLoad, FullScreenContentCallback
- Eventos completos: showed, dismissed, impression, clicked, failedToShow
- Mejor debugging con logs nativos
- Fácil personalización

## Ventajas

✅ **Implementación oficial** - Sigue el manual de Google al pie de la letra
✅ **Control total** - Acceso directo al SDK nativo
✅ **Callbacks completos** - Todos los eventos del ciclo de vida
✅ **Precarga automática** - Anuncios listos cuando se necesitan
✅ **Recarga automática** - Se precarga después de mostrar
✅ **Sistema de cooldown** - Evita sobrecargar AdMob
✅ **No intrusivo** - Solo en transiciones naturales
✅ **Modo test/producción** - Fácil cambiar entre modos
✅ **Simulación web** - Funciona en desarrollo local

## Estructura de Código

```
Plugin Nativo (Java)
    ↓
Interface Capacitor (TS)
    ↓
Servicio (nativeInterstitial.ts)
    ↓
Hook React (useNativeInterstitial)
    ↓
Componente (GameCore.tsx)
```

## IDs de AdMob

### App ID
```
ca-app-pub-2140112688604592~6170461480
```
Configurado en `AndroidManifest.xml`

### Ad Unit ID (Intersticial)
```
ca-app-pub-2140112688604592/1393094754
```
Configurado en `InterstitialAdPlugin.java`

### Test Ad Unit ID
```
ca-app-pub-3940256099942544/1033173712
```
ID de prueba de Google (para desarrollo)

## Monitoreo

### AdMob Console
https://apps.admob.com

**Métricas a revisar:**
- Impresiones
- Tasa de clics (CTR)
- eCPM (ingresos por 1000 impresiones)
- Fill rate (% de solicitudes exitosas)

### Logcat (Android)
```bash
adb logcat | grep -E "(InterstitialAdPlugin|NativeInterstitial)"
```

## Troubleshooting Rápido

### ❌ Anuncio no se carga
1. Verifica internet
2. Revisa logcat para errores
3. Confirma Ad Unit ID
4. Prueba con test mode

### ❌ Anuncio no se muestra
1. Verifica que `isReady` sea `true`
2. Espera a que precargue
3. Revisa logs de AdMob

### ❌ Build falla
1. `npm run build` primero
2. `npm run android:sync`
3. Limpia cache: `cd android && ./gradlew clean`

## Próximos Pasos

1. ✅ Implementación completa
2. 🟡 **Testing en dispositivo Android real**
3. 🟡 **Verificar anuncios en logcat**
4. 🟡 **Ajustar frecuencia si es necesario**
5. 🟡 **Monitorear métricas en AdMob Console**
6. 🔲 Optimizar según datos (opcional)

## Checklist de Deploy

Antes de subir a producción:

- [ ] Cambiar a modo producción: `initialize(false)`
- [ ] Verificar Ad Unit IDs en `InterstitialAdPlugin.java`
- [ ] Build con `npm run android:build`
- [ ] Testear en dispositivo real
- [ ] Verificar anuncios se muestran correctamente
- [ ] Confirmar logs en logcat
- [ ] Monitorear métricas en AdMob Console
- [ ] Validar frecuencia no es intrusiva

## Contacto

Para ver detalles completos, consulta:
- `ADMOB_INTERSTITIAL_NATIVO.md` - Documentación detallada
- `InterstitialAdPlugin.java` - Código nativo
- `nativeInterstitial.ts` - Servicio TypeScript
- `GameCore.tsx` - Integración en el juego

## Comando Rápido

```bash
# Build completo y sync con Android
npm run build && npm run android:sync

# Abrir en Android Studio
npm run android:open

# O compilar APK
npm run android:build
```

¡Listo para probar! 🚀
