# TikTok Business SDK - Configuración Completa

## ✅ CAMBIOS REALIZADOS

### 1. Gradle Configurado
- ✅ Repositorio JitPack agregado en `settings.gradle`
- ✅ Dependencias del SDK agregadas en `app/build.gradle`
- ✅ Java 1.8 configurado (compileOptions)
- ✅ Reglas ProGuard agregadas

### 2. Dependencias Instaladas
```gradle
// TikTok Business SDK
implementation 'com.github.tiktok:tiktok-business-android-sdk:1.5.0'

// Dependencias necesarias
implementation 'androidx.lifecycle:lifecycle-process:2.3.1'
implementation 'androidx.lifecycle:lifecycle-common-java8:2.3.1'
implementation 'com.android.installreferrer:installreferrer:2.2'
```

---

## 📱 PRÓXIMOS PASOS

### Paso 1: Inicializar el SDK

Necesitas inicializar el SDK en tu `MainActivity.java` o crear una clase Application personalizada.

#### Opción A: En MainActivity.java

Edita: `android/app/src/main/java/com/twinclash/game/MainActivity.java`

```java
package com.twinclash.game;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

// Importar TikTok SDK
import com.tiktok.TikTokBusinessSdk;
import com.tiktok.appevents.TTPIdentifyHandler;
import com.tiktok.util.TTConsentStatus;
import org.json.JSONObject;
import org.json.JSONException;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Inicializar TikTok SDK
        initTikTokSDK();
    }

    private void initTikTokSDK() {
        try {
            // Configuración del SDK
            JSONObject config = new JSONObject();
            config.put("app_id", "TU_TIKTOK_APP_ID"); // Reemplaza con tu App ID de TikTok
            config.put("tiktok_app_id", "TU_TIKTOK_APP_ID");

            // Inicializar SDK
            TikTokBusinessSdk.initialize(
                getApplicationContext(),
                config,
                true // true = modo debug, false = producción
            );

            // Configurar consentimiento (GDPR)
            TikTokBusinessSdk.setGDPR(TTConsentStatus.GRANTED);

            // Identificar usuario (opcional)
            TTPIdentifyHandler.identify(
                null, // external_id (opcional)
                null, // phone_number (opcional)
                null  // email (opcional)
            );

            System.out.println("TikTok SDK inicializado correctamente");

        } catch (JSONException e) {
            System.err.println("Error al inicializar TikTok SDK: " + e.getMessage());
        }
    }
}
```

#### Opción B: Crear Application Class (Recomendado)

1. Crea: `android/app/src/main/java/com/twinclash/game/TwinClashApplication.java`

```java
package com.twinclash.game;

import android.app.Application;
import com.tiktok.TikTokBusinessSdk;
import com.tiktok.util.TTConsentStatus;
import org.json.JSONObject;
import org.json.JSONException;

public class TwinClashApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        initTikTokSDK();
    }

    private void initTikTokSDK() {
        try {
            JSONObject config = new JSONObject();
            config.put("app_id", "TU_TIKTOK_APP_ID");
            config.put("tiktok_app_id", "TU_TIKTOK_APP_ID");

            TikTokBusinessSdk.initialize(
                getApplicationContext(),
                config,
                true // modo debug
            );

            TikTokBusinessSdk.setGDPR(TTConsentStatus.GRANTED);

            System.out.println("TikTok SDK inicializado en Application");

        } catch (JSONException e) {
            System.err.println("Error TikTok SDK: " + e.getMessage());
        }
    }
}
```

2. Registra la Application en `AndroidManifest.xml`:

```xml
<application
    android:name=".TwinClashApplication"
    android:label="@string/app_name"
    ...>
```

---

### Paso 2: Implementar Eventos

#### Eventos Básicos

