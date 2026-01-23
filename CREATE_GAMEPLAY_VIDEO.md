# Cómo Crear el Video de Gameplay para la Landing

## Método 1: Captura desde Android (Recomendado)

### Opción A: Desde el Dispositivo

1. **Abre Twin Clash en tu dispositivo Android**

2. **Inicia la grabación de pantalla:**
   - Desliza desde arriba para abrir el panel de notificaciones
   - Busca "Grabador de pantalla" o "Screen recorder"
   - Pulsa para iniciar
   - Acepta permisos

3. **Juega un nivel completo (5-10 segundos):**
   - Muestra el inicio del nivel
   - Empareja algunas cartas
   - Muestra efectos y animaciones
   - Termina con victoria

4. **Detén la grabación:**
   - Desliza desde arriba
   - Pulsa "Detener"

5. **Transfiere el video a tu PC:**
   ```bash
   # Via USB
   adb pull /sdcard/Movies/ScreenRecorder/video.mp4 gameplay_raw.mp4

   # O envíalo por email/drive/telegram
   ```

### Opción B: Desde ADB (Más Control)

```bash
# 1. Conecta dispositivo
adb devices

# 2. Inicia la app
adb shell am start -n com.twinclash.game/.MainActivity

# 3. Graba 10 segundos
adb shell screenrecord --time-limit 10 --bit-rate 8000000 /sdcard/gameplay_raw.mp4

# 4. Durante esos 10 segundos: juega un nivel en el dispositivo

# 5. Descarga el video
adb pull /sdcard/gameplay_raw.mp4 .

# 6. Limpia
adb shell rm /sdcard/gameplay_raw.mp4
```

## Método 2: Captura desde Emulador

### Android Studio Emulator

1. **Abre Android Studio**
2. **Inicia el emulador**
3. **En la barra lateral del emulador:**
   - Clic en "..." (More)
   - Screen record
   - Start recording
4. **Juega el nivel**
5. **Stop recording**
6. **El video se guarda automáticamente**

### Scrcpy (Recomendado para mejor calidad)

```bash
# 1. Instala scrcpy
# macOS
brew install scrcpy

# Ubuntu/Debian
apt install scrcpy

# Windows: descarga desde GitHub

# 2. Conecta dispositivo
adb devices

# 3. Inicia scrcpy con grabación
scrcpy --record gameplay_raw.mp4 --max-fps 30

# 4. Juega el nivel
# 5. Ctrl+C para detener
```

## Paso 2: Procesar el Video

Una vez tengas `gameplay_raw.mp4`, procesalo:

### Script Automático (Recomendado)

Crea un archivo `process-video.sh`:

```bash
#!/bin/bash

INPUT="gameplay_raw.mp4"
OUTPUT="public/assets/gameplay.mp4"
POSTER="public/assets/poster.jpg"

# Verificar que existe FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg no está instalado"
    echo "Instala con: brew install ffmpeg (macOS) o apt install ffmpeg (Linux)"
    exit 1
fi

# Verificar que existe el video
if [ ! -f "$INPUT" ]; then
    echo "❌ No se encuentra $INPUT"
    exit 1
fi

# Crear directorio
mkdir -p public/assets

echo "🎬 Procesando video..."

# Procesar video
ffmpeg -i "$INPUT" \
  -vf "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,setsar=1" \
  -c:v libx264 \
  -crf 28 \
  -preset slow \
  -movflags +faststart \
  -an \
  -t 8 \
  "$OUTPUT" \
  -y

if [ $? -eq 0 ]; then
    echo "✅ Video creado: $OUTPUT"

    # Crear poster
    echo "📸 Creando poster..."
    ffmpeg -i "$OUTPUT" \
      -ss 00:00:02 \
      -frames:v 1 \
      -q:v 2 \
      "$POSTER" \
      -y

    if [ $? -eq 0 ]; then
        echo "✅ Poster creado: $POSTER"

        # Mostrar tamaños
        echo ""
        echo "📊 Tamaños:"
        ls -lh "$OUTPUT" "$POSTER" | awk '{print $5, $9}'

        echo ""
        echo "✅ ¡Todo listo! Haz commit y push para desplegar"
    else
        echo "❌ Error creando poster"
        exit 1
    fi
else
    echo "❌ Error procesando video"
    exit 1
fi
```

Ejecútalo:

```bash
chmod +x process-video.sh
./process-video.sh
```

### Comandos Manuales

Si prefieres hacerlo paso a paso:

#### 1. Convertir a vertical optimizado

```bash
ffmpeg -i gameplay_raw.mp4 \
  -vf "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,setsar=1" \
  -c:v libx264 \
  -crf 28 \
  -preset slow \
  -movflags +faststart \
  -an \
  -t 8 \
  public/assets/gameplay.mp4
```

