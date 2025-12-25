# 🔧 FIX: Error de Netlify "Base directory does not exist: /opt/build/repo/raiz"

## 🎯 DIAGNÓSTICO DEL PROBLEMA

### Error Actual:
```
Base directory does not exist: /opt/build/repo/raiz
```

### Causa:
La configuración del sitio en **Netlify UI** tiene configurado un "Base directory" llamado **"raiz"** que **NO existe** en tu repositorio.

### Estructura Real del Proyecto:
```
/
├── package.json          ← En la RAÍZ
├── netlify.toml          ← En la RAÍZ
├── vite.config.ts        ← En la RAÍZ
├── src/                  ← En la RAÍZ
├── public/               ← En la RAÍZ
└── dist/                 ← Build output
```

**Tu proyecto NO tiene un directorio "raiz"**. Todo está en la raíz del repositorio.

---

## ✅ SOLUCIONES

### Solución 1: Arreglar en Netlify UI (RECOMENDADO)

1. Ve a [Netlify Dashboard](https://app.netlify.com/)
2. Selecciona tu sitio "Twin Clash"
3. **Site settings** → **Build & deploy** → **Build settings**
4. En **"Base directory"**, verás que dice: `raiz`
5. **BÓRRALO COMPLETAMENTE** o cámbialo a `.` (punto)
6. Guarda los cambios
7. **Trigger deploy** → **Deploy site**

**Resultado:** Netlify buscará los archivos en la raíz (donde realmente están).

---

### Solución 2: netlify.toml Actualizado (YA HECHO)

He actualizado tu `netlify.toml` para ser más explícito:

```toml
[build]
  base = "."              # ← AÑADIDO: Indica que la raíz es el base directory
  command = "npm run build"
  publish = "dist"
```

**Cambios realizados:**
- ✅ Añadí `base = "."` para indicar explícitamente la raíz
- ✅ Cambié `npx vite build` a `npm run build` (más estándar)
- ✅ El resto de la configuración se mantiene igual

---

## 📝 CONFIGURACIÓN CORRECTA PARA NETLIFY

### Para un proyecto Vite + React en la raíz:

```toml
[build]
  base = "."                    # Raíz del proyecto
  command = "npm run build"     # Comando para compilar
  publish = "dist"              # Carpeta con el build

[build.environment]
  NODE_VERSION = "18"           # Versión de Node.js
```

### Variables de Entorno Necesarias:

En **Netlify UI** → **Site settings** → **Environment variables**, asegúrate de tener:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_key
```

**⚠️ SIN estas variables, el deploy compilará pero la app no funcionará.**

---

## 🔍 VERIFICAR CONFIGURACIÓN ACTUAL EN NETLIFY

### Paso 1: Revisar Build Settings

1. [Netlify Dashboard](https://app.netlify.com/)
2. Tu sitio → **Site settings** → **Build & deploy**
3. Verifica:

```
Base directory:     [VACÍO] o "."
Build command:      npm run build
Publish directory:  dist
```

### Paso 2: Revisar Environment Variables

1. **Site settings** → **Environment variables**
2. Debe tener:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## 🚀 PASOS PARA DESPLEGAR DESPUÉS DEL FIX

### Opción A: Deploy Manual

1. Arregla el "Base directory" en Netlify UI (bórralo o pon ".")
2. Ve a **Deploys** → **Trigger deploy** → **Deploy site**
3. Espera 2-3 minutos
4. ✅ Tu sitio debería compilar correctamente

### Opción B: Deploy con Git

```bash
# 1. Commit el netlify.toml actualizado
git add netlify.toml
git commit -m "Fix: Corregir configuración de Netlify base directory"

# 2. Push
git push origin main
```

Netlify detectará el push y desplegará automáticamente.

**IMPORTANTE:** Aunque hagas push, **DEBES arreglar el "Base directory" en Netlify UI** primero. El netlify.toml ayuda, pero la UI tiene prioridad.

---

## 🧪 VERIFICAR QUE EL FIX FUNCIONÓ

### Durante el Deploy:

En los logs de Netlify deberías ver:

```
2:31:45 PM: Build ready to start
2:31:47 PM: build-image version: 12345
2:31:47 PM: Netlify Build
2:31:47 PM: ────────────────────────────────────────────────────────────────
2:31:48 PM: Starting build script
2:31:48 PM: Detected package manager: npm
2:31:49 PM: Installing dependencies
2:31:50 PM: npm install
2:32:10 PM: Dependencies installed
2:32:11 PM: Running build command: npm run build
2:32:12 PM: > vite build
2:32:13 PM: vite v5.4.21 building for production...
2:32:25 PM: ✓ built in 12.3s
2:32:26 PM: Build succeeded!
2:32:26 PM: Site is live!
```

### ❌ Si el error persiste:

Verás algo como:
```
Base directory does not exist: /opt/build/repo/raiz
```

**Solución:** El "Base directory" en Netlify UI todavía está configurado incorrectamente. Bórralo.

### ✅ Si funciona:

```
✓ built in 12.3s
Site is live at: https://tu-sitio.netlify.app
```

---

## 🆘 PROBLEMAS COMUNES

### Problema 1: "Base directory does not exist"

**Causa:** Configuración incorrecta en Netlify UI
**Solución:** Netlify UI → Site settings → Build settings → Borrar "Base directory"

### Problema 2: Build funciona pero la app muestra errores en runtime

**Causa:** Faltan variables de entorno
**Solución:**
1. Netlify UI → Site settings → Environment variables
2. Añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
3. Redeploy

### Problema 3: "command not found: vite"

**Causa:** Dependencias no instaladas correctamente
**Solución:** Verifica que `package.json` esté en la raíz y el comando sea `npm run build`

### Problema 4: "Cannot find module 'react'"

**Causa:** Node version incorrecta o cache corrupto
**Solución:**
1. Netlify UI → Site settings → Build settings → Environment → NODE_VERSION = 18
2. Deploys → Trigger deploy → **Clear cache and deploy site**

---

## 📋 CHECKLIST DE VERIFICACIÓN

Antes de desplegar, verifica:

- [ ] `package.json` está en la raíz del repositorio
- [ ] `netlify.toml` está en la raíz del repositorio
- [ ] En Netlify UI, "Base directory" está **vacío** o es `.`
- [ ] En Netlify UI, "Build command" es `npm run build`
- [ ] En Netlify UI, "Publish directory" es `dist`
- [ ] Variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` configuradas
- [ ] Node version en Netlify es 18+
- [ ] Git repository conectado a Netlify

---

## 🎯 CONFIGURACIÓN FINAL CORRECTA

### En tu repositorio:

**`netlify.toml`** (en la raíz):
```toml
[build]
  base = "."
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### En Netlify UI:

**Site settings → Build & deploy → Build settings:**
```
Base directory:     [VACÍO] o "."
Build command:      npm run build
Publish directory:  dist
```

**Site settings → Environment variables:**
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_key
```

---

## 🚀 COMANDO RÁPIDO PARA DESPLEGAR

```bash
# Fix commit
git add netlify.toml
git commit -m "Fix: Netlify base directory configurado correctamente"
git push origin main
```

**IMPORTANTE:** Primero arregla el "Base directory" en Netlify UI, luego haz el push.

---

## 📞 SI NADA FUNCIONA

### Opción Nuclear: Reconfigura desde cero

1. **Desconecta el sitio:**
   - Netlify → Site settings → General → Delete this site

2. **Crea nuevo sitio:**
   - Netlify Dashboard → **Add new site** → **Import from Git**
   - Conecta tu repositorio
   - **NO cambies nada en Build settings** (deja todo por defecto)
   - Netlify detectará automáticamente que es un proyecto Vite

3. **Añade variables de entorno:**
   - Site settings → Environment variables
   - Añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

4. **Deploy:**
   - Netlify lo desplegará automáticamente
   - Debería funcionar sin problemas

---

## ✅ RESUMEN

### El Problema:
- ❌ Netlify busca un directorio "raiz" que NO existe
- ❌ Tu proyecto está en la raíz del repositorio, no en "raiz/"

### La Solución:
1. ✅ Actualizar `netlify.toml` con `base = "."` (YA HECHO)
2. ✅ Borrar "Base directory" en Netlify UI o ponerlo como "."
3. ✅ Verificar variables de entorno
4. ✅ Deploy

### Resultado Esperado:
```
✓ Build succeeded
✓ Site is live at: https://twinclash.netlify.app
```

---

**¡Tu netlify.toml está actualizado y listo para desplegar!** 🎉

**Próximo paso:** Ve a Netlify UI y borra/corrige el "Base directory" en Build settings.
