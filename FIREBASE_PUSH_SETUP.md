# 🔔 Firebase Cloud Messaging (FCM) - Configuración Completa

## ✅ ¿Qué se ha instalado?

La integración de notificaciones push web con Firebase Cloud Messaging está **completamente implementada y lista** en tu proyecto. Solo falta un paso final de configuración.

### **Componentes instalados:**

1. ✅ **Scripts de Firebase en `index.html`**
   - Firebase App SDK (compat version)
   - Firebase Messaging SDK (compat version)

2. ✅ **Service Worker: `public/firebase-messaging-sw.js`**
   - Maneja notificaciones en background (cuando la web está cerrada o en segundo plano)
   - Configurado con tu proyecto Firebase `twinclash-c6eac`
   - Iconos configurados para usar `/twinlogo.png`

3. ✅ **Módulo Firebase: `src/lib/firebase.ts`**
   - Inicialización de Firebase
   - Función para solicitar permisos de notificaciones
   - Manejo de mensajes en foreground (cuando la web está abierta)
   - Guardado automático de tokens en Supabase

4. ✅ **Tabla Supabase: `fcm_tokens`**
   - Almacena los tokens FCM de cada usuario
   - RLS habilitado para seguridad
   - Se actualiza automáticamente cuando cambia el token

5. ✅ **Botón de notificaciones en pantalla principal**
   - Componente `NotificationButton` agregado al menú principal
   - Permite a los usuarios activar/desactivar notificaciones voluntariamente
   - Estados visuales claros (activado, desactivado, bloqueado)

6. ✅ **Inicialización automática en `App.tsx`**
   - Firebase se inicializa automáticamente al cargar la app
   - No requiere acción manual del usuario para inicializar

---

## 🔧 PASO FINAL REQUERIDO: Obtener clave VAPID

**⚠️ IMPORTANTE:** La integración necesita una clave VAPID para funcionar. Esta clave se genera en Firebase Console.

### **Pasos para obtener la clave VAPID:**

1. **Ir a Firebase Console:**
   - URL: https://console.firebase.google.com/
   - Seleccionar tu proyecto: **twinclash-c6eac**

2. **Navegar a Project Settings:**
   - Click en el ⚙️ (engranaje) en la barra lateral izquierda
   - Seleccionar **"Project settings"**

3. **Ir a la pestaña Cloud Messaging:**
   - En la parte superior, seleccionar la pestaña **"Cloud Messaging"**

4. **Generar o copiar la clave VAPID:**
   - Buscar la sección **"Web Push certificates"**
   - Si ya existe una clave, copiarla
   - Si no existe, hacer click en **"Generate key pair"**
   - Copiar la clave pública (formato: `BNxxxxxxxxxxxxxxxxxxxx...`)

5. **Actualizar el código con la clave VAPID:**
   - Abrir el archivo: `src/lib/firebase.ts`
   - Buscar la línea 85 (aproximadamente):
     ```typescript
     vapidKey: 'REEMPLAZAR_CON_LA_CLAVE_PUBLICA_VAPID'
     ```
   - Reemplazar con tu clave VAPID real:
     ```typescript
     vapidKey: 'BNxxxxxxxxxxxxxxxxxxxx...'
     ```

6. **Guardar y redesplegar:**
   ```bash
   npm run build
   # Luego desplegar en tu servidor (Vercel/Netlify)
   ```

---

## 📊 Cómo Funciona

### **Flujo de usuario:**

1. **Usuario visita twinclash.org**
   - Firebase se inicializa automáticamente

2. **Usuario hace click en "Activar notificaciones"**
   - El navegador muestra el diálogo nativo de permisos
   - Si el usuario acepta, se genera un token FCM
   - El token se guarda automáticamente en Supabase

3. **Servidor envía notificación**
   - Puedes usar el token para enviar notificaciones desde tu backend
   - O usar la consola de Firebase para enviar mensajes de prueba

4. **Usuario recibe notificación:**
   - **Web abierta (foreground):** Notificación in-app con animación elegante
   - **Web cerrada (background):** Notificación nativa del sistema operativo
   - **Click en notificación:** Abre twinclash.org automáticamente

---

