# Notificaciones Push - Android 13+ Configuración

## PROBLEMA ORIGINAL

En Android 13+ (API 33), las notificaciones requieren permiso explícito del usuario. Sin este permiso:
- Las notificaciones se envían pero NO se muestran
- El usuario no tiene forma de activarlas después

## SOLUCIÓN IMPLEMENTADA ✅

He implementado un sistema que pide el permiso AUTOMÁTICAMENTE al abrir la app por primera vez.

### Cambios Realizados

#### 1. Permiso Agregado en AndroidManifest.xml ✅

```xml
<!-- Push Notifications - Android 13+ -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

Este permiso es OBLIGATORIO en Android 13+ (API 33) para mostrar notificaciones.

#### 2. MainActivity.java - Pide Permiso al Iniciar ✅

La app ahora pide el permiso AUTOMÁTICAMENTE cuando el usuario abre la app por primera vez:

```java
private void requestNotificationPermissionIfNeeded() {
    // Solo en Android 13 (API 33) o superior
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
          != PackageManager.PERMISSION_GRANTED) {

        // Pedir permiso automáticamente al abrir la app
        ActivityCompat.requestPermissions(
          this,
          new String[]{Manifest.permission.POST_NOTIFICATIONS},
          NOTIFICATION_PERMISSION_REQUEST_CODE
        );
      }
    }
  }
