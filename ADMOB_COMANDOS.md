# Comandos de Instalación y Testing de AdMob

## 📦 INSTALACIÓN (Ejecutar en orden)

```bash
# 1. Instalar el plugin de AdMob
npm install @capacitor-community/admob

# 2. Build del proyecto
npm run build

# 3. Sincronizar con Android
npm run android:sync
```

---

## 🌐 PROBAR EN NAVEGADOR (Web - Simulado)

```bash
npm run dev
```

**Comportamiento:**
- Los anuncios se **simulan** (no se muestran reales)
- Las recompensas se otorgan después de 2 segundos
- Perfecto para probar la lógica sin compilar Android

---

## 📱 PROBAR EN ANDROID (Anuncios Reales de Prueba)

### Prerequisito: Configurar AndroidManifest.xml

Edita: `android/app/src/main/AndroidManifest.xml`

Agrega dentro de `<application>`:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-3940256099942544~3347511713"/>
```

### Comandos para Android:

```bash
# Build y sincronización
npm run build
npm run android:sync

# Abrir Android Studio
npm run android:open
```

En Android Studio:
1. Click en el botón verde "Run" (▶)
2. Selecciona tu dispositivo o emulador
3. Espera a que se instale la app
4. Prueba los anuncios

---

## 🔍 VER LOGS DE ANDROID

```bash
# Ver todos los logs de AdMob
adb logcat | grep AdMob

# O ver todos los logs
adb logcat
```

---

## 🧹 LIMPIAR BUILD (Si hay problemas)

```bash
# Limpiar Android
cd android && ./gradlew clean && cd ..

# Rebuild completo
npm run build
npm run android:sync
```

---

## 🚀 BUILD DE PRODUCCIÓN

### Para APK (Desarrollo/Testing)
```bash
npm run android:build
```

El APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

### Para AAB (Google Play Store)
```bash
npm run android:bundle
```

El AAB estará en: `android/app/build/outputs/bundle/release/app-release.aab`

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de publicar, verifica:

- [ ] AndroidManifest.xml tiene tu App ID real (no el de prueba)
- [ ] `testMode={false}` en todos los componentes que usan AdMob
- [ ] Los anuncios cargan correctamente en Android
- [ ] Las recompensas se otorgan (+1000 monedas)
- [ ] No hay crashes en logcat
- [ ] El contador de monedas se actualiza
- [ ] Los intersticiales aparecen cada 3 niveles

---

## 🆘 TROUBLESHOOTING

### Problema: "Module not found: @capacitor-community/admob"
```bash
npm install @capacitor-community/admob
npm run android:sync
```

### Problema: "Ad failed to load"
- Verifica conexión a internet
- Verifica que el App ID en AndroidManifest.xml sea correcto
- En modo prueba, usa: `ca-app-pub-3940256099942544~3347511713`

### Problema: Cambios no se reflejan en Android
```bash
npm run build
npm run android:sync
# Luego en Android Studio: Build > Clean Project > Rebuild Project
```

### Problema: "AdMob not initialized"
- Asegúrate de usar `useAdMob(true, testMode)` con `autoInitialize: true`
- O llama manualmente a `admobService.initialize(testMode)`

---

## 📋 IDs DE ADMOB

### IDs de Prueba (Google)
```typescript
App ID: ca-app-pub-3940256099942544~3347511713
Rewarded: ca-app-pub-3940256099942544/5224354917
Interstitial: ca-app-pub-3940256099942544/1033173712
```

### Tus IDs de Producción
```typescript
Rewarded: ca-app-pub-2140112688604592/7419668822
Interstitial: ca-app-pub-2140112688604592/5693128960
```

El código cambia automáticamente según `testMode`.

---

## 📚 ARCHIVOS CREADOS

- `src/lib/admob.ts` - Servicio principal
- `src/hooks/useAdMob.ts` - Hook de React
- `src/components/RewardedAdButton.tsx` - Componente de botón
- `ADMOB_INTEGRATION_GUIDE.md` - Guía completa
- `ADMOB_QUICK_START.md` - Inicio rápido
- `ADMOB_COINSHOP_EXAMPLE.md` - Ejemplo para tienda
- `ADMOB_COMANDOS.md` - Este archivo

---

**¡Usa estos comandos como referencia rápida!**
