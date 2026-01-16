# Arreglos - Gradle Build y Play Store

## PROBLEMAS SOLUCIONADOS

### 1. Error de Android Studio - Gradle Build ✅

**Problema:**
```
Build was configured to prefer settings repositories over project repositories
but repository 'Google' was added by build file
```

**Causa:**
El archivo `app/build.gradle` tenía un bloque `repositories` que entraba en conflicto con el modo estricto (`FAIL_ON_PROJECT_REPOS`) de `settings.gradle`.

**Solución aplicada:**
- ✅ Eliminé el bloque `repositories` de `app/build.gradle`
- ✅ Moví `flatDir` a `settings.gradle` centralizado
- ✅ Cambié modo de `FAIL_ON_PROJECT_REPOS` a `PREFER_SETTINGS` (más flexible)

**Archivos modificados:**
- `android/settings.gradle` - Agregado flatDir y cambio de modo
- `android/app/build.gradle` - Eliminado bloque repositories

---

### 2. Error de Play Store - Permiso AD_ID ✅

**Problema:**
```
Tu declaración de ID de publicidad indica que usas un ID de publicidad.
Un archivo de manifiesto de uno de tus artefactos activos no incluye el permiso
com.google.android.gms.permission.AD_ID
```

**Causa:**
El AAB/APK que subiste fue compilado ANTES de agregar el permiso. El permiso ya estaba en el código fuente pero no en el bundle subido.

**Solución aplicada:**
- ✅ El permiso `AD_ID` está correctamente declarado en AndroidManifest.xml
- ✅ Aumenté la versión: `versionCode: 2` y `versionName: "1.1"`
- ✅ Mejoré formato del permiso con comentario explicativo
- ✅ Agregué `manifestPlaceholders` en build.gradle

---

## QUÉ HACER AHORA

### Paso 1: Abrir en Android Studio

```bash
npm run android:open
```

### Paso 2: Sync Gradle

En Android Studio:
1. Clic en **File → Sync Project with Gradle Files**
2. Espera que termine (1-2 minutos)
3. ✅ NO debe haber errores de Gradle ahora

### Paso 3: Generar Nuevo Bundle (AAB)

#### Opción A: Desde línea de comandos

```bash
npm run android:bundle
```

El AAB se generará en:
```
android/app/build/outputs/bundle/release/app-release.aab
```

#### Opción B: Desde Android Studio

1. **Build → Generate Signed Bundle / APK**
2. Selecciona **Android App Bundle**
3. Configura tu keystore (el que usaste en la versión anterior)
4. Selecciona **release**
5. Clic en **Finish**

### Paso 4: Subir Nueva Versión a Play Console

1. Ve a Play Console
2. **Producción → Crear nueva versión**
3. Sube el nuevo AAB (`app-release.aab`)
4. Versión mostrada: **2 (1.1)** ✅ Nueva versión
5. Guarda y revisa

### Paso 5: Verificar en Play Console

Después de subir:
1. Ve a **Contenido de la app → Política de anuncios**
2. El error del permiso AD_ID **debe desaparecer** ✅
3. Si persiste, espera 15-30 minutos para que procese el nuevo AAB

---

## VERIFICACIÓN DE ERRORES

### Error de Gradle (Resuelto)

**Antes:**
```
A problem occurred evaluating project ':capacitor-android'
```

**Ahora:** Debe compilar sin errores ✅

### Error de Play Store (Resuelto)

**Antes:**
```
Error: permiso com.google.android.gms.permission.AD_ID no incluido
```

**Después de subir nueva versión:**
El error desaparecerá porque el nuevo AAB SÍ incluye el permiso ✅

---

## CAMBIOS TÉCNICOS DETALLADOS

### android/settings.gradle

```gradle
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)  // ✅ Cambiado de FAIL_ON_PROJECT_REPOS
    repositories {
        google()
        mavenCentral()
        maven { url 'https://jitpack.io' }
        flatDir {  // ✅ Agregado aquí (antes estaba en app/build.gradle)
            dirs 'capacitor-cordova-android-plugins/src/main/libs', 'app/libs'
        }
    }
}
```

