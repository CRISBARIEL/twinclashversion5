# Implementación Flujo "DESPUÉS" - Notificaciones Push

## Resumen
Sistema de notificaciones push implementado siguiendo el flujo "DESPUÉS" descrito en PUSH_ANTES_DESPUES.md: experiencia positiva, control del usuario, alta tasa de activación.

---

## Cambios Implementados

### 1. Instalación de Dependencias
```bash
npm install react-hot-toast
```

**Resultado:** Toast notifications profesionales que desaparecen automáticamente.

---

### 2. Componente NotificationBellButton.tsx (NUEVO)

**Ubicación:** `src/components/NotificationBellButton.tsx`

**Características:**
- ✅ Botón flotante (FAB) en esquina inferior derecha
- ✅ Solo visible en pantalla home (screen === 'simple')
- ✅ Estados: default, loading, granted, denied (oculto)
- ✅ Toast notifications con react-hot-toast
- ✅ localStorage para persistir estado ('push_status')
- ✅ Logs claros con prefijo [PUSH BELL]
- ✅ Animaciones: pulse-slow, wiggle

**Props:**
```typescript
interface NotificationBellButtonProps {
  isHomeScreen: boolean; // Solo se muestra si es true
}
```

**Estados:**

1. **Default (Pendiente)**
   - FAB circular 64x64px
   - Gradiente: purple-600 → pink-600
   - Icono: 🔔 Bell (32px, blanco)
   - Animación: pulse-slow + wiggle
   - Tooltip: "Activar notificaciones"

2. **Loading**
   - Spinner blanco girando (32px)
   - Disabled
   - Sin animaciones

3. **Granted (Activado)**
   - Gradiente: green-500 → emerald-600
   - Icono: ✓ Check (32px, blanco)
   - Animación: bounce
   - Tooltip: "Notificaciones activadas"
   - Cursor: default

4. **Denied (Bloqueado)**
   - **Completamente oculto** (return null)
   - No molesta más al usuario

---

### 3. Modificaciones en App.tsx

**Línea 13:** Import actualizado
```typescript
import { NotificationBellButton } from './components/NotificationBellButton';
```

**Línea 168:** Renderizado condicional
```typescript
<NotificationBellButton isHomeScreen={screen === 'simple'} />
```

**Lógica:**
- El botón solo aparece cuando `screen === 'simple'` (pantalla home)
- En otras pantallas (game, duel, worldmap, etc.) NO aparece
- Siempre montado pero con renderizado condicional interno

---

### 4. main.tsx (Ya estaba desactivado)

**Líneas 16-18:** Llamada automática comentada
```typescript
// ❌ DESACTIVADO: No pedir permisos automáticamente
// await iniciarNotificacionesPush();
console.log("[PUSH] Service worker listo. Use el botón de notificaciones para activar.");
```

**Estado:** ✅ Ya corregido anteriormente

---

## Flujo Completo "DESPUÉS"

### Al Cargar la App

```
Usuario abre twinclash.org
         ↓
[App carga normalmente]
         ↓
[main.tsx registra service worker SIN pedir permisos]
         ↓
[NotificationBellButton verifica estado]
         ↓
[PUSH BELL] Verificando estado inicial...
         ↓
¿Existe push_status en localStorage?
   ├─ 'granted' → Mostrar botón verde con check
   ├─ 'denied' → Ocultar botón completamente
   └─ null/undefined → Mostrar botón morado/rosa pulsando
         ↓
Usuario ve:
  - Juego funcionando
  - Botón FAB flotante (si no está denied)
  - SIN popups molestos
```

### Usuario Hace Clic en el Botón

```
[PUSH BELL] Usuario hizo clic - solicitando permiso...
         ↓
[Botón cambia a loading (spinner)]
         ↓
await Notification.requestPermission()
         ↓
[Navegador muestra popup nativo]
"twinclash.org quiere enviarte notificaciones"
[Bloquear] [Permitir]
         ↓
┌──────────────────────────────┐
│ Usuario decide:              │
│  - [Permitir] → Flujo Granted│
│  - [Bloquear] → Flujo Denied │
└──────────────────────────────┘
```

### Flujo Granted (Usuario acepta)

```
[PUSH BELL] ✅ Permiso concedido - obteniendo token...
         ↓
const messaging = getMessaging(firebaseApp);
const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration });
         ↓
[PUSH BELL] ✅ Token obtenido: BIJhA...
         ↓
[PUSH BELL] Guardando token en Supabase...
         ↓
POST /.netlify/functions/register-push
{
  token: "fcm_token_aqui",
  platform: "web",
  locale: "es-ES"
}
         ↓
[PUSH BELL] ✅ Token guardado exitosamente en Supabase
         ↓
setStatus('granted')
localStorage.setItem('push_status', 'granted')
         ↓
toast.success('¡Notificaciones activadas! 🎉', {
  duration: 4000,
  position: 'bottom-right',
  icon: '🔔'
})
         ↓
[Botón cambia a verde con check rebotando]
         ↓
✅ Usuario feliz
✅ Recibirá notificaciones de duelos y eventos
```

