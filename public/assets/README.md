# Assets para Landing Page

## Videos y Imágenes Necesarios

### 1. Video de Gameplay (`gameplay.mp4`)

**Especificaciones:**
- Formato: MP4 (H.264)
- Resolución: 720x1280 (9:16 vertical)
- Duración: 5-8 segundos
- Tamaño: < 2MB (comprimido)
- FPS: 30
- Sin audio (o muted)

**Herramientas para crear/optimizar:**
- HandBrake (compresión)
- FFmpeg (conversión)
- CapCut (edición móvil)

**Comando FFmpeg para optimizar:**
```bash
ffmpeg -i input.mp4 -vf "scale=720:1280" -c:v libx264 -crf 28 -preset slow -an -t 8 gameplay.mp4
```

### 2. Poster del Video (`poster.jpg`)

**Especificaciones:**
- Formato: JPG
- Resolución: 720x1280
- Tamaño: < 100KB
- Contenido: Frame representativo del gameplay

**Crear poster desde video:**
```bash
ffmpeg -i gameplay.mp4 -ss 00:00:02 -frames:v 1 poster.jpg
```

### 3. Alternativa: GIF Animado (`gameplay.gif`)

Si prefieres GIF en lugar de video:

**Especificaciones:**
- Formato: GIF
- Resolución: 360x640 (más pequeño)
- Duración: 3-5 segundos
- Tamaño: < 1MB
- FPS: 15-20

**Crear GIF desde video:**
```bash
ffmpeg -i input.mp4 -vf "fps=15,scale=360:640:flags=lanczos" -t 5 gameplay.gif
```

## Ubicación de Archivos

```
public/
└── assets/
    ├── gameplay.mp4    (video principal)
    ├── poster.jpg      (thumbnail del video)
    └── gameplay.gif    (alternativa opcional)
```

## Cómo Agregar los Assets

1. **Graba/captura tu gameplay:**
   - Usa ADB Screen Recording en Android
   - O captura desde emulador
   - Asegúrate de mostrar las características principales

2. **Procesa el video:**
   - Recorta a 5-8 segundos
   - Convierte a vertical (9:16)
   - Comprime para web

3. **Sube a `/public/assets/`:**
   ```bash
   cp gameplay.mp4 public/assets/
   cp poster.jpg public/assets/
   ```

4. **Verifica en local:**
   ```bash
   npm run dev
   # Abre http://localhost:5173
   ```

## Uso en la Landing

La landing page (`public/landing.html`) está configurada para:
- Intentar cargar `gameplay.mp4` automáticamente
- Mostrar placeholder si no existe
- Usar `poster.jpg` mientras carga
- Fallback elegante si hay error

## Optimización

**Para mejor performance:**
- Usa formato WebM además de MP4
- Implementa lazy loading
- Considera CDN para assets grandes

**Múltiples formatos:**
```html
<video>
  <source src="/assets/gameplay.webm" type="video/webm">
  <source src="/assets/gameplay.mp4" type="video/mp4">
</video>
```

## Ejemplo de Captura en Android

```bash
# Conecta dispositivo via ADB
adb devices

# Graba 10 segundos de pantalla
adb shell screenrecord --time-limit 10 /sdcard/gameplay.mp4

# Descarga el video
adb pull /sdcard/gameplay.mp4 .

# Procesa con FFmpeg
ffmpeg -i gameplay.mp4 -vf "scale=720:1280" -c:v libx264 -crf 28 -t 8 public/assets/gameplay.mp4
```

## Estado Actual

🟡 **Placeholder activo** - La landing muestra un placeholder mientras se agregan los assets reales.

Para activar el video:
1. Agrega `gameplay.mp4` a `public/assets/`
2. Agrega `poster.jpg` a `public/assets/`
3. El video se cargará automáticamente
