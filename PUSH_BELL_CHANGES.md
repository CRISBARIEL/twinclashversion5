# Cambios Exactos - NotificationBellButton

## 1. Instalación de Dependencias

```bash
npm install react-hot-toast
```

**Resultado:** `package.json` actualizado
```json
{
  "dependencies": {
    "react-hot-toast": "^2.4.1"
  }
}
```

---

## 2. Nuevo Componente Creado

**Archivo:** `src/components/NotificationBellButton.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { getMessaging, getToken } from 'firebase/messaging';
import { firebaseApp } from '../lib/firebaseApp';
import toast, { Toaster } from 'react-hot-toast';

type PushStatus = 'default' | 'granted' | 'denied';

interface NotificationBellButtonProps {
  isHomeScreen: boolean;
}

export function NotificationBellButton({ isHomeScreen }: NotificationBellButtonProps) {
  // Estado y lógica completa...
  // Ver archivo completo en src/components/NotificationBellButton.tsx
}
```

**Características:**
- ✅ Prop `isHomeScreen` para renderizado condicional
- ✅ Estados: default, granted, denied
- ✅ react-hot-toast para toasts
- ✅ localStorage para persistencia
- ✅ Logs con [PUSH BELL]
- ✅ FAB flotante 64x64px
- ✅ Animaciones pulse-slow + wiggle

---

## 3. App.tsx - Import

**Antes:**
```typescript
import { NotificationButton } from './components/NotificationButton';
```

**Después:**
```typescript
import { NotificationBellButton } from './components/NotificationBellButton';
```

---

## 4. App.tsx - Renderizado

**Antes:**
```typescript
return (
  <LanguageContext.Provider value={languageState}>
    <NotificationButton />
    {screen === 'simple' && (
      ...
```

**Después:**
```typescript
return (
  <LanguageContext.Provider value={languageState}>
    <NotificationBellButton isHomeScreen={screen === 'simple'} />
    {screen === 'simple' && (
      ...
```

**Cambio clave:** Se pasa `isHomeScreen={screen === 'simple'}` para que el botón solo aparezca en home.

---

## 5. main.tsx - Sin Cambios

**Estado actual (ya estaba correcto):**
```typescript
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("[PUSH] SW registered:", reg.scope);

      // ❌ DESACTIVADO: No pedir permisos automáticamente
      // await iniciarNotificacionesPush();
      console.log("[PUSH] Service worker listo. Use el botón de notificaciones para activar.");
    } catch (e) {
      console.error("[PUSH] SW register failed:", e);
    }
  });
}
```

✅ No requiere cambios adicionales.

---

## 6. NotificationButton.tsx (Anterior)

**Estado:** Puede eliminarse o dejarse como backup

**Recomendación:** Renombrar a `NotificationButton.tsx.backup` o eliminar completamente.

```bash
# Opcional: Backup del componente anterior
mv src/components/NotificationButton.tsx src/components/NotificationButton.tsx.backup
```

---

## Resumen de Archivos

### Modificados
- ✅ `package.json` - Añadido react-hot-toast
- ✅ `src/App.tsx` - Import + renderizado condicional

### Creados
- ✅ `src/components/NotificationBellButton.tsx` - Componente nuevo

### Sin Cambios
- ✅ `src/main.tsx` - Ya estaba correcto
- ✅ `src/lib/push.ts` - No se usa
- ✅ `src/lib/pushDebug.ts` - No se usa
- ✅ `src/lib/firebase.ts` - No se usa para push
- ✅ `src/lib/firebaseApp.ts` - Se usa en el botón

---

## Diferencias Técnicas

| Aspecto | NotificationButton (Anterior) | NotificationBellButton (Nuevo) |
|---------|-------------------------------|--------------------------------|
| **Toast** | DIV personalizado | react-hot-toast |
| **Visibilidad** | Siempre visible | Solo en home |
| **Estado denied** | Gris, visible | Oculto completamente |
| **Prop** | Ninguna | `isHomeScreen: boolean` |
| **Logs** | [PUSH] | [PUSH BELL] |
| **Texto** | Mostrado en pantalla | Solo en tooltip |
| **Forma** | Rectángulo con texto | Círculo FAB solo icono |

---

## Testing Rápido

### 1. Verificar que el botón aparece solo en home
```typescript
// En home (screen === 'simple')
✅ Botón visible

// En game (screen === 'game')
❌ Botón NO visible

// En duel (screen === 'duel')
❌ Botón NO visible
```

### 2. Verificar estados
```javascript
// Default
localStorage.removeItem('push_status');
window.location.reload();
→ Botón morado/rosa pulsando

// Granted
localStorage.setItem('push_status', 'granted');
window.location.reload();
→ Botón verde con check

// Denied
localStorage.setItem('push_status', 'denied');
window.location.reload();
→ Botón oculto (no aparece)
```

### 3. Verificar toasts
```javascript
// Al activar con éxito
→ Toast verde: "¡Notificaciones activadas! 🎉"
→ Duración: 4s
→ Posición: bottom-right

// Al bloquear
→ Toast rojo: "Notificaciones bloqueadas 😔"
→ Duración: 4s
→ Posición: bottom-right
```

---

## Build

```bash
npm run build
```

**Output:**
```
✓ 2188 modules transformed
✓ built in 13.00s
✅ Sin errores
✅ react-hot-toast incluido
✅ NotificationBellButton compilado
```

---

## Logs Esperados

### Al cargar la app
```
[PUSH] SW registered: https://twinclash.org/
[PUSH] Service worker listo. Use el botón de notificaciones para activar.
[PUSH BELL] Verificando estado inicial...
[PUSH BELL] Estado guardado en localStorage: granted
```

### Al hacer clic (si está pendiente)
```
[PUSH BELL] Usuario hizo clic - solicitando permiso...
[PUSH BELL] Resultado del permiso: granted
[PUSH BELL] ✅ Permiso concedido - obteniendo token...
[PUSH BELL] ✅ Token obtenido: BIJhA_09TrJnVSR7...
[PUSH BELL] Guardando token en Supabase...
[PUSH BELL] ✅ Token guardado exitosamente en Supabase
```

---

## Variables de Entorno

**Necesarias:**
```env
VITE_FIREBASE_VAPID_KEY=BIJhA...
```

**Verificar:**
```javascript
console.log(import.meta.env.VITE_FIREBASE_VAPID_KEY);
// Debe empezar con "B"
```

---

## Flujo Completo

```
1. Usuario carga app
     ↓
2. NotificationBellButton monta
     ↓
3. Verifica localStorage 'push_status'
     ↓
4. Renderiza botón según estado (o null si denied)
     ↓
5. Usuario hace clic (si está pendiente)
     ↓
6. Pide permiso
     ↓
7. Si granted:
   - Obtiene token FCM
   - Guarda en Supabase
   - Cambia botón a verde
   - Toast de éxito
   - Guarda en localStorage
     ↓
8. Si denied:
   - Toast de error
   - Oculta botón
   - Guarda en localStorage
```

---

## Estado Final

✅ **Implementado flujo "DESPUÉS" completo:**

- Botón solo en home
- Pide permiso solo al hacer clic
- Se oculta si está bloqueado
- Toasts profesionales
- Estado persistente
- Logs claros
- Build exitoso

**Listo para producción 🚀**