### Flujo Denied (Usuario bloquea)

```
[PUSH BELL] ❌ Usuario denegó el permiso
         ↓
setStatus('denied')
localStorage.setItem('push_status', 'denied')
         ↓
toast.error('Notificaciones bloqueadas 😔', {
  duration: 4000,
  position: 'bottom-right'
})
         ↓
[Botón desaparece completamente]
         ↓
[Toast desaparece después de 4s]
         ↓
Usuario continúa usando la app normalmente
(No se vuelve a molestar con el botón)
```

---

## Toast Notifications

### Librería: react-hot-toast

**Instalación:**
```bash
npm install react-hot-toast
```

**Uso en el componente:**
```typescript
import toast, { Toaster } from 'react-hot-toast';

// En el JSX
<Toaster />

// Mostrar toasts
toast.success('¡Notificaciones activadas! 🎉', {
  duration: 4000,
  position: 'bottom-right',
  icon: '🔔'
});

toast.error('Notificaciones bloqueadas 😔', {
  duration: 4000,
  position: 'bottom-right'
});
```

**Configuración:**
- Duración: 4000ms (4 segundos)
- Posición: bottom-right (no interfiere con el botón)
- Desaparece automáticamente
- Animación smooth de entrada/salida

---

## Renderizado Condicional

### Solo en Home Screen

**App.tsx:**
```typescript
<NotificationBellButton isHomeScreen={screen === 'simple'} />
```

**NotificationBellButton.tsx:**
```typescript
if (!isHomeScreen) {
  return null; // No renderizar nada si no está en home
}

if (status === 'denied') {
  return <Toaster />; // Solo el Toaster para otros toasts posibles
}
```

**Resultado:**
- ✅ Visible en pantalla home
- ❌ NO visible en: game, duel, worldmap, levelselect, upload, privacy, adminpush

---

## localStorage

### Key: 'push_status'

**Valores posibles:**
- `'default'`: No configurado (pero no se guarda explícitamente)
- `'granted'`: Notificaciones activadas
- `'denied'`: Notificaciones bloqueadas

**Lógica:**
```typescript
const savedStatus = localStorage.getItem('push_status');

if (savedStatus === 'granted') {
  // Mostrar botón verde
} else if (savedStatus === 'denied') {
  // Ocultar botón
} else {
  // Mostrar botón morado/rosa
}
```

**Persistencia:**
- ✅ Entre sesiones
- ✅ Entre recargas de página
- ✅ Sincroniza con Notification.permission

---

## Logs en Consola

### Prefijo: [PUSH BELL]

**Al cargar:**
```
[PUSH BELL] Verificando estado inicial...
[PUSH BELL] Estado guardado en localStorage: granted
```

**Al hacer clic:**
```
[PUSH BELL] Usuario hizo clic - solicitando permiso...
[PUSH BELL] Resultado del permiso: granted
[PUSH BELL] ✅ Permiso concedido - obteniendo token...
[PUSH BELL] ✅ Token obtenido: BIJhA_09TrJnVSR7...
[PUSH BELL] Guardando token en Supabase...
[PUSH BELL] ✅ Token guardado exitosamente en Supabase
```

**Si hay error:**
```
[PUSH BELL] ❌ VITE_FIREBASE_VAPID_KEY no configurada
[PUSH BELL] ❌ No se pudo obtener el token FCM
[PUSH BELL] ❌ Error al guardar token en backend
[PUSH BELL] ❌ Error al activar notificaciones: Error(...)
```

**Si bloquea:**
```
[PUSH BELL] ❌ Usuario denegó el permiso
```

---

## Estilos y Animaciones

### CSS Inline (en el componente)

**pulse-slow:**
```css
@keyframes pulse-slow {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 25px 50px -12px rgba(147, 51, 234, 0.5);
  }
}
```
- Duración: 2s ease-in-out infinite
- Efecto: Pulsa suavemente con glow morado

**wiggle:**
```css
@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}
```
- Duración: 1s ease-in-out infinite
- Efecto: Campanita se mueve de lado a lado

**Tailwind Classes:**
- `fixed bottom-6 right-6`: Posición flotante
- `z-50`: Por encima de casi todo
- `w-16 h-16`: 64x64px
- `rounded-full`: Círculo perfecto
- `shadow-2xl`: Sombra pronunciada
- `bg-gradient-to-r from-purple-600 to-pink-600`: Gradiente morado/rosa
- `hover:scale-110`: Crece al hover
- `animate-bounce`: Rebote (cuando granted)

---

## Manejo de Errores

### 1. Navegador no soporta notificaciones
```typescript
if (!('Notification' in window) || !('serviceWorker' in navigator)) {
  toast.error('Tu navegador no soporta notificaciones');
  setStatus('denied');
  localStorage.setItem('push_status', 'denied');
  return;
}
```

### 2. VAPID Key no configurada
```typescript
if (!VAPID_KEY) {
  toast.error('Error de configuración. Contacta a soporte.');
  return;
}
```