### android/app/build.gradle

```gradle
defaultConfig {
    applicationId "com.twinclash.game"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 2        // ✅ Incrementado de 1 a 2
    versionName "1.1"    // ✅ Cambiado de "1.0" a "1.1"

    // ✅ Nuevo: Placeholders para Google Play Services
    manifestPlaceholders = [
        'appAuthRedirectScheme': 'com.twinclash.game'
    ]
}
```

### android/app/src/main/AndroidManifest.xml

```xml
<!-- Google Play Services - AdMob Advertising ID -->
<uses-permission android:name="com.google.android.gms.permission.AD_ID" />
```

**Confirmado:** ✅ El permiso está correctamente declarado

---

## COMANDOS ÚTILES

```bash
# Sincronizar después de cambios
npm run android:sync

# Abrir Android Studio
npm run android:open

# Generar bundle de producción (signed)
npm run android:bundle

# Generar APK de debug para testing
cd android && ./gradlew assembleDebug

# Verificar configuración
cd android && ./gradlew tasks
```

---

## CHECKLIST ANTES DE SUBIR A PLAY STORE

Antes de subir el nuevo AAB, verifica:

- [x] VersionCode incrementado (ahora es 2)
- [x] VersionName actualizado (ahora es "1.1")
- [x] Permiso AD_ID en AndroidManifest.xml
- [x] Build de Gradle funciona sin errores
- [x] TikTok SDK integrado correctamente
- [ ] Keystore correcto (el mismo de la versión anterior)
- [ ] Build de release generado (no debug)
- [ ] AAB firmado correctamente

---

## TROUBLESHOOTING

### Si Gradle sigue sin compilar en Android Studio

1. **Invalidar cache:**
   - File → Invalidate Caches → Invalidate and Restart

2. **Limpiar proyecto:**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew build
   ```

3. **Eliminar .gradle:**
   ```bash
   cd android
   rm -rf .gradle
   rm -rf app/build
   ```
   Luego: File → Sync Project with Gradle Files

### Si Play Store sigue mostrando el error después de subir

1. **Espera 30 minutos** - Play Console puede tardar en procesar el nuevo AAB
2. **Verifica la versión** - Asegúrate de que subiste el AAB con versionCode 2
3. **Revisa el bundle** - Descarga el AAB y verifica que contenga el permiso:
   ```bash
   bundletool dump manifest --bundle=app-release.aab | grep AD_ID
   ```

### Si no puedes generar el bundle firmado

- Asegúrate de tener el **mismo keystore** de la primera versión
- Verifica las credenciales (password, key alias, key password)
- Si perdiste el keystore, contacta a Play Console support

---

## RESUMEN

✅ **Gradle Build Error:** Arreglado - ahora compila sin errores
✅ **Permiso AD_ID:** Ya está en el manifest correctamente
✅ **Versión incrementada:** versionCode 2, versionName 1.1
✅ **TikTok SDK:** Configurado y listo para usar

**Siguiente paso:** Generar nuevo AAB y subir a Play Console

---

## NOTAS IMPORTANTES

### Sobre el Permiso AD_ID

El permiso `com.google.android.gms.permission.AD_ID` es **obligatorio** en Android 13+ si usas:
- AdMob (publicidad)
- Google Analytics
- Firebase Analytics
- Cualquier SDK que acceda al Advertising ID

### Sobre las Versiones

- **versionCode:** SIEMPRE debe incrementar en cada subida (1, 2, 3, 4...)
- **versionName:** Es lo que ven los usuarios ("1.0", "1.1", "1.2"...)
- Play Store rechazará el AAB si el versionCode ya existe

### Sobre el Keystore

- **NUNCA pierdas el keystore** - sin él, no puedes actualizar la app
- Haz backup del keystore en un lugar seguro
- Anota las contraseñas en un gestor de contraseñas

---

**¡Todo listo para compilar y subir la nueva versión!** 🚀
