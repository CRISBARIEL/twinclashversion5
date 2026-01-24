# Integración de TikTok Business SDK - Completada

## Estado: FUNCIONAL

### Componentes Implementados

#### 1. Plugin Nativo (Android)
- `TikTokPlugin.java` - Plugin de Capacitor para eventos de TikTok
- Métodos disponibles:
  - `trackEvent(eventName, properties)` - Evento personalizado
  - `trackPurchase(currency, value, contentId)` - Compras
  - `trackRegistration(method)` - Registro de usuario
  - `trackLevelComplete(level)` - Nivel completado
  - `trackContentView(contentType, contentId)` - Vista de contenido

#### 2. Inicialización del SDK
- `MainActivity.java` actualizado con inicialización de TikTok SDK
- SDK configurado en modo producción (`false` en debug)
- GDPR consent activado por defecto
- Plugin registrado en el bridge de Capacitor

#### 3. Servicio TypeScript
- `src/lib/tiktok.ts` - Servicio completo para eventos
- Funciones helper específicas para el juego:
  - `trackTikTokLevelComplete(level)` - Al completar nivel
  - `trackTikTokGameStart(worldId, levelId)` - Al iniciar juego
  - `trackTikTokPurchase(currency, value, contentId)` - Al comprar monedas
  - `trackTikTokShopView()` - Al abrir tienda
  - `trackTikTokWorldUnlock(worldId)` - Al desbloquear mundo

#### 4. Integración en Componentes
- **GameCore.tsx**: Tracking de nivel completado y juego iniciado
- **CoinShop.tsx**: Tracking de compras y vista de tienda
- **WorldMap.tsx**: Tracking de mundos desbloqueados

---

## Eventos Rastreados

### Eventos del Juego
| Evento | Cuándo se dispara | Datos |
|--------|------------------|-------|
| `GameStart` | Al iniciar un nivel | world_id, level_id |
| `AchieveLevel` | Al completar un nivel | level, success |
| `WorldUnlock` | Al comprar/desbloquear mundo | world_id |

### Eventos de Monetización
| Evento | Cuándo se dispara | Datos |
|--------|------------------|-------|
| `Purchase` | Compra exitosa de monedas | currency, value, content_id |
| `ViewContent` | Vista de tienda | content_type, content_id |

---

## Configuración Requerida

### IMPORTANTE: Reemplazar App ID

En `MainActivity.java` línea ~24, reemplaza:
```java
config.put("app_id", "YOUR_TIKTOK_APP_ID");
config.put("tiktok_app_id", "YOUR_TIKTOK_APP_ID");
```

Con tu ID real de TikTok for Business.

### Cómo Obtener tu TikTok App ID

1. Ve a [TikTok for Business](https://business.tiktok.com/)
2. Inicia sesión
3. Ve a "Events Manager"
4. Selecciona tu app o crea una nueva
5. Copia el "App ID"
6. Pega el ID en `MainActivity.java`

---

## Verificación

### 1. Compilar y Ejecutar

```bash
npm run android:sync
npm run android:open
```

En Android Studio:
- Busca logs con `[TikTok]` en Logcat
- Deberías ver: "TikTok SDK initialized successfully"

### 2. Probar Eventos

1. Inicia un nivel → Busca "TikTok event tracked: GameStart"
2. Completa un nivel → Busca "TikTok event tracked: AchieveLevel"
3. Abre la tienda → Busca "TikTok event tracked: ViewContent"

### 3. TikTok Events Manager

- Abre TikTok for Business
- Ve a Events Manager
- Selecciona "Test Events"
- Los eventos deberían aparecer en 2-5 minutos

---

## Modo Producción vs Debug

Actualmente configurado en **modo producción**:
```java
TikTokBusinessSdk.initialize(context, config, false);
```

Para activar logs detallados durante desarrollo:
```java
TikTokBusinessSdk.initialize(context, config, true);
```

---

## Eventos Disponibles para Campañas

Los eventos implementados permiten optimizar campañas de TikTok para:

- **Instalación de App**: Tracking automático por TikTok SDK
- **Completar Niveles**: Optimizar para usuarios activos
- **Compras**: Optimizar para monetización
- **Engagement**: Tracking de inicio de juego y vistas

---

## Próximos Pasos Opcionales

### 1. Identificación de Usuarios
Si implementas autenticación, puedes identificar usuarios:

```java
import com.tiktok.appevents.TTPIdentifyHandler;

TTPIdentifyHandler.identify(
    userId,      // Tu ID interno
    null,        // phone_number (hash SHA256)
    null         // email (hash SHA256)
);
```

### 2. Más Eventos Personalizados
Agregar tracking en más puntos:
- `trackTikTokEvent('PowerUpUsed', { power_up: 'time_freeze' })`
- `trackTikTokEvent('AdWatched', { ad_type: 'rewarded' })`
- `trackTikTokEvent('ShareGame', { platform: 'whatsapp' })`

---

## Archivos Modificados

```
android/app/src/main/java/com/twinclash/game/
├── TikTokPlugin.java (NUEVO)
└── MainActivity.java (MODIFICADO)

src/
├── lib/
│   └── tiktok.ts (NUEVO)
└── components/
    ├── GameCore.tsx (MODIFICADO)
    ├── CoinShop.tsx (MODIFICADO)
    └── WorldMap.tsx (MODIFICADO)
```

---

## Checklist Final

- [x] Dependencias instaladas (gradle)
- [x] ProGuard configurado
- [x] Plugin nativo creado
- [x] SDK inicializado
- [x] Servicio TypeScript creado
- [x] Eventos integrados en componentes
- [ ] **TikTok App ID configurado** (REQUERIDO)
- [ ] Eventos probados en dispositivo
- [ ] Eventos verificados en TikTok Events Manager

---

## Soporte

Si tienes problemas:

1. Verifica que el App ID sea correcto
2. Revisa los logs en Logcat con filtro `[TikTok]`
3. Asegúrate de que el dispositivo tenga internet
4. Espera 2-5 minutos para que aparezcan en TikTok Events Manager
5. Consulta `TIKTOK_SDK_SETUP.md` para troubleshooting detallado

---

**Estado**: La integración está completa y lista para usar. Solo falta configurar el TikTok App ID real.