```java
import com.tiktok.appevents.TTAppEventLogger;
import com.tiktok.appevents.TTPCommonConstants;
import org.json.JSONObject;

// 1. Evento de Compra
public void trackPurchase(String currency, double value, String contentId) {
    try {
        JSONObject properties = new JSONObject();
        properties.put(TTPCommonConstants.CURRENCY, currency); // "USD"
        properties.put(TTPCommonConstants.VALUE, value); // 9.99
        properties.put(TTPCommonConstants.CONTENT_ID, contentId); // "coins_pack_1000"
        properties.put(TTPCommonConstants.CONTENT_TYPE, "product");

        TTAppEventLogger.trackEvent("Purchase", properties);
    } catch (JSONException e) {
        e.printStackTrace();
    }
}

// 2. Evento de Registro
public void trackRegistration(String method) {
    try {
        JSONObject properties = new JSONObject();
        properties.put("registration_method", method); // "email", "google"

        TTAppEventLogger.trackEvent("CompleteRegistration", properties);
    } catch (JSONException e) {
        e.printStackTrace();
    }
}

// 3. Evento de Nivel Completado
public void trackLevelComplete(int level) {
    try {
        JSONObject properties = new JSONObject();
        properties.put("level", level);
        properties.put("success", true);

        TTAppEventLogger.trackEvent("AchieveLevel", properties);
    } catch (JSONException e) {
        e.printStackTrace();
    }
}

// 4. Evento de Vista de Contenido
public void trackContentView(String contentType, String contentId) {
    try {
        JSONObject properties = new JSONObject();
        properties.put(TTPCommonConstants.CONTENT_TYPE, contentType); // "level", "shop"
        properties.put(TTPCommonConstants.CONTENT_ID, contentId); // "level_1"

        TTAppEventLogger.trackEvent("ViewContent", properties);
    } catch (JSONException e) {
        e.printStackTrace();
    }
}

// 5. Evento Personalizado
public void trackCustomEvent(String eventName, JSONObject properties) {
    TTAppEventLogger.trackEvent(eventName, properties);
}
```

---

### Paso 3: Integración con Capacitor (JavaScript)

Puedes crear un plugin de Capacitor para llamar eventos desde tu código TypeScript/React.

#### Crear Plugin Native

1. Crea: `android/app/src/main/java/com/twinclash/game/TikTokPlugin.java`

```java
package com.twinclash.game;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.tiktok.appevents.TTAppEventLogger;
import org.json.JSONObject;

@CapacitorPlugin(name = "TikTokEvents")
public class TikTokPlugin extends Plugin {

    @PluginMethod
    public void trackEvent(PluginCall call) {
        String eventName = call.getString("eventName");
        JSObject properties = call.getObject("properties");

        if (eventName == null) {
            call.reject("Event name is required");
            return;
        }

        try {
            JSONObject jsonProperties = properties != null ?
                new JSONObject(properties.toString()) : new JSONObject();

            TTAppEventLogger.trackEvent(eventName, jsonProperties);
            call.resolve();
        } catch (Exception e) {
            call.reject("Error tracking event: " + e.getMessage());
        }
    }

    @PluginMethod
    public void trackPurchase(PluginCall call) {
        String currency = call.getString("currency", "USD");
        Double value = call.getDouble("value", 0.0);
        String contentId = call.getString("contentId");

        try {
            JSONObject properties = new JSONObject();
            properties.put("currency", currency);
            properties.put("value", value);
            properties.put("content_id", contentId);

            TTAppEventLogger.trackEvent("Purchase", properties);
            call.resolve();
        } catch (Exception e) {
            call.reject("Error tracking purchase: " + e.getMessage());
        }
    }
}
```

2. Registra el plugin en `MainActivity.java`:

```java
import com.twinclash.game.TikTokPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Registrar plugin TikTok
        registerPlugin(TikTokPlugin.class);
    }
}
```

#### Usar desde TypeScript/React

```typescript
// src/lib/tiktok.ts
import { Capacitor } from '@capacitor/core';

const TikTokEvents = Capacitor.Plugins.TikTokEvents;

export const trackTikTokEvent = async (eventName: string, properties?: any) => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[TikTok] Web platform - event not tracked:', eventName);
    return;
  }

  try {
    await TikTokEvents.trackEvent({ eventName, properties });
    console.log('[TikTok] Event tracked:', eventName);
  } catch (error) {
    console.error('[TikTok] Error tracking event:', error);
  }
};

export const trackTikTokPurchase = async (
  currency: string,
  value: number,
  contentId: string
) => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[TikTok] Web platform - purchase not tracked');
    return;
  }

  try {
    await TikTokEvents.trackPurchase({ currency, value, contentId });
    console.log('[TikTok] Purchase tracked:', contentId);
  } catch (error) {
    console.error('[TikTok] Error tracking purchase:', error);
  }
};

// Eventos específicos del juego
export const trackLevelComplete = (level: number) => {
  trackTikTokEvent('AchieveLevel', { level, success: true });
};

export const trackRegistration = (method: string) => {
  trackTikTokEvent('CompleteRegistration', { registration_method: method });
};

export const trackAdView = (adType: string) => {
  trackTikTokEvent('AdView', { ad_type: adType });
};
```

#### Ejemplo de Uso en React

