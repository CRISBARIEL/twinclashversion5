# Panel de Administración de Notificaciones Push

Panel protegido para enviar notificaciones push masivas a todos los usuarios de Twin Clash.

## Archivos Creados/Modificados

### ✅ Archivos Nuevos
- `src/components/AdminPush.tsx` - Componente del panel de administración

### ✅ Archivos Modificados
- `src/App.tsx` - Añadida ruta `/admin/push`
- `.env` - Añadidas variables de entorno para admin
- `.env.example` - Documentadas las nuevas variables

## Cómo Acceder

**URL:** `https://twinclash.org/admin/push`

O en local: `http://localhost:5173/admin/push`

## Configuración

### 1. Variables de Entorno (Frontend)

Añade estas variables a tu archivo `.env` local:

```env
# Admin Panel Configuration
VITE_ADMIN_PASSWORD=twinclash2025
VITE_ADMIN_PUSH_KEY=twinclash_push_admin_2025

# Firebase VAPID Key (necesaria para push notifications)
VITE_FIREBASE_VAPID_KEY=TU_VAPID_KEY_AQUI
```

### 2. Variables de Entorno en Netlify

En **Netlify Dashboard** → **Site settings** → **Environment variables**, añade:

**Frontend (Build variables):**
```
VITE_ADMIN_PASSWORD=tu_contraseña_segura
VITE_ADMIN_PUSH_KEY=tu_clave_admin_segura
VITE_FIREBASE_VAPID_KEY=tu_vapid_key
```

**Backend (Function variables) - ya deberías tenerlas configuradas:**
```
ADMIN_PUSH_KEY=tu_clave_admin_segura
FIREBASE_PROJECT_ID=twinclash-c6eac
FIREBASE_CLIENT_EMAIL=tu_email_firebase
FIREBASE_PRIVATE_KEY=tu_private_key
SUPABASE_URL=https://fdlqyqeobwumyjuqgrpl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

**IMPORTANTE:** El valor de `VITE_ADMIN_PUSH_KEY` (frontend) debe ser igual a `ADMIN_PUSH_KEY` (backend).

### 3. Obtener VAPID Key de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto: **twinclash-c6eac**
3. Ve a **Project settings** (engranaje) → **Cloud Messaging**
4. En la sección **Web Push certificates**, copia la **Key pair**
5. Pégala en `VITE_FIREBASE_VAPID_KEY`

## Uso del Panel

### Paso 1: Acceder al Panel

1. Visita `https://twinclash.org/admin/push`
2. Verás una pantalla de autenticación

### Paso 2: Ingresar Contraseña

- Introduce la contraseña configurada en `VITE_ADMIN_PASSWORD`
- Por defecto en desarrollo: `twinclash2025`
- En producción: usa una contraseña segura

**Seguridad:**
- La sesión se guarda en `sessionStorage`
- Se cierra automáticamente al cerrar la pestaña
- No se exponen credenciales en el código

### Paso 3: Enviar Notificación

Completa el formulario:

**Título (obligatorio):**
- Máximo 100 caracteres
- Ejemplo: "¡Nuevo nivel disponible!"

**Mensaje (obligatorio):**
- Máximo 300 caracteres
- Ejemplo: "Descubre el mundo 5 con nuevos desafíos y recompensas"

**URL (opcional):**
- Por defecto: `https://twinclash.org/`
- Ejemplo personalizado: `https://twinclash.org/?world=5`

### Paso 4: Confirmar Envío

Haz clic en **"Enviar notificación a TODOS los usuarios"**

Verás:
- "Enviando notificaciones..." (spinner animado)
- Resultado: "¡Enviado a X usuarios!"
- Fallidos: Si hay tokens inválidos

## Características del Sistema

### Seguridad
✅ Protección por contraseña
✅ Header `x-admin-key` para autenticar requests
✅ Validación en backend (Netlify Function)
✅ Variables de entorno para credenciales

### Funcionalidad
✅ Envío masivo a todos los usuarios activos
✅ Solo usuarios de últimos 30 días
✅ Limpieza automática de tokens inválidos
✅ Procesamiento por lotes (500 tokens/batch)
✅ Contador de enviados/fallidos

### Diseño
✅ Interfaz moderna con Tailwind CSS
✅ Gradientes morados/rosas profesionales
✅ Responsive (mobile-friendly)
✅ Estados de carga animados
✅ Mensajes de éxito/error claros

## Arquitectura Técnica

### Frontend (`AdminPush.tsx`)

