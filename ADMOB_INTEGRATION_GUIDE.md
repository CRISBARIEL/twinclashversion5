# Guía de Integración de Google AdMob en Twin Clash

## Proyecto: React + Vite + Capacitor

Esta guía te mostrará cómo integrar Google AdMob en tu juego Twin Clash de forma segura y profesional.

---

## 1. Instalación de Dependencias

Ejecuta estos comandos en la terminal (en la raíz del proyecto):

```bash
# Instalar el plugin de AdMob
npm install @capacitor-community/admob

# Sincronizar con Android (después de instalar)
npm run android:sync
```

---

## 2. Configuración de Android

### 2.1 Actualizar AndroidManifest.xml

Abre el archivo: `android/app/src/main/AndroidManifest.xml`

Agrega tu App ID de AdMob dentro de `<application>`:

```xml
<application>
    <!-- ... otras configuraciones ... -->

    <!-- AdMob App ID -->
    <meta-data
        android:name="com.google.android.gms.ads.APPLICATION_ID"
        android:value="ca-app-pub-2140112688604592~XXXXXX"/>

</application>
```

**NOTA**: Reemplaza `ca-app-pub-2140112688604592~XXXXXX` con tu App ID real de AdMob (lo encuentras en tu cuenta de AdMob).

Para testing, puedes usar este App ID de prueba:
```xml
android:value="ca-app-pub-3940256099942544~3347511713"
```

---

## 3. Archivos Creados

Ya se han creado estos archivos en tu proyecto:

### 3.1 Servicio de AdMob
- **Ubicación**: `src/lib/admob.ts`
- **Descripción**: Servicio singleton que maneja toda la lógica de AdMob

### 3.2 Hook de React
- **Ubicación**: `src/hooks/useAdMob.ts`
- **Descripción**: Hook personalizado para usar AdMob en componentes React

### 3.3 Componente de Botón
- **Ubicación**: `src/components/RewardedAdButton.tsx`
- **Descripción**: Botón listo para usar que muestra anuncios recompensados

---

## 4. Uso en tu Proyecto

### 4.1 Agregar Botón de Anuncio Recompensado

En cualquier componente donde quieras mostrar anuncios recompensados (por ejemplo, en la tienda o menú principal):

```typescript
import { RewardedAdButton } from './components/RewardedAdButton';

function Shop() {
  const handleRewardGranted = (totalCoins: number) => {
    console.log('Recompensa recibida! Total de monedas:', totalCoins);
    // Aquí puedes actualizar el UI, mostrar confetti, etc.
  };

  return (
    <div>
      <h2>Consigue Monedas Gratis</h2>

      <RewardedAdButton
        testMode={true}  // Cambiar a false para IDs de producción
        onRewardGranted={handleRewardGranted}
        onAdShown={() => console.log('Anuncio mostrado')}
        onAdFailed={() => console.log('Error al mostrar anuncio')}
      />
    </div>
  );
}
```

### 4.2 Mostrar Intersticiales Entre Niveles

En `src/components/GameShell.tsx`, agrega esto:

**Paso 1**: Importar el hook al inicio del archivo:
```typescript
import { useAdMob } from '../hooks/useAdMob';
```

**Paso 2**: Inicializar el hook dentro del componente:
```typescript
export const GameShell = ({ initialLevel, onBackToMenu, onShowWorldMap }: GameShellProps) => {
  // ... código existente ...

  // Agregar esto:
  const { showInterstitialAd } = useAdMob(true, true); // true = auto-init, true = test mode

  // ... resto del código ...
```

**Paso 3**: Modificar `onLevelCompleted` para mostrar intersticiales cada 3 niveles:

Busca la función `onLevelCompleted` (línea ~47) y agrega esto después de completar el nivel:

```typescript
const onLevelCompleted = useCallback(() => {
  // ... código existente de completado de nivel ...

  // AGREGAR ESTO: Mostrar intersticial cada 3 niveles
  if (level % 3 === 0) {
    console.log('[GameShell] Mostrando intersticial en nivel:', level);
    setTimeout(() => {
      showInterstitialAd().then(success => {
        console.log('[GameShell] Intersticial result:', success);
      });
    }, 1000); // Esperar 1 segundo después de completar el nivel
  }

  // ... resto del código existente ...
}, [level, showInterstitialAd]);
```

---

## 5. Configuración de IDs (Test vs Producción)

Los IDs están configurados en `src/lib/admob.ts`:

### IDs de Prueba (para desarrollo):
```typescript
const TEST_IDS = {
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
};
```

### IDs de Producción (tus IDs reales):
```typescript
const PRODUCTION_IDS = {
  rewarded: 'ca-app-pub-2140112688604592/7419668822',
  interstitial: 'ca-app-pub-2140112688604592/5693128960',
};
```

**Para cambiar entre test y producción:**
- En el componente que uses, cambia `testMode={true}` a `testMode={false}`

---

## 6. Probar en Navegador (Modo Simulado)

El sistema detecta automáticamente si estás en web o nativo:

```bash
npm run dev
```

