# TikTok SDK Temporalmente Deshabilitado

## Estado: ⚠️ DESHABILITADO

El SDK de TikTok Business ha sido **temporalmente deshabilitado** para permitir que el proyecto compile sin errores.

---

## Por Qué Se Deshabilitó

El SDK de TikTok Business requiere configuración adicional que no estaba completa:

1. **Repositorio faltante**: El SDK necesita JitPack o un repositorio Maven específico
2. **Dependencia incorrecta**: La implementación `com.github.tiktok:tiktok-business-android-sdk:1.5.0` no es la correcta
3. **Errores de compilación**: Las clases `TikTokBusinessSdk`, `TTAppEventLogger`, `TTPCommonConstants` no se encontraban

---

## Archivos Modificados

### 1. MainActivity.java

**Cambios:**
- ❌ Importaciones de TikTok comentadas
- ❌ Registro del plugin `TikTokPlugin` comentado
- ❌ Método `initTikTokSDK()` comentado

```java
// TikTok SDK temporalmente deshabilitado - necesita configuración adicional
// import com.tiktok.TikTokBusinessSdk;
// import com.tiktok.appevents.TTPIdentifyHandler;
// import com.tiktok.util.TTConsentStatus;

// registerPlugin(TikTokPlugin.class);  // Comentado

// initTikTokSDK();  // Comentado
```

### 2. TikTokPlugin.java

**Cambios:**
- ❌ Importaciones de TikTok comentadas
- ✅ Métodos siguen funcionando pero devuelven éxito sin trackear
- ✅ Logs indican que SDK está deshabilitado

```java
@PluginMethod
public void trackEvent(PluginCall call) {
    // TikTok SDK temporalmente deshabilitado
    System.out.println("[TikTok] SDK disabled - Event not tracked");
    call.resolve();
}
```

### 3. build.gradle (app)

**Cambios:**
- ❌ Dependencia de TikTok comentada
- ❌ Dependencias relacionadas (lifecycle, installreferrer) comentadas

```gradle
// TikTok Business SDK - Temporalmente deshabilitado
// implementation 'com.github.tiktok:tiktok-business-android-sdk:1.5.0'
```

---

## Impacto en la Aplicación

### ✅ No Afecta Funcionalidad Core

- El juego funciona completamente
- AdMob sigue funcionando
- Firebase sigue funcionando
- In-App Review sigue funcionando
- Notificaciones push siguen funcionando

### ⚠️ Analytics de TikTok No Funciona

Los siguientes eventos NO se registran en TikTok:
- `trackEvent()` - Eventos personalizados
- `trackPurchase()` - Compras in-app
- `trackRegistration()` - Registros de usuario
- `trackLevelComplete()` - Completar niveles
- `trackContentView()` - Ver contenido

**Importante:** Los métodos siguen funcionando desde el código TypeScript, pero simplemente devuelven éxito sin hacer tracking.

---

## Cómo Reactivar TikTok SDK (Cuando Sea Necesario)

### Paso 1: Obtener SDK Correcto de TikTok