## 🧪 Cómo Probar las Notificaciones

### **Opción 1: Enviar mensaje de prueba desde Firebase Console**

1. Ir a: https://console.firebase.google.com/project/twinclash-c6eac/notification
2. Click en **"Send your first message"** o **"New notification"**
3. Llenar el formulario:
   - **Notification title:** `¡Reto diario disponible!`
   - **Notification text:** `Vuelve a jugar Twin Clash`
4. En **"Target"**, seleccionar **"Topic"** → `all` (o crear uno)
5. Click en **"Send message"**

### **Opción 2: Enviar notificación directa a un usuario específico**

Puedes consultar el token FCM de un usuario desde Supabase:

```sql
-- En Supabase SQL Editor
SELECT token FROM fcm_tokens WHERE client_id = 'XXX';
```

Luego usar ese token para enviar una notificación directa desde Firebase Console o tu backend.

### **Opción 3: Crear Edge Function para enviar notificaciones programáticas**

Puedes crear una Edge Function en Supabase que envíe notificaciones automáticamente (por ejemplo, para el reto diario).

---

## 🗃️ Estructura de la Base de Datos

### **Tabla: `fcm_tokens`**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid | ID único del registro |
| `client_id` | text | ID del cliente (usuario) |
| `token` | text | Token FCM del dispositivo |
| `device_info` | jsonb | Información del dispositivo (opcional) |
| `enabled` | boolean | Si las notificaciones están habilitadas |
| `created_at` | timestamptz | Fecha de creación |
| `updated_at` | timestamptz | Última actualización |

**Ejemplo de consulta:**

```sql
-- Ver todos los tokens activos
SELECT client_id, token, created_at
FROM fcm_tokens
WHERE enabled = true
ORDER BY created_at DESC;

-- Contar usuarios con notificaciones activadas
SELECT COUNT(*) as total_usuarios
FROM fcm_tokens
WHERE enabled = true;
```

---

## 🎨 Diseño del Botón de Notificaciones

El botón se muestra en el menú principal con 3 estados:

### **Estado 1: Permisos no solicitados (default)**
- Color: Azul
- Icono: Campana tachada
- Texto: "Activar notificaciones"
- Acción: Solicita permiso al hacer click

### **Estado 2: Permisos concedidos**
- Color: Verde
- Icono: Campana
- Texto: "Notificaciones activadas"
- Acción: Muestra tooltip confirmando que ya están activas

### **Estado 3: Permisos denegados**
- Color: Gris
- Icono: Campana tachada
- Texto: "Notificaciones bloqueadas"
- Acción: Deshabilitado (usuario debe ir a configuración del navegador)

---

## 📱 Compatibilidad

