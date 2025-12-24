# 🚀 Desplegar Twin Clash en Vercel (Modo Producción)

## ✅ ESTADO ACTUAL

Tu código de AdMob está en modo **PRODUCCIÓN** y listo para desplegar.

**Importante:** En Vercel (web), los anuncios de AdMob se **simularán** porque AdMob solo funciona en apps nativas (Android/iOS). Esto es normal y esperado.

---

## 📋 PASOS PARA DESPLEGAR EN VERCEL

### Opción 1: Despliegue Automático (Git conectado a Vercel)

Si tu repositorio ya está conectado a Vercel:

```bash
# 1. Commit los cambios
git add .
git commit -m "AdMob modo producción activado - IDs reales configurados"

# 2. Push al repositorio
git push origin main
```

**¡Listo!** Vercel detectará el push y desplegará automáticamente en 1-2 minutos.

---

### Opción 2: Despliegue Manual con Vercel CLI

Si no tienes Git conectado:

```bash
# 1. Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# 2. Login en Vercel
vercel login

# 3. Build local
npm run build

# 4. Deploy a producción
vercel --prod
```

Sigue las instrucciones en pantalla.

---

## 🌐 QUÉ ESPERAR EN VERCEL (WEB)

### Comportamiento en Navegador:

✅ **Funciona:**
- Tu juego completo
- Sistema de monedas
- Leaderboards
- Progresión de niveles
- Todo Supabase

⚠️ **Anuncios Simulados:**
- El botón "Ver Anuncio" funciona
- Se muestra un loading de 2 segundos
- Las +1000 monedas se otorgan automáticamente
- NO se muestran anuncios reales de Google
- NO genera ingresos (normal para web)

**Logs en consola:**
```
[AdMob] Not running on native platform - ads will be simulated
[AdMob] Simulating rewarded ad (web mode)
[AdMob] Simulated reward granted: +1000 coins
```

Esto es **correcto y esperado** para web.

---

## 💸 PARA GENERAR INGRESOS REALES

Los ingresos reales de AdMob solo vienen de apps Android/iOS.

### Compilar App Android:

```bash
# 1. Build del proyecto
npm run build

# 2. Sincronizar con Android
npm run android:sync

# 3. Compilar para producción
npm run android:bundle
```

### Configurar AndroidManifest.xml:

Edita: `android/app/src/main/AndroidManifest.xml`

```xml
<application>
    <!-- USA TU APP ID REAL -->
    <meta-data
        android:name="com.google.android.gms.ads.APPLICATION_ID"
        android:value="ca-app-pub-2140112688604592~TU_APP_ID_REAL"/>
</application>
```