**Explicación de parámetros:**
- `scale=720:1280` - Resolución vertical
- `force_original_aspect_ratio=decrease` - Mantiene aspecto original
- `pad` - Agrega padding negro si es necesario
- `crf 28` - Compresión (18-28 es buen rango)
- `preset slow` - Mejor compresión
- `movflags +faststart` - Optimiza para streaming web
- `-an` - Sin audio
- `-t 8` - Duración 8 segundos

#### 2. Crear poster (thumbnail)

```bash
ffmpeg -i public/assets/gameplay.mp4 \
  -ss 00:00:02 \
  -frames:v 1 \
  -q:v 2 \
  public/assets/poster.jpg
```

**Explicación:**
- `-ss 00:00:02` - Frame a los 2 segundos
- `-frames:v 1` - Solo 1 frame
- `-q:v 2` - Alta calidad (1-5)

#### 3. Verificar tamaños

```bash
ls -lh public/assets/
```

**Tamaños objetivo:**
- `gameplay.mp4`: < 2MB
- `poster.jpg`: < 100KB

Si el video es muy grande:

```bash
# Aumentar compresión (crf más alto = más compresión)
ffmpeg -i gameplay_raw.mp4 \
  -vf "scale=720:1280" \
  -c:v libx264 \
  -crf 32 \
  -preset slow \
  -an \
  -t 8 \
  public/assets/gameplay.mp4
```

## Método 3: Crear GIF (Alternativa)

Si prefieres GIF en lugar de video:

```bash
# Crear GIF optimizado
ffmpeg -i gameplay_raw.mp4 \
  -vf "fps=15,scale=360:640:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  -t 5 \
  public/assets/gameplay.gif
```

Para usar el GIF, edita `public/landing.html`:

```html
<!-- Reemplaza el <video> con -->
<img class="tc-gif" src="/assets/gameplay.gif" alt="Twin Clash gameplay" />
```

## Verificar Resultado

### 1. Build local

```bash
npm run build
npm run preview
```

### 2. Abre en navegador

```
http://localhost:4173/
```

### 3. Verifica:
- ✅ El video se reproduce automáticamente
- ✅ Está muted (sin audio)
- ✅ Hace loop continuo
- ✅ Carga rápido (< 2 segundos)
- ✅ Se ve bien en móvil

## Desplegar

```bash
git add public/assets/gameplay.mp4 public/assets/poster.jpg
git commit -m "feat: add gameplay video to landing page"
git push
```

Netlify desplegará automáticamente.

## Tips de Grabación

### Qué Mostrar
- ✅ Inicio de nivel (cartas volteándose)
- ✅ Emparejamiento de 2-3 pares
- ✅ Efectos de match
- ✅ Contador de tiempo
- ✅ Algún power-up si es posible
- ✅ Victoria/confetti si da tiempo

### Qué Evitar
- ❌ Movimientos muy rápidos (confuso)
- ❌ Pausas largas (aburrido)
- ❌ Errores o fallos (no profesional)
- ❌ Texto muy pequeño (ilegible en móvil)

### Consejos
1. Graba en vertical (9:16) desde el inicio
2. Usa un dispositivo con buena resolución
3. Graba 2-3 veces y elige la mejor
4. Asegúrate de que se vea el branding (logo)
5. Mantén el dedo fuera de la toma si es posible

## Solución de Problemas

### "FFmpeg no instalado"

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
- Descarga desde: https://ffmpeg.org/download.html
- O usa Chocolatey: `choco install ffmpeg`

### "Video muy grande (> 2MB)"

Aumenta la compresión:
```bash
# CRF más alto = más compresión
ffmpeg -i gameplay_raw.mp4 -crf 32 -t 8 public/assets/gameplay.mp4
```

### "Video muy pixelado"

Reduce la compresión:
```bash
# CRF más bajo = menos compresión = mejor calidad
ffmpeg -i gameplay_raw.mp4 -crf 23 -t 8 public/assets/gameplay.mp4
```

### "No se reproduce en iOS"

Asegúrate de usar `movflags +faststart`:
```bash
ffmpeg -i input.mp4 -movflags +faststart output.mp4
```

## Recursos Adicionales

- [FFmpeg Docs](https://ffmpeg.org/documentation.html)
- [Video Optimization Guide](https://web.dev/video-optimization/)
- [Scrcpy GitHub](https://github.com/Genymobile/scrcpy)

## Checklist Final

Antes de hacer push:

- [ ] Video existe en `public/assets/gameplay.mp4`
- [ ] Poster existe en `public/assets/poster.jpg`
- [ ] Video es < 2MB
- [ ] Video es 720x1280 (9:16)
- [ ] Video dura 5-8 segundos
- [ ] Se reproduce en Chrome/Firefox/Safari
- [ ] Se ve bien en móvil
- [ ] Landing page funciona en `/`
- [ ] App web funciona en `/app`
