# AdMob - Inicio Rápido (5 minutos)

## Paso 1: Instalar Dependencias
```bash
npm install @capacitor-community/admob
```

## Paso 2: Probar en Navegador (AHORA MISMO)

Agrega el botón de anuncio recompensado en tu pantalla inicial.

### Editar `src/components/SimpleInitialScreen.tsx`

**Agregar al inicio del archivo:**
```typescript
import { RewardedAdButton } from './RewardedAdButton';
```

**Agregar el botón en el JSX (por ejemplo, debajo de las estadísticas):**
```typescript
{/* Agregar esto donde quieras el botón */}
<div className="mt-4">
  <RewardedAdButton
    testMode={true}
    onRewardGranted={(coins) => {
      console.log('Recibiste monedas! Total:', coins);
      // Opcional: actualizar el estado para refrescar el UI
      window.location.reload(); // Recarga para actualizar el contador
    }}
  />
</div>
```

## Paso 3: Probar Ahora
```bash
npm run dev
```

Abre el navegador y verás:
1. Botón "Ver Anuncio +1000"
2. Click en el botón
3. Espera 2 segundos (simulación)
4. Recibirás +1000 monedas automáticamente

**En el navegador los anuncios se simulan - no se muestran anuncios reales.**

---

## Paso 4: Probar en Android

### 4.1 Configurar AndroidManifest.xml

Edita: `android/app/src/main/AndroidManifest.xml`

Agrega dentro de `<application>`:
```xml
<!-- Usa este App ID de PRUEBA -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-3940256099942544~3347511713"/>
```

### 4.2 Build y Test
```bash
npm run build
npm run android:sync
npm run android:open
```

En Android Studio, click "Run" y verás anuncios reales de prueba de Google.

---

## Paso 5: Agregar Intersticiales (Opcional)

### En `src/components/GameShell.tsx`:

**Importar:**
```typescript
import { useAdMob } from '../hooks/useAdMob';
```

**Dentro del componente:**
```typescript
const { showInterstitialAd } = useAdMob(true, true);
```

**En la función `onLevelCompleted` (agregar después de línea ~100):**
```typescript
// Mostrar intersticial cada 3 niveles
if (level % 3 === 0) {
  setTimeout(() => {
    showInterstitialAd();
  }, 1000);
}
```

---

## Cambiar a IDs de Producción

Cuando estés listo para publicar:

1. **En tus componentes**, cambia `testMode={true}` a `testMode={false}`
2. **En AndroidManifest.xml**, usa tu App ID real de AdMob
3. Build de producción: `npm run android:bundle`

---

## IDs Configurados

Ya están en el código:

**Prueba (Test IDs):**
- Recompensado: `ca-app-pub-3940256099942544/5224354917`
- Intersticial: `ca-app-pub-3940256099942544/1033173712`

**Producción (Tus IDs):**
- Recompensado: `ca-app-pub-2140112688604592/7419668822`
- Intersticial: `ca-app-pub-2140112688604592/5693128960`

El sistema cambia automáticamente según `testMode`.

---

## Verificación Rápida

✅ Anuncios se simulan en navegador
✅ Recompensas se otorgan (+1000 monedas)
✅ Sistema integrado con Supabase
✅ Compatible con web y Android
✅ Manejo de errores incluido
✅ Precarga automática de anuncios

---

**¡Eso es todo! Lee `ADMOB_INTEGRATION_GUIDE.md` para más detalles.**
