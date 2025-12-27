# Push Notifications Debug Setup

## Cambios Realizados

Se ha añadido un sistema de debug para las notificaciones push que se ejecuta automáticamente al cargar la aplicación.

### Archivos Añadidos

**`src/lib/pushDebug.ts`**
- Función `iniciarNotificacionesPush()` con logs detallados
- Se ejecuta automáticamente al cargar la página
- Muestra el token FCM en consola para pruebas
- Registra el token en Supabase automáticamente

### Archivos Modificados

**`src/main.tsx`**
- Importa `iniciarNotificacionesPush` desde `pushDebug.ts`
- Reemplaza la llamada a `initializePushNotifications` por `iniciarNotificacionesPush`
- Se ejecuta automáticamente después de registrar el service worker

## Cómo Usar

### 1. Al Cargar la Aplicación

Cuando abras la aplicación en el navegador:

1. **Automáticamente** pedirá permiso para notificaciones
2. Si aceptas, verás estos logs en consola:
   ```
   [PUSH] 🔥 Iniciando configuración de notificaciones push...
   [PUSH] ✅ Permiso concedido
   [PUSH] 🎉 TOKEN OBTENIDO: [token largo aquí]
   [PUSH] ✅ Token guardado en Supabase correctamente
   ```

3. **Copia el token** que aparece en la consola

### 2. Probar Notificación en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a **Messaging** → **Send test message**
4. Pega el token que copiaste
5. Escribe un título y mensaje
6. Haz clic en **Test**

Deberías recibir la notificación en tu navegador.

### 3. Comprobar en Supabase

El token se guarda automáticamente en la tabla `push_tokens` con:
- `token`: El FCM token
- `platform`: "web"
- `locale`: El idioma del navegador (ej: "es-ES")
- `user_agent`: Información del navegador
- `device_info`: Detalles del dispositivo
- `last_seen`: Timestamp actual
- `updated_at`: Timestamp actual

## Logs que Verás

### Éxito Total:
```
[PUSH] SW registered: https://tu-dominio.com/
[PUSH] 🔥 Iniciando configuración de notificaciones push...
[PUSH] ✅ Permiso concedido
[PUSH] 🎉 TOKEN OBTENIDO: fGxK9-8HT2y...
Copia este token y úsalo para pruebas en Firebase Console
[PUSH] ✅ Token guardado en Supabase correctamente
```

### Usuario Rechaza Permiso:
```
[PUSH] 🔥 Iniciando configuración de notificaciones push...
[PUSH] ❌ Permiso denegado por el usuario
```

### Falta VAPID Key:
```
[PUSH] 🔥 Iniciando configuración de notificaciones push...
[PUSH] ✅ Permiso concedido
[PUSH] ❌ VITE_FIREBASE_VAPID_KEY no está configurada
```

### No se Obtiene Token:
```
[PUSH] 🔥 Iniciando configuración de notificaciones push...
[PUSH] ✅ Permiso concedido
[PUSH] ❌ No se pudo obtener el token (revisa VAPID key o service worker)
```

### Error al Guardar:
```
[PUSH] 🔥 Iniciando configuración de notificaciones push...
[PUSH] ✅ Permiso concedido
[PUSH] 🎉 TOKEN OBTENIDO: fGxK9-8HT2y...
[PUSH] ❌ Error al guardar token: [detalles del error]
```

## Desactivar Ejecución Automática

Si quieres controlar cuándo se pide permiso (por ejemplo, con un botón):

### En `src/main.tsx`:

**Comenta la ejecución automática:**
```typescript
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("[PUSH] SW registered:", reg.scope);

      // ⛔ Comenta esta línea:
      // await iniciarNotificacionesPush();
    } catch (e) {
      console.error("[PUSH] SW register failed:", e);
    }
  });
}
```

**Conecta a un botón:**
```typescript
// Al final de main.tsx o en tu componente
import { iniciarNotificacionesPush } from './lib/pushDebug';

// Ejemplo con un botón HTML
document.getElementById('btn-activar-push')?.addEventListener('click', () => {
  iniciarNotificacionesPush();
});

// O en un componente React:
<button onClick={() => iniciarNotificacionesPush()}>
  Activar Notificaciones
</button>
```

## Variables de Entorno Necesarias

Asegúrate de tener en tu `.env`:

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_VAPID_KEY=BIidQd...tu-vapid-key-larga...
```

## Estructura del Código

```typescript
// pushDebug.ts
export async function iniciarNotificacionesPush() {
  // 1. Verifica soporte del navegador
  // 2. Pide permiso (requestPermission)
  // 3. Obtiene token FCM (getToken con VAPID key)
  // 4. Muestra el token en consola
  // 5. Lo envía a tu backend (/.netlify/functions/register-push)
  // 6. El backend lo guarda en Supabase
}
```

## Compatibilidad con Código Existente

✅ No rompe nada existente
✅ `NotificationButton.tsx` sigue funcionando
✅ `push.ts` mantiene todas sus funciones
✅ Solo añade debugging automático

## Próximos Pasos

1. **Prueba en local**: `npm run dev`
2. **Abre la app en navegador**
3. **Acepta el permiso de notificaciones**
4. **Copia el token de la consola**
5. **Prueba enviando una notificación desde Firebase Console**

Si todo funciona, ya puedes usar el sistema de notificaciones normal de `NotificationButton.tsx` para producción.