### **Navegadores soportados:**
- ✅ Chrome / Chromium (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Edge (Desktop & Android)
- ✅ Safari 16.4+ (macOS & iOS)
- ✅ Opera (Desktop & Android)
- ❌ iOS Safari < 16.4 (no soporta Web Push)

### **Requisitos:**
- ✅ HTTPS obligatorio (twinclash.org ya lo tiene)
- ✅ Service Worker soportado
- ✅ Notification API disponible

---

## 🚀 Casos de Uso Sugeridos

### **1. Reto Diario**
Enviar notificación diaria recordando al usuario que hay un nuevo reto:

```
Título: ¡Nuevo reto diario! 🎮
Mensaje: Demuestra tus habilidades y gana monedas extra
```

### **2. Eventos Especiales**
Anunciar eventos limitados o torneos:

```
Título: ⚡ Torneo de Twin Clash
Mensaje: Compite contra otros jugadores y gana premios exclusivos
```

### **3. Recompensas Disponibles**
Avisar cuando hay recompensas gratis para reclamar:

```
Título: 🎁 Recompensa disponible
Mensaje: ¡50 monedas gratis esperándote!
```

### **4. Recordatorios de Juego**
Re-engagement de usuarios inactivos:

```
Título: Te extrañamos 💙
Mensaje: Hace días que no juegas. ¡Vuelve y gana monedas!
```

---

## 🔒 Seguridad y Privacidad

### **Permisos del usuario:**
- ✅ El usuario debe **aceptar explícitamente** recibir notificaciones
- ✅ El usuario puede **revocar** el permiso en cualquier momento desde el navegador
- ✅ No se recopila información personal adicional

### **Almacenamiento de tokens:**
- ✅ Los tokens se guardan en Supabase con RLS habilitado
- ✅ Solo el usuario puede ver/actualizar su propio token
- ✅ Los tokens se eliminan automáticamente si el usuario desinstala la app o limpia datos

### **Mensajes:**
- ✅ Los mensajes se envían a través de Firebase (Google)
- ✅ No se almacena el contenido de los mensajes en Supabase
- ✅ El usuario puede desactivar notificaciones en cualquier momento

---

## 🐛 Troubleshooting

### **Problema: El botón no aparece**
**Solución:** Verifica que el navegador soporte notificaciones push. Intenta en Chrome o Firefox.

### **Problema: El diálogo de permisos no aparece**
**Solución:** Es posible que el usuario haya bloqueado notificaciones previamente. Debe ir a configuración del navegador:
- **Chrome:** ⋮ → Settings → Privacy and security → Site settings → Notifications
- **Firefox:** ☰ → Settings → Privacy & Security → Permissions → Notifications

### **Problema: Token no se guarda en Supabase**
**Solución:** Verifica que:
1. La tabla `fcm_tokens` exista
2. Las políticas RLS estén configuradas
3. No haya errores en la consola del navegador

### **Problema: Notificaciones no llegan**
**Solución:** Verifica que:
1. La clave VAPID esté correctamente configurada
2. El service worker esté registrado (`chrome://serviceworker-internals/`)
3. El token FCM sea válido en Firebase Console

### **Problema: Service Worker no se registra**
**Solución:**
1. Verifica que `firebase-messaging-sw.js` esté en `/public/`
2. Verifica que el sitio esté en HTTPS
3. Verifica que no haya errores en la consola

---

## ✅ Checklist de Verificación

- [ ] Clave VAPID obtenida de Firebase Console
- [ ] Clave VAPID agregada en `src/lib/firebase.ts`
- [ ] Build ejecutado: `npm run build`
- [ ] Código desplegado en producción
- [ ] Service Worker registrado (verificar en DevTools)
- [ ] Botón de notificaciones visible en menú principal
- [ ] Prueba: Click en "Activar notificaciones" funciona
- [ ] Prueba: Token se guarda en Supabase
- [ ] Prueba: Notificación de prueba desde Firebase Console llega correctamente

---

## 📖 Recursos Adicionales

- **Firebase Cloud Messaging Docs:** https://firebase.google.com/docs/cloud-messaging
- **Web Push Notifications Guide:** https://web.dev/push-notifications-overview/
- **Service Workers Guide:** https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

---

## 🎯 Próximos Pasos Opcionales

### **1. Crear Edge Function para envío automático**
Crear una función en Supabase que envíe notificaciones automáticamente según eventos:

```typescript
// supabase/functions/send-daily-notification/index.ts
// Enviar notificación a todos los usuarios a las 9:00 AM diariamente
```

### **2. Agregar segmentación de usuarios**
Permitir al usuario elegir qué tipo de notificaciones quiere recibir:
- Retos diarios
- Eventos especiales
- Recompensas
- Duelos

### **3. Implementar notificaciones ricas**
Agregar imágenes, acciones y badges a las notificaciones:

```javascript
// En firebase-messaging-sw.js
notificationOptions: {
  body: 'Mensaje',
  icon: '/twinlogo.png',
  badge: '/badge.png',
  image: '/promo-image.jpg',
  actions: [
    { action: 'play', title: 'Jugar ahora' },
    { action: 'close', title: 'Cerrar' }
  ]
}
```

### **4. Analytics de notificaciones**
Trackear:
- Cuántos usuarios tienen notificaciones activadas
- Tasa de apertura de notificaciones
- Conversiones desde notificaciones

---

**¡Tu sistema de notificaciones push está listo para producción!** 🚀

Solo falta agregar la clave VAPID y desplegar. Una vez hecho esto, podrás enviar notificaciones a todos tus usuarios desde Firebase Console o mediante Edge Functions automatizadas.