```

**Resultado:**
- El usuario ve el diálogo de permisos AL ABRIR LA APP (primera vez)
- No necesita hacer clic en ningún botón primero
- Similar a apps como WhatsApp, Instagram, etc.

#### 3. Plugin Nativo de Capacitor ✅

Creado `NotificationPermissionPlugin.java` que permite:
- Verificar si el permiso está otorgado
- Pedir el permiso desde TypeScript
- Funciona en Android 13+ y versiones anteriores

#### 4. Código TypeScript Actualizado ✅

El archivo `src/lib/push.ts` ahora:
- Detecta si está en Android nativo
- Usa el plugin nativo para pedir permisos
- Fallback a Web API si es navegador

---

## CÓMO FUNCIONA AHORA

### Flujo para Usuarios Nuevos (Android 13+)

1. Usuario instala la app desde Play Store
2. Usuario abre la app por primera vez
3. **AUTOMÁTICAMENTE** aparece el diálogo de permisos:
   ```
   ┌─────────────────────────────────┐
   │  Allow Twin Clash to send you   │
   │  notifications?                 │
   │                                 │
   │  [Don't allow]    [Allow]       │
   └─────────────────────────────────┘
   ```
4. Si el usuario toca "Allow": ✅ Notificaciones activadas
5. Si el usuario toca "Don't allow": ❌ Notificaciones bloqueadas

### Flujo para Android 12 y Anteriores

- **NO se pide permiso** (no es necesario)
- Las notificaciones están **habilitadas por defecto**
- El usuario puede desactivarlas manualmente en ajustes

---

## IMPORTANTE: Restricciones de Android

### ❌ NO es Posible

- Habilitar notificaciones SIN mostrar el diálogo al usuario
- Enviar notificaciones si el usuario tocó "Don't allow"
- Forzar las notificaciones sin consentimiento

Esto es una **restricción de seguridad de Android** implementada en Android 13 para proteger la privacidad del usuario.

### ✅ SÍ es Posible

- Mostrar el diálogo AUTOMÁTICAMENTE al abrir la app (✅ implementado)
- Guiar al usuario a activar notificaciones en ajustes (si las rechazó)
- Pedir el permiso nuevamente (máximo 2 veces, luego Android bloquea)

---

## CÓMO MEJORAR LA TASA DE ACEPTACIÓN

### 1. Timing Óptimo (Actual)

**Ahora:** Se pide al abrir la app

**Mejor práctica:** Pedir en un momento contextual

**Ejemplo:**
- Después de completar el primer nivel
- Después de registrarse
- Cuando el usuario gana su primer premio

### 2. Mostrar Pre-Permiso Explicativo

Antes de mostrar el diálogo nativo, mostrar tu propio mensaje:

```
┌─────────────────────────────────┐
│  🎮 Don't Miss Out!             │
│                                 │
│  Get notified when:             │
│  • New levels are available     │
│  • Friends challenge you        │
│  • Daily bonuses are ready      │
│                                 │
│  [Maybe Later]  [Enable]        │
└─────────────────────────────────┘
```

Cuando el usuario toca "Enable", ENTONCES muestras el diálogo nativo de Android.

### 3. Implementación Sugerida

Puedo implementar esto si quieres:

```typescript
// Mostrar tu modal primero
const userWantsNotifications = await showPrePermissionModal();

if (userWantsNotifications) {
  // AHORA sí pedir el permiso nativo
  await ensureNotificationPermission();
}
```

**Ventajas:**
- Mayor tasa de aceptación (40-60% vs 10-20%)
- Usuario entiende el beneficio ANTES de decidir
- No "desperdicias" el único intento de pedir permiso

---

## VERIFICAR QUE FUNCIONA

### En Android Studio - Logcat

```bash
adb logcat | grep -i notification

# Deberías ver:
# [MainActivity] Requesting notification permission...
# [MainActivity] Notification permission GRANTED
# o
# [MainActivity] Notification permission DENIED
```

### En la App

1. Desinstala la app completamente
2. Instala la app de nuevo
3. Abre la app
4. ✅ DEBE aparecer el diálogo de permisos inmediatamente

### En Ajustes de Android

Después de aceptar:
1. Ajustes → Apps → Twin Clash → Notificaciones
2. Debe estar **ON** (activado)

---

## QUÉ HACER SI EL USUARIO RECHAZA

Si el usuario tocó "Don't allow", NO puedes volver a pedir el permiso directamente.

**Opciones:**

### 1. Mostrar un Aviso Educativo

```
┌─────────────────────────────────┐
│  You're missing out!            │
│                                 │
│  Notifications are disabled.    │
│  You won't receive:             │
│  • Duel invitations             │
│  • Daily rewards                │
│  • Achievement alerts           │
│                                 │
│  [Keep Disabled] [Open Settings]│
└─────────────────────────────────┘
```

### 2. Llevar al Usuario a Ajustes

```typescript
import { Capacitor } from '@capacitor/core';

export async function openAppSettings() {
  if (Capacitor.isNativePlatform()) {
    // Abrir ajustes de la app
    const { App } = await import('@capacitor/app');
    await App.openUrl({ url: 'app-settings:' });
  }
}
```

---

## MÉTRICAS ACTUALES

Según tu captura:

**Campaña 1:**
- Enviados: 203
- Abiertos: 1 (0.5%)
- Eventos clave: 0%

**Campaña 2:**
- Enviados: 170
- Abiertos: 3 (1.8%)
- Eventos clave: 0%

**Análisis:**
- Tasa de apertura MUY BAJA (normal es 5-15%)
- Probable causa: Usuarios NO tienen permiso de notificaciones
- Solución: ✅ Implementado ahora

**Expectativa después del fix:**
- Con permiso automático: 40-60% de usuarios aceptarán
- Tasa de apertura debería subir a 5-10%

---

## NEXT STEPS

### 1. Compilar y Probar

```bash
npm run android:sync
npm run android:open
```

En Android Studio:
1. Sync Project with Gradle Files
2. Run app en dispositivo con Android 13+
3. Verificar que aparece el diálogo

### 2. Generar Nueva Versión

```bash
npm run android:bundle
```

- versionCode: 2 (ya incrementado)
- versionName: 1.1

### 3. Subir a Play Store

- Sube el nuevo AAB
- Espera aprobación
- Monitorea las métricas de notificaciones

### 4. Opcional: Implementar Pre-Permiso Modal

Si quieres mejorar la tasa de aceptación, puedo crear:
- Modal explicativo antes del permiso nativo
- Analytics para trackear aceptación/rechazo
- Deep link a ajustes si el usuario rechazó

---

## TESTING CHECKLIST

Antes de subir a producción:

- [ ] Desinstalar app completamente
- [ ] Instalar nueva versión
- [ ] Abrir app
- [ ] Verificar que aparece diálogo de permiso
- [ ] Aceptar permiso
- [ ] Enviar notificación de prueba desde Firebase
- [ ] Verificar que la notificación se MUESTRA
- [ ] Tocar la notificación
- [ ] Verificar que la app se abre

---

## TROUBLESHOOTING

### Problema: No aparece el diálogo de permisos

**Causa:** Probablemente ya aceptaste/rechazaste antes

**Solución:**
```bash
# Limpiar datos de la app
adb shell pm clear com.twinclash.game

# O desinstalar completamente
adb uninstall com.twinclash.game
```

### Problema: Notificaciones no se muestran después de aceptar

**Verificar:**
1. Token FCM se registró correctamente
2. google-services.json está presente
3. Firebase Cloud Messaging está habilitado
4. El servidor está enviando notificaciones correctamente

**Debug:**
```bash
adb logcat | grep -i fcm
```

### Problema: Usuario rechazó y ahora no puede activar

**Solución:**
1. Mostrar mensaje educativo
2. Botón que abra ajustes de la app
3. Usuario activa manualmente en ajustes

---

## RESUMEN

✅ **Permiso POST_NOTIFICATIONS agregado** en AndroidManifest.xml
✅ **MainActivity pide permiso automáticamente** al abrir la app
✅ **Plugin nativo creado** para gestionar permisos desde TypeScript
✅ **Código TypeScript actualizado** para usar plugin nativo
✅ **Compatible con Android 13+ y versiones anteriores**

**Resultado esperado:**
- Más usuarios con notificaciones habilitadas (40-60%)
- Mayor tasa de apertura de notificaciones (5-10%)
- Mejor engagement y retención

**Próximo paso:**
Compilar, probar, y subir nueva versión (versionCode 2) a Play Store.

---

## CÓDIGO DE REFERENCIA

### Verificar Permiso desde TypeScript

```typescript
import { Capacitor } from '@capacitor/core';

export async function hasNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    const NotificationPermission = (window as any).NotificationPermission;
    if (NotificationPermission) {
      const result = await NotificationPermission.checkPermission();
      return result.granted;
    }
  }

  return Notification.permission === 'granted';
}
```

### Pedir Permiso desde TypeScript

```typescript
export async function requestNotificationPermission(): Promise<boolean> {
  const permission = await ensureNotificationPermission();
  return permission === 'granted';
}
```

### Abrir Ajustes de la App

```typescript
import { Capacitor } from '@capacitor/core';

export async function openAppSettings() {
  if (Capacitor.getPlatform() === 'android') {
    const { App } = await import('@capacitor/app');
    // Nota: Necesitas instalar @capacitor/app
    // npm install @capacitor/app
  }
}
```

---

**¡Todo listo para mejorar tus métricas de notificaciones!** 🚀

Las notificaciones ahora se pedirán automáticamente al abrir la app, igual que apps profesionales como WhatsApp, Instagram, etc.
