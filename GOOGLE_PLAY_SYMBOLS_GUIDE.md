# Guía: Archivos de Desofuscación y Símbolos Nativos para Google Play

## Resumen

Google Play Console requiere dos tipos de archivos para apps en producción:

1. **Archivo de Mapping (ProGuard/R8)** - Para desofuscar código Java/Kotlin
2. **Símbolos Nativos** - Para depurar código nativo (NDK/C++)

Ya configuré tu proyecto para generar ambos archivos automáticamente.

---

## Cambios Realizados

### 1. Habilitado R8 y Optimización (`build.gradle`)

```gradle
buildTypes {
    release {
        minifyEnabled true              // Activa R8/ProGuard
        shrinkResources true            // Elimina recursos no usados
        proguardFiles ...

        ndk {
            debugSymbolLevel 'FULL'     // Genera símbolos nativos completos
        }
    }
}
```

### 2. Reglas ProGuard Completas (`proguard-rules.pro`)

Añadí reglas para:
- Capacitor/Cordova
- Firebase (Messaging, Analytics)
- AdMob
- Google Play Services
- TikTok SDK
- WebView/JavaScript Interface

---

## Cómo Generar los Archivos

### Opción 1: Bundle de Release (recomendado)

```bash
npm run android:bundle
```

### Opción 2: APK de Release

```bash
npm run android:build
```

---

## Ubicación de los Archivos Generados

Después de compilar, los archivos se generan en:

### 📄 Archivo de Mapping (ProGuard/R8)

**Ruta:**
```
android/app/build/outputs/mapping/release/mapping.txt
```

### 🔧 Símbolos Nativos

**Ruta:**
```
android/app/build/intermediates/merged_native_libs/release/out/lib/
```

Este contiene carpetas para cada arquitectura:
- `arm64-v8a/`
- `armeabi-v7a/`
- `x86/`
- `x86_64/`

---

## Cómo Subir los Archivos a Google Play Console

### Paso 1: Accede a Google Play Console

1. Ve a [https://play.google.com/console](https://play.google.com/console)
2. Selecciona tu app **TwinClash**
3. Ve a **Versiones > Producción** (o la pista donde subiste el AAB)

### Paso 2: Subir Archivo de Mapping

1. Haz clic en la versión que subiste (ej: Versión 28)
2. Busca la sección **"Archivos de desofuscación"**
3. Haz clic en **"Subir archivo de mapping de ProGuard"**
4. Selecciona el archivo: `android/app/build/outputs/mapping/release/mapping.txt`
5. Confirma la subida

### Paso 3: Subir Símbolos Nativos

1. En la misma pantalla de la versión
2. Busca la sección **"Símbolos de depuración nativos"**
3. Haz clic en **"Subir símbolos nativos"**
4. Necesitas comprimir la carpeta completa:

```bash
cd android/app/build/intermediates/merged_native_libs/release/out/
zip -r native-symbols.zip lib/
```

5. Sube el archivo `native-symbols.zip`
6. Confirma la subida

---

## Verificación

Una vez subidos los archivos:

1. Google Play procesará los archivos (puede tardar unos minutos)
2. Las advertencias amarillas desaparecerán
3. Verás un ✅ verde confirmando que los archivos están presentes

---

## Para Futuras Versiones

**IMPORTANTE:** Cada vez que subas una nueva versión del AAB/APK, debes subir los archivos correspondientes:

1. Compila la nueva versión
2. Localiza los nuevos archivos en `android/app/build/outputs/`
3. Súbelos a Google Play Console para esa versión específica

---

## Notas Adicionales

### ¿Por qué R8/ProGuard?

- **Reduce el tamaño** de la app (hasta 30-40% menos)
- **Ofusca el código** (más difícil de hacer ingeniería inversa)
- **Optimiza el rendimiento** (elimina código no usado)

### ¿Afectará a mi app?

No, las reglas de ProGuard que configuré protegen:
- Todos los plugins de Capacitor
- Firebase y sus servicios
- AdMob
- TikTok SDK
- JavaScript Interfaces (WebView)

### Debug vs Release

- **Debug:** Sin ofuscación, fácil de depurar
- **Release:** Con R8, optimizado, requiere mapping.txt para ver stack traces

---

## Troubleshooting

### Si la app crashea después de activar R8

1. Revisa los logs en Google Play Console
2. Usa el mapping.txt para desofuscar el stack trace
3. Añade reglas específicas a `proguard-rules.pro` si es necesario

### Si no encuentras los archivos

Asegúrate de compilar en modo **release**:

```bash
cd android
./gradlew bundleRelease
```

Los archivos solo se generan en compilaciones de release, no en debug.

---

## Resumen Rápido

```bash
# 1. Compilar versión de release
npm run android:bundle

# 2. Localizar archivos
# Mapping: android/app/build/outputs/mapping/release/mapping.txt
# Símbolos: android/app/build/intermediates/merged_native_libs/release/out/lib/

# 3. Comprimir símbolos nativos
cd android/app/build/intermediates/merged_native_libs/release/out/
zip -r native-symbols.zip lib/

# 4. Subir ambos archivos a Google Play Console
# Ve a tu versión > Archivos de desofuscación > Subir
```

---

Las advertencias desaparecerán después de subir estos archivos.