En el navegador:
- Los anuncios se **simulan** (no se muestran anuncios reales)
- Las recompensas se otorgan después de 2 segundos
- Verás mensajes en la consola indicando "Simulating ad (web mode)"

---

## 7. Probar en Android

### 7.1 Build y Sincronización
```bash
npm run build
npm run android:sync
npm run android:open
```

### 7.2 En Android Studio
1. Conecta tu dispositivo Android o inicia un emulador
2. Click en "Run" (botón verde de play)
3. La app se instalará en tu dispositivo

### 7.3 Probar con IDs de Test
1. Asegúrate que `testMode={true}` esté en tus componentes
2. Los anuncios de prueba de Google se mostrarán
3. Puedes cerrarlos y recibir las recompensas

---

## 8. Pasar a Producción

### 8.1 Cambiar a IDs Reales

En todos los componentes donde uses AdMob, cambia:
```typescript
// DE ESTO:
<RewardedAdButton testMode={true} />
// O
const { showInterstitialAd } = useAdMob(true, true);

// A ESTO:
<RewardedAdButton testMode={false} />
// O
const { showInterstitialAd } = useAdMob(true, false);
```

### 8.2 Actualizar AndroidManifest.xml

Reemplaza el App ID de prueba con tu App ID real:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-2140112688604592~TU_APP_ID_REAL"/>
```

### 8.3 Build de Producción
```bash
npm run android:build  # Para APK
# O
npm run android:bundle  # Para AAB (Google Play)
```

---

## 9. Verificación de Funcionamiento

### Checklist:
- [ ] Anuncios de prueba funcionan en Android
- [ ] Recompensas se otorgan correctamente (+1000 monedas)
- [ ] Intersticiales aparecen cada 3 niveles
- [ ] El contador de monedas se actualiza en el UI
- [ ] Los anuncios se precargan correctamente
- [ ] No hay crashes o errores en logcat

### Comandos Útiles:
```bash
# Ver logs de Android
adb logcat | grep AdMob

# Limpiar build
cd android && ./gradlew clean && cd ..

# Rebuild completo
npm run build && npm run android:sync
```

---

## 10. Ejemplos Adicionales

### Ejemplo: Mostrar Anuncio Programáticamente

```typescript
import { admobService } from '../lib/admob';

async function showAdOnDemand() {
  // Inicializar si no lo está
  await admobService.initialize(true); // true = test mode

  // Mostrar recompensado
  const result = await admobService.showRewardedAd();
  if (result.rewarded) {
    console.log('Usuario recibió:', result.coins, 'monedas');
  }

  // O mostrar intersticial
  const success = await admobService.showInterstitialAd();
  console.log('Intersticial mostrado:', success);
}
```

### Ejemplo: Verificar si un Anuncio está Listo

```typescript
import { admobService } from '../lib/admob';

function MyComponent() {
  const isReady = admobService.isRewardedAdReady();

  return (
    <button disabled={!isReady}>
      {isReady ? 'Ver Anuncio' : 'Cargando...'}
    </button>
  );
}
```

---

## 11. Manejo de Errores Comunes

### Error: "Ad failed to load"
- **Causa**: No hay conexión a internet o el Ad Unit ID es incorrecto
- **Solución**: Verifica tu conexión y los IDs en `admob.ts`

### Error: "AdMob not initialized"
- **Causa**: Intentas mostrar un anuncio antes de inicializar
- **Solución**: Usa `useAdMob(true, testMode)` con autoInitialize en `true`

### Los anuncios no se precargan
- **Causa**: Error de red o problema con los Ad Unit IDs
- **Solución**: Revisa los logs con `adb logcat | grep AdMob`

### Recompensas no se otorgan
- **Causa**: Usuario cerró el anuncio antes de completarlo
- **Solución**: Solo se otorgan si el usuario ve el anuncio completo (esto es correcto)

---

## 12. Mejores Prácticas

1. **Siempre usa IDs de prueba durante desarrollo** - Usar IDs de producción en desarrollo puede resultar en ban de tu cuenta
2. **Precarga los anuncios** - El sistema ya lo hace automáticamente
3. **No abuses de los intersticiales** - Cada 3-5 niveles es razonable
4. **Maneja errores gracefully** - El usuario no debe ver crashes si un anuncio falla
5. **Respeta la experiencia del usuario** - No muestres anuncios en momentos críticos del juego

---

## 13. Sistema de Monedas

Las recompensas se integran automáticamente con tu sistema existente en `src/lib/progression.ts`:

- **+1000 monedas** por anuncio recompensado completado
- Las monedas se sincronizan automáticamente con Supabase
- Se guardan en localStorage para persistencia local

---

## ¿Necesitas Ayuda?

- Revisa los logs en la consola del navegador (web) o logcat (Android)
- Todos los servicios tienen logging detallado con el prefijo `[AdMob]`
- Verifica que tu proyecto de AdMob en Google esté activo y los Ad Units creados

---

**¡Listo! Tu juego Twin Clash ahora tiene anuncios de AdMob integrados de forma profesional.**
