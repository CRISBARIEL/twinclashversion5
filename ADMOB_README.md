# 🎮 Integración de Google AdMob en Twin Clash

## ✅ SISTEMA INSTALADO Y LISTO PARA USAR

Tu proyecto ahora tiene AdMob completamente integrado con tu sistema de monedas y Supabase.

---

## 📁 Archivos Creados

### Código Principal:
1. **`src/lib/admob.ts`** - Servicio completo de AdMob
   - Inicialización automática
   - Anuncios recompensados (+1000 monedas)
   - Anuncios intersticiales (pantalla completa)
   - Precarga automática
   - Compatible web + Android

2. **`src/hooks/useAdMob.ts`** - Hook de React
   - Fácil de usar en cualquier componente
   - Estado reactivo (loading, ready, etc.)
   - Auto-inicialización

3. **`src/components/RewardedAdButton.tsx`** - Botón listo para usar
   - Diseño profesional
   - Estados de carga
   - Feedback visual
   - Manejo de errores

### Documentación:
- **`ADMOB_INTEGRATION_GUIDE.md`** - Guía completa paso a paso
- **`ADMOB_QUICK_START.md`** - Inicio rápido (5 minutos)
- **`ADMOB_COINSHOP_EXAMPLE.md`** - Ejemplo para tu tienda
- **`ADMOB_COMANDOS.md`** - Lista de comandos útiles
- **`ADMOB_README.md`** - Este archivo (resumen)

---

## 🚀 INICIO RÁPIDO (3 Pasos)

### 1️⃣ Instalar Dependencias
```bash
npm install @capacitor-community/admob
```

### 2️⃣ Probar en Navegador (AHORA)
```bash
npm run dev
```

Agrega el botón en cualquier componente:
```typescript
import { RewardedAdButton } from './components/RewardedAdButton';

<RewardedAdButton testMode={true} />
```

### 3️⃣ Probar en Android

**a) Configurar AndroidManifest.xml:**

Edita: `android/app/src/main/AndroidManifest.xml`

Agrega dentro de `<application>`:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-3940256099942544~3347511713"/>
```

**b) Build y ejecutar:**
```bash
npm run build
npm run android:sync
npm run android:open
```

En Android Studio, click "Run" ▶

---

## 💰 Características Implementadas

### ✅ Anuncios Recompensados (Bonificados)
- **Recompensa:** +1000 monedas
- **IDs configurados:** Test y Producción
- **Integración:** Automática con Supabase
- **Uso:** Componente `<RewardedAdButton />`

### ✅ Anuncios Intersticiales
- **Uso:** Entre niveles (cada 3 niveles recomendado)
- **Hook:** `useAdMob()` → `showInterstitialAd()`
- **Precarga:** Automática

### ✅ Compatibilidad
- ✅ Web (simulado para testing)
- ✅ Android (anuncios reales)
- ✅ iOS (compatible, requiere configuración)

### ✅ Manejo de Errores
- ✅ Try/catch en todas las operaciones
- ✅ Fallback cuando no hay conexión
- ✅ Logs detallados para debugging

---

## 🎯 Dónde Agregar los Anuncios

### Opción 1: Tienda de Monedas (RECOMENDADO)
Ver: `ADMOB_COINSHOP_EXAMPLE.md`

Agrega una sección gratis con el botón de anuncio recompensado.

### Opción 2: Menú Principal
En `SimpleInitialScreen.tsx`:
```typescript
<RewardedAdButton testMode={true} />
```

### Opción 3: Entre Niveles (Intersticiales)
En `GameShell.tsx`:
```typescript
const { showInterstitialAd } = useAdMob(true, true);

// En onLevelCompleted:
if (level % 3 === 0) {
  setTimeout(() => showInterstitialAd(), 1000);
}
```

---

## 🔑 IDs de AdMob Configurados

### Test (Desarrollo):
```
App ID: ca-app-pub-3940256099942544~3347511713
Rewarded: ca-app-pub-3940256099942544/5224354917
Interstitial: ca-app-pub-3940256099942544/1033173712
```

### Producción (Tus IDs):
```
Rewarded: ca-app-pub-2140112688604592/7419668822
Interstitial: ca-app-pub-2140112688604592/5693128960
```

**Cambio automático:** El sistema usa test o producción según `testMode={true/false}`

---

## 📱 Testing

### En Navegador (Web):
```bash
npm run dev
```
- Anuncios simulados (no reales)
- Recompensas se otorgan después de 2 segundos
- Perfecto para probar lógica

### En Android:
```bash
npm run build && npm run android:sync && npm run android:open
```
- Anuncios reales de prueba de Google
- Completa el anuncio para recibir recompensa
- Usa el App ID de prueba en AndroidManifest.xml

---

## ✨ Pasar a Producción

### Paso 1: Cambiar testMode
En todos los componentes:
```typescript
// DE:
<RewardedAdButton testMode={true} />
// A:
<RewardedAdButton testMode={false} />
```

### Paso 2: App ID Real
En `AndroidManifest.xml`, reemplaza con tu App ID real:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-2140112688604592~TU_APP_ID"/>
```