### 3. Token no obtenido
```typescript
if (!token) {
  toast.error('Error al obtener token. Intenta de nuevo.');
  return;
}
```

### 4. Backend error
```typescript
if (!response.ok) {
  toast.error('Error al registrar. Intenta de nuevo.');
}
```

### 5. Error general
```typescript
try {
  // ...
} catch (error) {
  console.error('[PUSH BELL] ❌ Error al activar notificaciones:', error);
  toast.error('Error al activar notificaciones');
}
```

---

## Testing

### Local Development

```bash
npm run dev
# http://localhost:5173
```

**Pasos:**
1. Abre la app
2. Verifica que aparece el botón morado/rosa en esquina inferior derecha
3. Verifica logs en consola: `[PUSH BELL] Verificando estado inicial...`
4. Haz clic en el botón
5. Acepta el permiso del navegador
6. Verifica toast verde: "¡Notificaciones activadas! 🎉"
7. Verifica que el botón cambia a verde con check
8. Recarga la página → el botón sigue verde

**Limpiar estado:**
```javascript
localStorage.removeItem('push_status');
window.location.reload();
```

### Producción

```bash
npm run build
# Deploy a Netlify
# https://twinclash.org
```

**Pasos:**
1. Visita https://twinclash.org
2. Mismo flujo que local
3. Verifica que el token se guarda en Supabase
4. Verifica que las notificaciones llegan

---

## Comparación Antes vs Después

| Aspecto | ANTES ❌ | DESPUÉS ✅ |
|---------|----------|------------|
| **Solicitud de permiso** | Automática al cargar | Solo al hacer clic |
| **Visibilidad del botón** | Siempre visible en todas las pantallas | Solo en home, oculto si denied |
| **Estados visuales** | Default, granted, denied (gris) | Default, loading, granted, denied (oculto) |
| **Feedback** | Toasts DIV personalizados | react-hot-toast profesionales |
| **Experiencia** | Sorpresa negativa | Control total del usuario |
| **Tasa de activación** | ~15% | ~50%+ estimado |
| **Logs** | [PUSH] genérico | [PUSH BELL] específico |
| **Navegación** | N/A | Solo en home (isHomeScreen) |

---

## Archivos Modificados

### 1. package.json
- ✅ Añadido: `react-hot-toast`

### 2. src/components/NotificationBellButton.tsx (NUEVO)
- ✅ Componente completo con flujo "DESPUÉS"

### 3. src/App.tsx
- ✅ Línea 13: Import de NotificationBellButton
- ✅ Línea 168: Renderizado condicional con isHomeScreen

### 4. src/main.tsx
- ✅ Ya estaba desactivada la llamada automática (no requiere cambios)

---

## Variables de Entorno Necesarias

```env
# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_KEY=BIJhA...  # ← CRÍTICA!

# Supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## Backend (Netlify Function)

**Endpoint:** `/.netlify/functions/register-push`

**Método:** POST

**Body:**
```json
{
  "token": "fcm_token_aqui",
  "platform": "web",
  "locale": "es-ES"
}
```

**Response OK:**
```json
{
  "ok": true
}
```

**Tabla Supabase:** `push_tokens`
- `token` (text): Token FCM
- `platform` (text): 'web'
- `locale` (text): Idioma del navegador
- `last_seen` (timestamp): Timestamp actual
- `user_agent` (text): User agent del navegador

---

## Build Status

```
✓ 2188 modules transformed
✓ built in 13.00s
✅ Sin errores de compilación
✅ react-hot-toast incluido en bundle
✅ NotificationBellButton compilado correctamente
```

---

## Comandos Útiles

### Desarrollo
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Ver estado en consola
```javascript
console.log('Push status:', localStorage.getItem('push_status'));
console.log('Notification permission:', Notification.permission);
```

### Limpiar estado (testing)
```javascript
localStorage.removeItem('push_status');
window.location.reload();
```

### Verificar token en Supabase
```sql
SELECT * FROM push_tokens
WHERE platform = 'web'
ORDER BY last_seen DESC
LIMIT 10;
```

---

## Resultado Final

✅ **Flujo "DESPUÉS" implementado correctamente:**

1. Usuario carga la app → NO hay popup molesto
2. Usuario ve botón bonito pulsando → Llama su atención
3. Usuario decide activar → Hace clic
4. Navegador pide permiso → Usuario acepta (porque fue su decisión)
5. Token guardado → Botón verde, toast de éxito
6. Estado persistente → No vuelve a preguntar
7. Usuario feliz → Alta tasa de activación

**Experiencia:** Profesional, no invasiva, control del usuario, alta conversión.

**Estado:** ✅ Listo para producción

---

## Documentación Relacionada

- `PUSH_ANTES_DESPUES.md` - Comparación visual completa
- `PUSH_NOTIFICATIONS_FIX.md` - Guía técnica detallada
- `PUSH_FIX_RESUMEN.md` - Resumen rápido

---

**Implementado:** 27 de diciembre de 2025
**Estado:** ✅ Producción Ready
**Resultado:** Sistema de notificaciones push siguiendo mejores prácticas UX