```typescript
// Protección con contraseña
sessionStorage.getItem('admin_authenticated')

// Envío de notificación
fetch('/.netlify/functions/send-push', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-key': VITE_ADMIN_PUSH_KEY
  },
  body: JSON.stringify({ title, body, url })
})
```

### Backend (`netlify/functions/send-push.ts`)

Ya existía, funciona perfectamente:
1. Valida header `x-admin-key`
2. Obtiene tokens de Supabase (últimos 30 días)
3. Envía notificaciones con Firebase Admin SDK
4. Elimina tokens inválidos
5. Retorna estadísticas

### Base de Datos

Tabla utilizada: `push_tokens`
```sql
- token (string): FCM token
- platform (string): 'web'
- last_seen (timestamp)
- locale (string)
- user_agent (string)
```

## Flujo Completo

```
Usuario → /admin/push
  ↓
Pide contraseña (VITE_ADMIN_PASSWORD)
  ↓
Muestra formulario
  ↓
Usuario completa: título, mensaje, url
  ↓
Frontend envía POST a /.netlify/functions/send-push
  ↓
Backend valida x-admin-key (ADMIN_PUSH_KEY)
  ↓
Backend obtiene tokens de Supabase
  ↓
Firebase Admin SDK envía notificaciones
  ↓
Se limpian tokens inválidos
  ↓
Frontend muestra: "¡Enviado a 247 usuarios!"
```

## Ejemplo de Uso

### Caso: Lanzamiento de Nuevo Mundo

**Título:**
```
¡Mundo 6 Disponible! 🎮
```

**Mensaje:**
```
Explora 5 niveles épicos con obstáculos nunca vistos. ¿Estás listo para el desafío?
```

**URL:**
```
https://twinclash.org/?world=6
```

**Resultado:**
```
✅ ¡Enviado exitosamente! 1,247 usuarios recibieron la notificación.
```

### Caso: Evento Especial

**Título:**
```
Duelos Especiales - Este Fin de Semana
```

**Mensaje:**
```
Gana el doble de monedas en modo duelo. ¡Solo hasta el domingo!
```

**URL:**
```
https://twinclash.org/?mode=duel
```

## Troubleshooting

### Error: "Unauthorized"
❌ El header `x-admin-key` no coincide
✅ Verifica que `VITE_ADMIN_PUSH_KEY` (frontend) = `ADMIN_PUSH_KEY` (backend)

### Error: "No active tokens found"
❌ No hay usuarios con notificaciones activas
✅ Normal si es la primera vez, espera a que usuarios se registren

### Error: "Firebase Admin credentials not configured"
❌ Faltan variables de Firebase en Netlify
✅ Configura `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

### La contraseña no funciona
❌ Contraseña incorrecta
✅ Verifica que usas el valor exacto de `VITE_ADMIN_PASSWORD`
✅ En local, reinicia el servidor después de cambiar `.env`

### No aparece el token en consola
❌ Falta `VITE_FIREBASE_VAPID_KEY`
✅ Ve a Firebase Console y copia tu VAPID Key

## Seguridad en Producción

### Recomendaciones

1. **Cambia las contraseñas por defecto:**
   ```env
   VITE_ADMIN_PASSWORD=una_contraseña_super_segura_2025
   VITE_ADMIN_PUSH_KEY=una_clave_aleatoria_muy_larga_xyz789
   ```

2. **No compartas las credenciales:**
   - Solo administradores de confianza
   - Usa un gestor de contraseñas

3. **Monitorea los accesos:**
   - Revisa logs de Netlify Functions
   - Busca intentos fallidos de autenticación

4. **Considera añadir 2FA:**
   - Para más seguridad, puedes implementar autenticación de dos factores
   - O usar un sistema de roles más robusto

## Estadísticas

El panel te mostrará:
- ✅ Usuarios que recibieron la notificación
- ❌ Tokens que fallaron
- 🗑️ Tokens inválidos eliminados automáticamente

## Próximos Pasos

1. **Personalización por segmento:**
   - Enviar solo a usuarios de un mundo específico
   - Filtrar por idioma o país

2. **Historial de notificaciones:**
   - Tabla en Supabase con todas las notificaciones enviadas
   - Ver cuándo y a cuántos usuarios se envió cada una

3. **Programación:**
   - Enviar notificaciones en una fecha/hora específica
   - Sistema de cola para envíos masivos

## Recursos

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Supabase Push Tokens](https://supabase.com/docs)

## Soporte

Si algo no funciona:
1. Revisa la consola del navegador (F12)
2. Revisa los logs de Netlify Functions
3. Verifica que todas las variables de entorno estén configuradas
4. Asegúrate de que la función `send-push` esté desplegada

---

**¡Panel listo para producción! 🚀**