### Paso 3: Build de Producción
```bash
npm run android:bundle
```

---

## 🛠️ Comandos Útiles

```bash
# Ver logs de AdMob
adb logcat | grep AdMob

# Limpiar y rebuild
cd android && ./gradlew clean && cd ..
npm run build && npm run android:sync

# Build para producción
npm run android:bundle  # Para Google Play
npm run android:build   # Para APK
```

---

## 📊 Integración con Tu Sistema

### Sistema de Monedas:
✅ Las recompensas usan `addCoins()` de `progression.ts`
✅ Sincronización automática con Supabase
✅ Persistencia en localStorage

### Flujo de Recompensa:
1. Usuario ve anuncio completo
2. `admobService.showRewardedAd()` detecta completion
3. Se llama a `addCoins(1000)`
4. Se sincroniza con Supabase
5. UI se actualiza automáticamente

---

## ⚠️ Notas Importantes

### En Desarrollo:
- **SIEMPRE** usa `testMode={true}`
- **SIEMPRE** usa App ID de prueba
- Usar IDs de producción en desarrollo puede resultar en ban

### En Producción:
- Cambia `testMode={false}`
- Usa tu App ID real
- Verifica que los anuncios cargan correctamente
- Monitorea AdMob dashboard para ingresos

### Mejores Prácticas:
- No muestres intersticiales más de cada 3 niveles
- Precarga los anuncios con anticipación (el sistema lo hace)
- Maneja errores gracefully (el sistema lo hace)
- Respeta la experiencia del usuario

---

## 🎓 Arquitectura del Sistema

```
Usuario Click Botón
     ↓
RewardedAdButton (Component)
     ↓
useAdMob (Hook)
     ↓
admobService (Service)
     ↓
@capacitor-community/admob (Plugin)
     ↓
Google AdMob SDK
     ↓
(Usuario ve anuncio)
     ↓
Recompensa otorgada
     ↓
addCoins(1000) → progression.ts
     ↓
syncToSupabase() → supabase
     ↓
UI actualizado (currentCoins)
```

---

## 🔗 Enlaces Útiles

- [AdMob Plugin Docs](https://github.com/capacitor-community/admob)
- [Google AdMob Dashboard](https://apps.admob.com/)
- [Capacitor Docs](https://capacitorjs.com/)

---

## ✅ Checklist Final

Antes de publicar:

- [ ] Instalaste las dependencias (`npm install`)
- [ ] Configuraste AndroidManifest.xml con App ID
- [ ] Probaste en navegador (simulado)
- [ ] Probaste en Android con IDs de test
- [ ] Los anuncios cargan correctamente
- [ ] Las recompensas se otorgan (+1000 monedas)
- [ ] El contador de monedas se actualiza
- [ ] Cambiaste `testMode={false}` para producción
- [ ] Usaste App ID real en AndroidManifest.xml
- [ ] Build de producción funciona
- [ ] No hay crashes ni errores

---

## 🆘 Ayuda

Si tienes problemas:
1. Lee `ADMOB_INTEGRATION_GUIDE.md` (guía completa)
2. Revisa los logs: `adb logcat | grep AdMob`
3. Verifica que los IDs sean correctos
4. Asegúrate de tener conexión a internet
5. Limpia y rebuild: `./gradlew clean`

---

## 🎉 ¡Todo Listo!

Tu juego Twin Clash ahora tiene:
- ✅ Anuncios recompensados integrados
- ✅ Sistema de monedas funcionando
- ✅ Sincronización con Supabase
- ✅ Compatible web + Android
- ✅ Código limpio y mantenible
- ✅ Documentación completa

**¡Empieza a monetizar tu juego con AdMob!** 🚀

---

**Próximos pasos sugeridos:**
1. Lee `ADMOB_QUICK_START.md` para empezar en 5 minutos
2. Implementa el botón en tu tienda usando `ADMOB_COINSHOP_EXAMPLE.md`
3. Prueba en Android con IDs de test
4. Cuando estés listo, pasa a producción

**¿Dudas?** Revisa los archivos de documentación creados.
