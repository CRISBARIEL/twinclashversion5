# Checklist de Deployment - Panel Admin Push ✅

Usa esta lista para verificar que todo esté configurado correctamente.

---

## Pre-Deploy (Local)

### ✅ Variables de Entorno Local

- [ ] Archivo `.env` existe en la raíz del proyecto
- [ ] Contiene `VITE_ADMIN_PASSWORD=twinclash2025`
- [ ] Contiene `VITE_ADMIN_PUSH_KEY=twinclash_push_admin_2025`
- [ ] Contiene `VITE_FIREBASE_VAPID_KEY=...` (obtenida de Firebase)

### ✅ Test Local

```bash
npm run dev
```

- [ ] Servidor inicia sin errores
- [ ] Visita `http://localhost:5173/admin/push`
- [ ] Aparece pantalla de login
- [ ] Puedes ingresar con contraseña `twinclash2025`
- [ ] Se muestra el formulario correctamente

---

## Firebase Configuration

### ✅ Obtener VAPID Key

- [ ] Ve a [Firebase Console](https://console.firebase.google.com)
- [ ] Selecciona proyecto **twinclash-c6eac**
- [ ] Click en **⚙️ (gear icon)** → **Project settings**
- [ ] Tab **Cloud Messaging**
- [ ] Scroll a **Web Push certificates**
- [ ] Copia el **Key pair** (empieza con `B...`)
- [ ] Guarda en lugar seguro

### ✅ Service Account (si no lo tienes)

- [ ] Firebase Console → **⚙️** → **Project settings** → **Service accounts**
- [ ] Click **Generate new private key**
- [ ] Descarga el archivo JSON
- [ ] Guarda:
  - `project_id` → `FIREBASE_PROJECT_ID`
  - `client_email` → `FIREBASE_CLIENT_EMAIL`
  - `private_key` → `FIREBASE_PRIVATE_KEY` (con `\n` literales)

---

## Netlify Configuration

### ✅ Frontend Variables (Build)

Ve a **Netlify Dashboard** → **Tu sitio** → **Site settings** → **Environment variables**

Añade estas variables:

- [ ] `VITE_SUPABASE_URL` = `https://fdlqyqeobwumyjuqgrpl.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] `VITE_FIREBASE_API_KEY` = `AIzaSyAw4bFf4JssC0FWFD12-ImaJpDC8dg`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` = `twinclash-c6eac.firebaseapp.com`
- [ ] `VITE_FIREBASE_PROJECT_ID` = `twinclash-c6eac`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` = `twinclash-c6eac.appspot.com`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` = `189939875668`
- [ ] `VITE_FIREBASE_APP_ID` = `1:189939875668:web:6330e6e16d82051fb18c1`
- [ ] `VITE_FIREBASE_VAPID_KEY` = `(la que copiaste de Firebase)`
- [ ] `VITE_ADMIN_PASSWORD` = `twinclash2025` (o tu contraseña segura)
- [ ] `VITE_ADMIN_PUSH_KEY` = `twinclash_push_admin_2025` (o tu clave segura)

### ✅ Backend Variables (Functions)

Añade estas variables también en Netlify:

- [ ] `ADMIN_PUSH_KEY` = `twinclash_push_admin_2025` (MISMO valor que `VITE_ADMIN_PUSH_KEY`)
- [ ] `FIREBASE_PROJECT_ID` = `twinclash-c6eac`
- [ ] `FIREBASE_CLIENT_EMAIL` = `firebase-adminsdk-...@twinclash-c6eac.iam.gserviceaccount.com`
- [ ] `FIREBASE_PRIVATE_KEY` = `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n`
- [ ] `SUPABASE_URL` = `https://fdlqyqeobwumyjuqgrpl.supabase.co`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**CRÍTICO:** Verifica que `VITE_ADMIN_PUSH_KEY` (frontend) = `ADMIN_PUSH_KEY` (backend)

---

## Build & Deploy

### ✅ Build Local (Verificación)

```bash
npm run build
```

- [ ] Build completa sin errores
- [ ] Carpeta `dist/` se crea correctamente
- [ ] No hay errores de TypeScript

### ✅ Git Commit & Push

```bash
git add .
git commit -m "Add admin push notification panel"
git push origin main
```

- [ ] Commit exitoso
- [ ] Push exitoso
- [ ] Netlify detecta el push automáticamente

### ✅ Netlify Deploy

- [ ] Ve a **Netlify Dashboard** → **Deploys**
- [ ] Espera a que el deploy termine (1-3 minutos)
- [ ] Status: **Published** (verde)
- [ ] No hay errores en el log

---

## Post-Deploy Testing

### ✅ Acceso al Panel

- [ ] Visita `https://twinclash.org/admin/push`
- [ ] Aparece pantalla de login (morada/rosa)
- [ ] No hay errores en consola del navegador (F12)

### ✅ Login

- [ ] Ingresa contraseña: `twinclash2025` (o la tuya)
- [ ] Click en **Acceder**
- [ ] Se muestra el formulario correctamente
- [ ] No hay errores en consola

### ✅ Formulario

- [ ] Campo **Título** funciona
- [ ] Campo **Mensaje** funciona
- [ ] Campo **URL** tiene valor por defecto `https://twinclash.org/`
- [ ] Contador de caracteres funciona (título: X/100, mensaje: Y/300)
- [ ] Botón grande dice "Enviar notificación a TODOS los usuarios"

### ✅ Envío de Prueba

**Primera Prueba: Con Datos Reales**

- [ ] Título: `Test desde admin panel`
- [ ] Mensaje: `Si recibes esto, el panel funciona correctamente`
- [ ] URL: `https://twinclash.org/`
- [ ] Click en **Enviar**

**Durante el envío:**
- [ ] Botón se deshabilita
- [ ] Aparece spinner animado
- [ ] Texto dice "Enviando notificaciones..."

**Después del envío:**
- [ ] Aparece mensaje verde de éxito
- [ ] Dice: "¡Enviado exitosamente! X usuarios recibieron la notificación"
- [ ] Muestra número de usuarios (puede ser 0 si no hay tokens)

### ✅ Consola del Navegador

Abre DevTools (F12) → Console:

- [ ] No hay errores en rojo
- [ ] Si hay logs `[PUSH]`, verifica que no haya errores

### ✅ Netlify Functions Logs

Ve a **Netlify Dashboard** → **Functions** → **send-push**:

- [ ] Hay logs recientes
- [ ] No hay errores
- [ ] Verifica el output (ej: "Sending to X tokens")

---

## Testing con Usuario Real

### ✅ Activar Notificaciones en la App

- [ ] Abre `https://twinclash.org/` en otro navegador/incógnito
- [ ] Acepta permiso de notificaciones cuando se pida
- [ ] Verifica en consola: `[PUSH] 🎉 TOKEN OBTENIDO: ...`
- [ ] Copia el token (opcional, para testing en Firebase Console)

### ✅ Enviar Notificación Real

En el panel admin:

- [ ] Título: `¡Hola! Notificación de prueba`
- [ ] Mensaje: `Esto es una prueba del sistema de notificaciones`
- [ ] URL: `https://twinclash.org/`
- [ ] Click **Enviar**

En el navegador del usuario:

- [ ] Aparece notificación del sistema operativo
- [ ] Título y mensaje correctos
- [ ] Click en notificación abre la URL

---

## Verificación de Base de Datos

### ✅ Supabase: Tabla `push_tokens`

Ve a [Supabase Dashboard](https://supabase.com/dashboard):

- [ ] Proyecto: **fdlqyqeobwumyjuqgrpl**
- [ ] Table Editor → `push_tokens`
- [ ] Hay al menos 1 fila (el usuario de prueba)
- [ ] Columnas: `token`, `platform`, `locale`, `last_seen`, etc.
- [ ] Los datos se ven correctos

---

## Troubleshooting Checklist

Si algo falla, verifica:

### ❌ "Unauthorized" al enviar

- [ ] `VITE_ADMIN_PUSH_KEY` existe en Netlify
- [ ] `ADMIN_PUSH_KEY` existe en Netlify
- [ ] Ambas tienen el MISMO valor exacto
- [ ] Redeploy después de cambiar variables

### ❌ "No active tokens found"

- [ ] La tabla `push_tokens` tiene filas
- [ ] Las filas tienen `last_seen` reciente (<30 días)
- [ ] La función `send-push` puede acceder a Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` está configurada

### ❌ Contraseña no funciona

- [ ] `VITE_ADMIN_PASSWORD` existe en Netlify
- [ ] El valor es exacto (case-sensitive)
- [ ] Has hecho redeploy después de añadir la variable
- [ ] Prueba en modo incógnito (para limpiar sessionStorage)

### ❌ No aparece la notificación

- [ ] El usuario aceptó el permiso de notificaciones
- [ ] El navegador soporta notificaciones (Chrome, Firefox, Edge)
- [ ] `FIREBASE_PRIVATE_KEY` está correcta en Netlify
- [ ] Firebase Admin SDK se inicializa correctamente
- [ ] Verifica logs de Netlify Functions

---

## Seguridad Post-Deploy

### ✅ Cambiar Credenciales por Defecto

**IMPORTANTE:** No uses las credenciales por defecto en producción.

- [ ] Cambiar `VITE_ADMIN_PASSWORD` a algo seguro
- [ ] Cambiar `VITE_ADMIN_PUSH_KEY` a algo aleatorio y largo
- [ ] Cambiar `ADMIN_PUSH_KEY` al mismo valor que `VITE_ADMIN_PUSH_KEY`
- [ ] Redeploy después de cambiar

**Generar contraseña segura:**
```bash
openssl rand -base64 32
```

### ✅ Documentar Credenciales

- [ ] Guarda las credenciales en un lugar seguro (1Password, LastPass, etc)
- [ ] No las compartas públicamente
- [ ] Solo administradores de confianza deben tener acceso

---

## Limpieza Final

### ✅ Archivos Innecesarios

- [ ] Elimina archivos `.DS_Store` (si estás en Mac)
- [ ] Elimina `node_modules/.cache` si existe
- [ ] Verifica que `.gitignore` esté actualizado

### ✅ Documentación

- [ ] Lee `ADMIN_PUSH_PANEL.md` (guía completa)
- [ ] Lee `ADMIN_PUSH_QUICKSTART.md` (inicio rápido)
- [ ] Lee `ADMIN_PUSH_EJEMPLOS.md` (casos de uso)
- [ ] Lee `ADMIN_PUSH_RESUMEN.md` (resumen técnico)
- [ ] Guarda este archivo para referencia futura

---

## Checklist de Uso Diario

Cuando vayas a enviar una notificación:

### Antes de Enviar

- [ ] ¿Es necesaria esta notificación?
- [ ] ¿El mensaje es claro y conciso?
- [ ] ¿La URL es correcta?
- [ ] ¿El timing es apropiado? (evita madrugada)
- [ ] ¿Has enviado otra notificación recientemente? (espacia 24-48h)

### Durante el Envío

- [ ] Verifica los campos antes de hacer click
- [ ] Lee el mensaje una última vez
- [ ] Click en **Enviar**

### Después de Enviar

- [ ] Verifica el mensaje de éxito
- [ ] Anota cuántos usuarios lo recibieron
- [ ] Monitorea el engagement en las próximas horas
- [ ] Si algo sale mal, revisa los logs

---

## Recursos de Referencia

### Documentación
- `ADMIN_PUSH_PANEL.md` - Guía completa
- `ADMIN_PUSH_QUICKSTART.md` - Inicio rápido
- `ADMIN_PUSH_EJEMPLOS.md` - 10 casos de uso
- `ADMIN_PUSH_RESUMEN.md` - Resumen técnico
- `ADMIN_PUSH_CHECKLIST.md` - Este archivo

### URLs Importantes
- Panel Admin: `https://twinclash.org/admin/push`
- Firebase Console: https://console.firebase.google.com
- Netlify Dashboard: https://app.netlify.com
- Supabase Dashboard: https://supabase.com/dashboard

### Comandos Útiles
```bash
# Build local
npm run build

# Dev server
npm run dev

# Ver logs de Netlify Functions
netlify functions:log send-push

# Deploy manual (si auto-deploy falla)
netlify deploy --prod
```

---

## Estado Final

Una vez completada toda esta checklist:

- ✅ El panel admin está desplegado y funcional
- ✅ Todas las variables están configuradas
- ✅ Has probado enviar una notificación real
- ✅ Los usuarios pueden recibir notificaciones
- ✅ La seguridad está configurada correctamente
- ✅ Tienes toda la documentación necesaria

**¡Panel 100% operativo! 🚀**

---

**Próximos Pasos:**
1. Lee `ADMIN_PUSH_EJEMPLOS.md` para inspiración
2. Envía tu primera notificación a usuarios reales
3. Monitorea el engagement y ajusta según necesites
4. Considera las mejoras futuras (segmentación, historial, etc)

**¡Disfruta del panel! 🎉**