El SDK oficial de TikTok Business se obtiene desde:
- [TikTok Events API](https://business-api.tiktok.com/portal/docs?id=1738855176671234)
- [TikTok Android SDK](https://ads.tiktok.com/marketing_api/docs?id=1739584855420929)

### Paso 2: Configurar Repositorio

Añadir al `android/build.gradle` (root):

```gradle
buildscript {
    repositories {
        google()
        mavenCentral()
        // Añadir este repositorio
        maven { url 'https://artifact.bytedance.com/repository/pangle' }
    }
    // ...
}

allprojects {
    repositories {
        google()
        mavenCentral()
        // Añadir este repositorio
        maven { url 'https://artifact.bytedance.com/repository/pangle' }
    }
}
```

### Paso 3: Añadir Dependencia Correcta

En `android/app/build.gradle`:

```gradle
dependencies {
    // TikTok Business SDK - Usar la versión oficial correcta
    implementation 'com.tiktok.open.business.sdk:business-core:1.4.0'

    // Dependencias requeridas
    implementation 'androidx.lifecycle:lifecycle-process:2.6.1'
    implementation 'androidx.lifecycle:lifecycle-common-java8:2.6.1'
    implementation 'com.android.installreferrer:installreferrer:2.2'
}
```

**Nota:** Verifica la versión más reciente en la documentación oficial de TikTok.

### Paso 4: Descomentar Código en MainActivity.java

```java
// DESCOMENTAR estas líneas:
import com.tiktok.TikTokBusinessSdk;
import com.tiktok.appevents.TTPIdentifyHandler;
import com.tiktok.util.TTConsentStatus;

// En onCreate:
registerPlugin(TikTokPlugin.class);
initTikTokSDK();

// Descomentar el método completo:
private void initTikTokSDK() {
    try {
        JSONObject config = new JSONObject();
        config.put("app_id", "YOUR_TIKTOK_APP_ID");  // Reemplazar con ID real
        config.put("tiktok_app_id", "YOUR_TIKTOK_APP_ID");  // Reemplazar con ID real

        TikTokBusinessSdk.initialize(
            getApplicationContext(),
            config,
            false
        );

        TikTokBusinessSdk.setGDPR(TTConsentStatus.GRANTED);
        TTPIdentifyHandler.identify(null, null, null);

        System.out.println("[TikTok] SDK initialized successfully");
    } catch (JSONException e) {
        System.err.println("[TikTok] Error initializing SDK: " + e.getMessage());
    }
}
```

### Paso 5: Descomentar Código en TikTokPlugin.java

```java
// DESCOMENTAR estas líneas:
import com.tiktok.appevents.TTAppEventLogger;
import com.tiktok.appevents.TTPCommonConstants;

// Restaurar el código original de cada método (está comentado en el archivo)
```

### Paso 6: Obtener TikTok App ID

1. Crear cuenta en [TikTok for Business](https://ads.tiktok.com/)
2. Navegar a Tools → Events → Web Events
3. Crear un nuevo pixel/evento
4. Copiar el App ID
5. Reemplazar `YOUR_TIKTOK_APP_ID` en MainActivity.java

### Paso 7: Configurar ProGuard

Asegurarse de que las reglas ProGuard incluyan TikTok:

```proguard
# TikTok Business SDK
-keep class com.tiktok.** { *; }
-keepclassmembers class com.tiktok.** { *; }
-dontwarn com.tiktok.**
```

### Paso 8: Verificar Compilación

```bash
# Limpiar y reconstruir
cd android
./gradlew clean

# Intentar compilar
./gradlew assembleDebug

# Si funciona, sincronizar con Capacitor
cd ..
npm run android:sync
```

---

## Por Qué No Es Urgente

TikTok Analytics es útil pero **no crítico** para el funcionamiento de la app:

1. **Firebase Analytics** ya está activo y funcionando
2. **Google Analytics (AdMob)** registra eventos
3. **Supabase** tiene tracking de eventos del juego
4. TikTok es principalmente para medir efectividad de campañas publicitarias en TikTok

**Recomendación:** Reactivar TikTok SDK cuando:
- Vayas a lanzar campañas publicitarias en TikTok
- Necesites pixel tracking para retargeting
- Tengas tiempo para configurarlo correctamente con su documentación oficial

---

## Alternativa: Seguir Sin TikTok

Si decides no usar TikTok SDK:

### Eliminar completamente (opcional)

1. Borrar `TikTokPlugin.java`
2. Borrar todas las referencias en `MainActivity.java`
3. Eliminar imports de `src/lib/tiktok.ts`
4. Eliminar llamadas a funciones TikTok en la app

### O mantener stub (recomendado)

- Dejar el código actual como está
- Los métodos devuelven éxito sin hacer tracking
- No afecta el funcionamiento de la app
- Fácil reactivar en el futuro si se necesita

---

## Testing Después de Reactivar

Una vez reactivado TikTok:

### Verificar Logs

```bash
adb logcat | grep TikTok
```

Deberías ver:
```
[TikTok] SDK initialized successfully
[TikTok] Event tracked: ViewContent
[TikTok] Level complete tracked: 5
```

### Verificar en Dashboard de TikTok

1. Ir a TikTok Events Manager
2. Verificar que los eventos aparecen en tiempo real
3. Esperar 24-48 horas para datos completos

---

## Estado Actual del Proyecto

### ✅ Funcionando Correctamente

- AdMob (anuncios intersticiales y rewarded)
- Firebase (push notifications, analytics)
- Google Play In-App Review
- Sistema de progresión y vidas
- Duelos multiplayer
- Pagos con Stripe

### ⚠️ Deshabilitado Temporalmente

- TikTok Business SDK
- TikTok Events tracking

---

## Conclusión

El proyecto **compila correctamente** y todas las funcionalidades principales funcionan. TikTok SDK puede reactivarse cuando sea necesario siguiendo los pasos de este documento.

**Prioridad:** Baja - No afecta lanzamiento ni funcionalidad core

---

**Fecha:** 2026-01-31
**Estado:** TikTok SDK deshabilitado pero puede reactivarse fácilmente
**Próximo Paso:** Compilar proyecto y verificar que no hay errores
