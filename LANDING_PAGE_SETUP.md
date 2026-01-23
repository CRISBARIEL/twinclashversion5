# Landing Page Setup - Twin Clash

## ✅ Implementación Completa

Se ha creado una landing page moderna y responsive para twinclash.org con:

### Características Implementadas

1. **Hero Section**
   - Video de gameplay vertical (9:16) con placeholder
   - Botón principal: "Descargar en Google Play"
   - Botón secundario: "Dejar reseña ⭐"
   - Texto claro: "Memori contrarreloj + duelos"
   - Diseño responsive mobile-first

2. **Redirección Inteligente**
   - Android → `market://details?id=com.twinclash.game`
   - Desktop/iOS → `https://play.google.com/store/apps/details?id=com.twinclash.game`
   - Reseñas → `showAllReviews=true` en web

3. **Secciones Adicionales**
   - Features destacadas (Modo Contrarreloj, Duelos, Temas)
   - Footer con enlace a versión web
   - Gradiente atractivo de fondo

## Archivos Creados/Modificados

### Nuevos Archivos
- `public/landing.html` - Landing page principal
- `public/assets/README.md` - Guía para agregar video/poster
- `LANDING_PAGE_SETUP.md` - Esta documentación

### Modificados
- `public/_redirects` - Configuración de rutas

## Estructura de Rutas

```
https://twinclash.org/           → Landing page (landing.html)
https://twinclash.org/app        → Aplicación web (index.html/React)
https://twinclash.org/app/*      → Rutas de la app
```

## Cómo Probar Localmente

### 1. Iniciar servidor de desarrollo

```bash
npm run dev
```

### 2. Acceder a las rutas

- **Landing:** http://localhost:5173/
- **App Web:** http://localhost:5173/app

> **Nota:** En desarrollo local, puede que las redirecciones no funcionen exactamente igual que en producción (Netlify). Para probar la landing, accede directamente a `http://localhost:5173/landing.html`

### 3. Probar en móvil

Usa el emulador de dispositivos en Chrome DevTools:
- F12 → Toggle device toolbar
- Selecciona "Pixel 5" o similar
- Verifica layout responsive

## Assets del Video

### Estado Actual
🟡 **Placeholder activo** - Mostrando placeholder mientras se agregan los assets reales.

### Para Activar el Video

1. **Crea o captura gameplay:**
   ```bash
   # Ejemplo con ADB
   adb shell screenrecord --time-limit 10 /sdcard/gameplay.mp4
   adb pull /sdcard/gameplay.mp4 .
   ```

2. **Optimiza el video:**
   ```bash
   ffmpeg -i gameplay.mp4 \
     -vf "scale=720:1280" \
     -c:v libx264 \
     -crf 28 \
     -preset slow \
     -an \
     -t 8 \
     public/assets/gameplay.mp4
   ```

3. **Crea poster (thumbnail):**
   ```bash
   ffmpeg -i public/assets/gameplay.mp4 \
     -ss 00:00:02 \
     -frames:v 1 \
     public/assets/poster.jpg
   ```

4. **Verifica:**
   - El video debe aparecer automáticamente
   - El placeholder desaparecerá
   - Debe reproducirse en loop, muted, autoplay

Ver `public/assets/README.md` para más detalles.

## Deploy a Producción

### Netlify (Automático)

```bash
git add .
git commit -m "feat: add landing page with hero section"
git push
```

Netlify detectará los cambios y desplegará automáticamente.

### Verificar Deploy

1. **Landing:** https://twinclash.org/
2. **App:** https://twinclash.org/app

3. **Probar botones en Android:**
   - Abre en navegador móvil Android
   - Clic en "Descargar" → Debe abrir Google Play
   - Clic en "Reseña" → Debe abrir Google Play

4. **Probar en Desktop:**
   - "Descargar" → Abre web de Google Play
   - "Reseña" → Abre sección de reseñas

## Personalización

### Cambiar Colores

Edita `public/landing.html`, sección `<style>`:

```css
/* Gradiente de fondo */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Botón principal */
.tc-btn--primary {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}
```

### Modificar Textos

Edita `public/landing.html`, sección `<section class="tc-hero">`:

```html
<h1 class="tc-title">Tu Título</h1>
<p class="tc-subtitle">Tu descripción</p>
```

### Agregar Más Features

Edita `<section class="tc-features">`:

```html
<div class="tc-feature">
  <h3>🎯 Tu Feature</h3>
  <p>Descripción de la feature</p>
</div>
```

## SEO y Analytics

### Meta Tags Incluidos
- Title y Description optimizados
- Open Graph para redes sociales
- Theme color para navegadores móviles

### Agregar Google Analytics (Opcional)

Agrega antes de `</head>` en `landing.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## Troubleshooting

### El video no se reproduce en iOS
**Solución:** iOS requiere `playsinline`. Ya está incluido:
```html
<video autoplay muted loop playsinline>
```

### Los botones no funcionan
**Solución:** Verifica la consola del navegador. Los event listeners están al final del HTML.

### La landing no aparece como página principal
**Solución:** Verifica `public/_redirects`:
```
/  /landing.html  200
```

### Layout roto en móvil
**Solución:** Verifica que el viewport meta tag esté presente:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## Próximos Pasos

1. ✅ Landing page creada
2. ✅ Botones de Google Play configurados
3. ✅ Responsive design implementado
4. 🟡 Agregar video de gameplay real
5. 🟡 Agregar poster del video
6. 🔲 Configurar analytics (opcional)
7. 🔲 Pruebas A/B de copy (opcional)

## Testing Checklist

Antes de hacer push a producción:

- [ ] La landing se ve bien en móvil (< 480px)
- [ ] La landing se ve bien en tablet (480-880px)
- [ ] La landing se ve bien en desktop (> 880px)
- [ ] Botón "Descargar" funciona en Android
- [ ] Botón "Descargar" funciona en Desktop
- [ ] Botón "Reseña" funciona en Android
- [ ] Botón "Reseña" funciona en Desktop
- [ ] El video se reproduce automáticamente (si existe)
- [ ] El placeholder aparece si no hay video
- [ ] La app web sigue funcionando en `/app`
- [ ] No hay errores en consola

## Contacto

Para dudas o modificaciones, verifica:
- `public/landing.html` - Código de la landing
- `public/assets/README.md` - Guía de assets
- `public/_redirects` - Configuración de rutas