Tu App ID real termina en `~XXXXX` y lo encuentras en [AdMob Dashboard](https://apps.admob.com/).

### Publicar:

1. Firma el AAB con tu keystore
2. Sube a Google Play Console
3. Publica la app
4. Los usuarios verán anuncios reales
5. Empezarás a ganar dinero

---

## ✅ VERIFICAR EL DESPLIEGUE

### En Vercel (Web):

1. Ve a tu URL de Vercel (ej: `twinclash.vercel.app`)
2. Abre la consola del navegador (F12)
3. Navega por el juego
4. Click en "Ver Anuncio"
5. Verás en consola:
   ```
   [AdMob] Simulating rewarded ad (web mode)
   [AdMob] Simulated reward granted: +1000 coins, total: 1000
   ```
6. Las monedas se otorgarán después de 2 segundos

**Si ves esto:** ✅ Todo funciona correctamente.

---

## 🔍 VERIFICAR VARIABLES DE ENTORNO

Asegúrate de que Vercel tenga tus variables de entorno:

1. Ve a [vercel.com](https://vercel.com/)
2. Selecciona tu proyecto "Twin Clash"
3. Settings → Environment Variables
4. Verifica que existan:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon
```

Si faltan, agrégalas y redeploya:
```bash
vercel --prod
```

---

## 📱 URL DE TU JUEGO

Después de desplegar, tu juego estará disponible en:

- **Producción:** `https://twinclash.vercel.app` (o tu dominio custom)
- **Preview:** `https://twinclash-[hash].vercel.app`

Comparte la URL de producción con tus usuarios.

---

## 🎮 EXPERIENCIA DE USUARIO EN WEB

### Lo que tus usuarios verán:

1. **Juego completo funcional**
   - Todos los niveles
   - Sistema de monedas
   - Leaderboards
   - Progresión guardada

2. **Botón "Ver Anuncio"**
   - Click → Loading 2 segundos
   - +1000 monedas otorgadas
   - No se ve anuncio real (simulado)

3. **Perfecto para:**
   - Demo del juego
   - Probar funcionalidad
   - Compartir con beta testers
   - Desarrollo y testing

---

## 💡 ESTRATEGIA RECOMENDADA

### Para Máximos Ingresos:

1. **Vercel (Web) - Gratis:**
   - Demo y marketing
   - Pruebas de funcionalidad
   - Captar interés de usuarios
   - Link en redes sociales

2. **App Android - Monetización:**
   - Sube a Google Play Store
   - Aquí sí generas ingresos con AdMob
   - Promociona la app desde la web
   - CTA: "Descarga la app para más funciones"

3. **Híbrido:**
   - Web: Demo gratis sin anuncios reales
   - App: Versión completa con anuncios monetizados
   - Mejores usuarios descargan la app

---

## 🔄 ACTUALIZAR DESPLIEGUE

Cuando hagas cambios:

```bash
# Commit
git add .
git commit -m "Tu mensaje"

# Push (si está conectado a Vercel)
git push origin main

# O manual
npm run build
vercel --prod
```

Vercel desplegará la nueva versión automáticamente.

---

## 📊 MONITOREO

### Analytics de Vercel:

1. Ve a [vercel.com](https://vercel.com/)
2. Selecciona tu proyecto
3. Analytics
4. Verás:
   - Visitas
   - Tiempo de carga
   - Errores

### Analytics de AdMob:

En web: No aplica (anuncios simulados)
En app: [apps.admob.com](https://apps.admob.com/)

---

## 🆘 PROBLEMAS COMUNES

### "Configuración Incompleta" en Vercel

**Causa:** Faltan variables de entorno
**Solución:**
1. Vercel → Settings → Environment Variables
2. Agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
3. Redeploy

### Build falla en Vercel

**Causa:** Error en el código
**Solución:**
```bash
# Prueba build local primero
npm run build

# Si funciona local pero falla en Vercel:
# - Verifica Node version en Vercel (debe ser 18+)
# - Settings → General → Node.js Version
```

### Anuncios no aparecen

**En web:** Normal, se simulan
**En app:** Verifica AndroidManifest.xml y IDs

---

## ✅ CHECKLIST DE DESPLIEGUE

Antes de desplegar:

- [x] Código en modo producción ✅
- [x] Build local exitoso ✅
- [ ] Variables de entorno en Vercel configuradas
- [ ] Git repository actualizado
- [ ] Commit y push realizados
- [ ] Vercel desplegó correctamente
- [ ] URL de producción funciona
- [ ] Anuncios se simulan en web (esperado)
- [ ] Sistema de monedas funciona
- [ ] Leaderboards cargan

---

## 🎯 PRÓXIMOS PASOS

### Después de desplegar en Vercel:

1. **Comparte la URL** con beta testers
2. **Recopila feedback** sobre el gameplay
3. **Compila la app Android** para monetización
4. **Sube a Google Play Store**
5. **Promociona** en redes sociales

### Para Monetización:

La monetización real viene de la app Android/iOS:
```bash
npm run android:bundle
```

---

## 📞 SOPORTE

### Enlaces Útiles:

- [Vercel Dashboard](https://vercel.com/)
- [Vercel Docs](https://vercel.com/docs)
- [AdMob Dashboard](https://apps.admob.com/)
- [Supabase Dashboard](https://supabase.com/dashboard)

### Logs:

```bash
# Ver logs de Vercel
vercel logs <url-del-deployment>

# Ver build logs
# Directo en Vercel Dashboard → Deployments → Click deployment → View Function Logs
```

---

## 🎉 RESUMEN

| Plataforma | Anuncios | Ingresos | Uso |
|------------|----------|----------|-----|
| **Vercel (Web)** | Simulados | No | Demo, Testing, Marketing |
| **App Android** | Reales | Sí | Monetización, Usuarios finales |
| **App iOS** | Reales | Sí | Monetización, Usuarios finales |

---

## 💰 ESTRATEGIA DE INGRESOS

```
Usuario ve web (Vercel)
    ↓
Se interesa en el juego
    ↓
Descarga app desde Google Play
    ↓
Usa app con anuncios reales
    ↓
Generas ingresos con AdMob
```

La web es tu **escaparate**, la app es tu **monetización**.

---

**¡Tu Twin Clash está listo para desplegar en Vercel en modo producción!** 🚀

**Comando rápido:**
```bash
git add . && git commit -m "AdMob producción activado" && git push origin main
```

Si usas Vercel con Git, ¡eso es todo lo que necesitas! 🎉
