# Panel Admin Push - Inicio Rápido ⚡

## Configuración en 3 Pasos

### 1️⃣ Variables de Entorno en Netlify

Ve a **Netlify Dashboard** → **Tu sitio** → **Site settings** → **Environment variables**

**Añade estas variables (si no existen):**

```
VITE_ADMIN_PASSWORD=twinclash2025
VITE_ADMIN_PUSH_KEY=twinclash_push_admin_2025
ADMIN_PUSH_KEY=twinclash_push_admin_2025
```

**IMPORTANTE:** `VITE_ADMIN_PUSH_KEY` y `ADMIN_PUSH_KEY` deben tener el mismo valor.

### 2️⃣ Obtener VAPID Key

1. [Firebase Console](https://console.firebase.google.com) → **twinclash-c6eac**
2. **Project settings** → **Cloud Messaging** → **Web Push certificates**
3. Copia el **Key pair** (empieza con `B...`)
4. Añádelo en Netlify:
   ```
   VITE_FIREBASE_VAPID_KEY=BIidQd...tu-vapid-key...
   ```

### 3️⃣ Deploy

```bash
git add .
git commit -m "Add admin push panel"
git push
```

Netlify detectará automáticamente los cambios y desplegará.

---

## Cómo Usar

### Acceder al Panel

**URL:** `https://twinclash.org/admin/push`

### Login

**Contraseña:** `twinclash2025` (o la que configuraste)

### Enviar Notificación

1. **Título:** Ej. "¡Nuevo mundo disponible!"
2. **Mensaje:** Ej. "Explora el mundo 6 con nuevos desafíos"
3. **URL:** (opcional) Ej. "https://twinclash.org/?world=6"
4. Clic en **"Enviar notificación a TODOS los usuarios"**

**Resultado:**
```
✅ ¡Enviado exitosamente! 1,247 usuarios recibieron la notificación.
```

---

## Variables de Entorno Completas

Si no están todas configuradas, copia esto en Netlify:

### Frontend (Build)
```
VITE_SUPABASE_URL=https://fdlqyqeobwumyjuqgrpl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_FIREBASE_API_KEY=AIzaSyAw4bFf4JssC0FWFD12-ImaJpDC8dg
VITE_FIREBASE_AUTH_DOMAIN=twinclash-c6eac.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=twinclash-c6eac
VITE_FIREBASE_STORAGE_BUCKET=twinclash-c6eac.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=189939875668
VITE_FIREBASE_APP_ID=1:189939875668:web:6330e6e16d82051fb18c1
VITE_FIREBASE_VAPID_KEY=[tu-vapid-key-aquí]
VITE_ADMIN_PASSWORD=twinclash2025
VITE_ADMIN_PUSH_KEY=twinclash_push_admin_2025
```

### Backend (Functions)
```
ADMIN_PUSH_KEY=twinclash_push_admin_2025
FIREBASE_PROJECT_ID=twinclash-c6eac
FIREBASE_CLIENT_EMAIL=[tu-firebase-service-account-email]
FIREBASE_PRIVATE_KEY=[tu-firebase-private-key]
SUPABASE_URL=https://fdlqyqeobwumyjuqgrpl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[tu-service-role-key]
```

---

## Archivos del Panel

### ✅ Creados
- `src/components/AdminPush.tsx` → Panel completo
- `ADMIN_PUSH_PANEL.md` → Documentación completa
- `ADMIN_PUSH_QUICKSTART.md` → Esta guía rápida

### ✅ Modificados
- `src/App.tsx` → Ruta `/admin/push` añadida
- `.env` → Variables de admin añadidas
- `.env.example` → Documentadas nuevas variables

---

## Troubleshooting Rápido

### ❌ "Unauthorized"
→ Verifica que `VITE_ADMIN_PUSH_KEY` = `ADMIN_PUSH_KEY` en Netlify

### ❌ "No active tokens found"
→ Normal si no hay usuarios con notificaciones. Espera a que se registren.

### ❌ Contraseña no funciona
→ Verifica `VITE_ADMIN_PASSWORD` en Netlify y redeploy

### ❌ No aparece el token en consola
→ Añade `VITE_FIREBASE_VAPID_KEY` en Netlify

---

## Seguridad

### Cambiar contraseña en producción:

En Netlify, cambia:
```
VITE_ADMIN_PASSWORD=una_contraseña_super_segura_xyz123
```

Redeploy y usa la nueva contraseña.

### Cambiar clave de API:

En Netlify, cambia ambas:
```
VITE_ADMIN_PUSH_KEY=nueva_clave_secreta_abc789
ADMIN_PUSH_KEY=nueva_clave_secreta_abc789
```

Redeploy.

---

## ¡Todo Listo! 🚀

Visita: **https://twinclash.org/admin/push**

Para más detalles: Lee `ADMIN_PUSH_PANEL.md`