```typescript
import { trackTikTokPurchase, trackLevelComplete } from './lib/tiktok';

// En tu componente de compra
const handlePurchase = async () => {
  // ... lógica de compra

  await trackTikTokPurchase('USD', 9.99, 'coins_pack_1000');
};

// Cuando el jugador completa un nivel
const onLevelComplete = async (level: number) => {
  // ... lógica del juego

  await trackLevelComplete(level);
};
```

---

## 🔑 OBTENER TU APP ID DE TIKTOK

1. Ve a [TikTok for Business](https://business.tiktok.com/)
2. Inicia sesión en tu cuenta
3. Ve a "Events Manager"
4. Selecciona tu app o crea una nueva
5. Copia el "App ID" (formato: números)
6. Reemplaza `TU_TIKTOK_APP_ID` en el código

---

## ✅ VERIFICAR QUE FUNCIONA

### En Android Studio - Logcat

```bash
# Filtrar logs de TikTok
adb logcat | grep -i tiktok

# Deberías ver:
# "TikTok SDK inicializado correctamente"
# "TikTok event tracked: Purchase"
```

### En TikTok Events Manager

1. Abre TikTok for Business
2. Ve a Events Manager
3. Selecciona tu app
4. Ve a "Test Events"
5. Los eventos deberían aparecer en tiempo real

---

## 📊 EVENTOS ESTÁNDAR RECOMENDADOS

Para campañas de TikTok, implementa estos eventos:

| Evento | Cuándo Usarlo |
|--------|---------------|
| `CompleteRegistration` | Usuario crea cuenta |
| `Purchase` | Compra completada (IAP) |
| `ViewContent` | Ver nivel, tienda, etc. |
| `AddToCart` | Agregar ítem al carrito |
| `InitiateCheckout` | Iniciar proceso de compra |
| `AchieveLevel` | Completar nivel |
| `UnlockAchievement` | Desbloquear logro |
| `SpendCredits` | Gastar monedas |

---

## 🔧 COMANDOS ÚTILES

```bash
# Sync después de cambios Gradle
npm run android:sync

# Abrir en Android Studio
npm run android:open

# Build de producción
npm run android:bundle

# Ver logs en tiempo real
adb logcat | grep -i tiktok
```

---

## ⚠️ NOTAS IMPORTANTES

### Consentimiento GDPR
- En producción, implementa un banner de consentimiento
- Solo llama `TikTokBusinessSdk.setGDPR(TTConsentStatus.GRANTED)` si el usuario acepta
- Para usuarios que rechazan: `TTConsentStatus.DENIED`

### Modo Debug vs Producción
```java
// Desarrollo (logs detallados)
TikTokBusinessSdk.initialize(context, config, true);

// Producción (sin logs)
TikTokBusinessSdk.initialize(context, config, false);
```

### Identificación de Usuarios
```java
// Al hacer login
TTPIdentifyHandler.identify(
    userId,           // Tu ID interno
    phoneNumber,      // Opcional (hash SHA256)
    email            // Opcional (hash SHA256)
);

// Al hacer logout
TTPIdentifyHandler.identify(null, null, null);
```

---

## 🆘 TROUBLESHOOTING

### Problema: SDK no inicializa
- Verifica que el App ID sea correcto
- Revisa los logs: `adb logcat | grep -i tiktok`
- Asegúrate de tener internet

### Problema: Eventos no aparecen en TikTok
- Espera 2-5 minutos (puede haber delay)
- Verifica que el App ID coincida con TikTok
- Usa modo debug para ver logs detallados
- Asegúrate de estar en "Test Events"

### Problema: Error de compilación
- Limpia: `cd android && ./gradlew clean && cd ..`
- Sync: `npm run android:sync`
- Rebuild en Android Studio

---

## 📱 CHECKLIST FINAL

Antes de publicar:

- [ ] TikTok App ID configurado (no test)
- [ ] SDK inicializado en Application o MainActivity
- [ ] Eventos implementados (mínimo: Purchase, CompleteRegistration)
- [ ] Plugin Capacitor creado y registrado
- [ ] Eventos probados en Test Events de TikTok
- [ ] Modo debug desactivado (`false` en initialize)
- [ ] Consentimiento GDPR implementado
- [ ] Build de producción funciona sin errores

---

## 🎯 RESUMEN

✅ **Gradle configurado** con todas las dependencias
✅ **ProGuard rules** agregadas
✅ **Java 1.8** configurado
✅ **JitPack repositorio** agregado

**Próximos pasos:**
1. Obtén tu TikTok App ID
2. Implementa el código de inicialización
3. Agrega eventos en tu app
4. Verifica en TikTok Events Manager
5. Lanza tu campaña

---

**¡Listo para rastrear eventos y optimizar tus campañas de TikTok!** 🚀
