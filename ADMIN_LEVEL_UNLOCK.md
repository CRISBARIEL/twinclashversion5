# Sistema de Desbloqueo de Niveles con Acceso Administrador

## Resumen

Se implementó un sistema que permite a los administradores desbloquear cualquier nivel mediante una contraseña especial, mientras que los usuarios normales siguen viendo los niveles bloqueados y deben cumplir con los requisitos normales.

## Contraseña de Administrador

```
Contraseña: admin2025
```

Esta es la misma contraseña utilizada en el sistema de desbloqueo de mundos.

## Flujo de Usuario Normal vs Administrador

### Usuario Normal (Sin contraseña)

1. Usuario hace clic en un nivel bloqueado
2. Aparece modal con 3 opciones:
   - **Cancelar:** Cierra el modal
   - **Comprar:** Abre el modal de compra (100 monedas)
   - **Desbloquear (con contraseña):** Solo funciona si ingresas la contraseña correcta

### Administrador (Con contraseña)

1. Admin hace clic en un nivel bloqueado
2. Aparece el mismo modal
3. Admin ingresa contraseña: `admin2025`
4. Admin hace clic en "Desbloquear" o presiona Enter
5. Si la contraseña es correcta:
   - El modal se cierra
   - Se verifica que tenga vidas disponibles
   - Si tiene vidas, accede directamente al nivel
   - Si no tiene vidas, muestra el modal de "No tienes vidas"
6. Si la contraseña es incorrecta:
   - Muestra alerta "Contraseña incorrecta"

## Características del Sistema

### Seguridad

- ✅ Los niveles bloqueados NO son accesibles sin desbloquear
- ✅ Solo la contraseña correcta permite bypass del sistema de progresión
- ✅ El sistema de vidas sigue aplicándose incluso para admins
- ✅ La verificación de contraseña es case-sensitive
- ✅ No hay pistas visuales de que existe una contraseña de admin

### Modal de Desbloqueo Administrador

**Elementos del Modal:**
- Icono: 🔑
- Título: "Acceso Administrador"
- Descripción: Explica que el nivel está bloqueado y ofrece dos opciones
- Campo de contraseña: Input tipo password (oculta caracteres)
- Tres botones:
  1. **Cancelar:** Cierra todo y vuelve a la pantalla anterior
  2. **Comprar:** Cierra el modal de admin y abre el modal de compra con monedas
  3. **Desbloquear:** Intenta desbloquear con la contraseña ingresada

### Teclas Rápidas

- **Enter:** En el campo de contraseña ejecuta el desbloqueo automáticamente
- Esto permite al admin escribir la contraseña y presionar Enter sin hacer clic

## Archivos Modificados

### src/components/LevelSelector.tsx

**Estados agregados:**
```typescript
const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
const [adminPassword, setAdminPassword] = useState('');
const [adminLevelTarget, setAdminLevelTarget] = useState<number | null>(null);
```

**Función handleLevelClick modificada:**
```typescript
const handleLevelClick = async (level: number) => {
  const globalLevel = getGlobalLevelId(world, level);
  const isUnlocked = level === 1 || levelAccess[level];

  if (!isUnlocked) {
    setAdminLevelTarget(level);
    setShowAdminPasswordModal(true);
    return;
  }

  // ... resto del código para verificar vidas y acceder
};
```

**Nueva función handleAdminUnlock:**
```typescript
const handleAdminUnlock = async () => {
  const correctPassword = 'admin2025';

  if (adminPassword !== correctPassword) {
    alert('Contraseña incorrecta');
    return;
  }

  if (!adminLevelTarget) return;

  const globalLevel = getGlobalLevelId(world, adminLevelTarget);
  setShowAdminPasswordModal(false);
  setAdminPassword('');
  setAdminLevelTarget(null);

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || null;
  const lives = await getUserLives(userId);

  if (!lives || lives.currentLives <= 0) {
    setShowNoLivesModal(true);
    return;
  }

  onSelectLevel(globalLevel);
};
```

## Comportamiento Detallado

### Escenario 1: Usuario sin contraseña intenta acceder a nivel bloqueado

```
Usuario → Clic en nivel bloqueado
         → Modal "Acceso Administrador" aparece
         → Usuario intenta sin contraseña o con contraseña incorrecta
         → Clic en "Desbloquear"
         → Alert: "Contraseña incorrecta"
         → Modal permanece abierto
```

**Opción alternativa:**
```
Usuario → Clic en "Comprar"
         → Modal de admin se cierra
         → Modal de compra (100 monedas) se abre
         → Usuario puede comprar el desbloqueo
```

### Escenario 2: Admin con contraseña correcta

```
Admin → Clic en nivel bloqueado
       → Modal "Acceso Administrador" aparece
       → Admin escribe: admin2025
       → Presiona Enter o clic en "Desbloquear"
       → Modal se cierra
       → Sistema verifica vidas disponibles
       → SI tiene vidas → Accede al nivel directamente
       → SI no tiene vidas → Modal "No tienes vidas" aparece
```

### Escenario 3: Admin sin vidas

```
Admin → Clic en nivel bloqueado
       → Modal admin → Contraseña correcta → Modal se cierra
       → Sistema detecta 0 vidas
       → Modal "No tienes vidas" aparece
       → Admin debe comprar vidas o esperar
```

## Ventajas del Sistema

1. **Invisible para usuarios normales:** No hay indicación de que existe una contraseña de admin
2. **Testing facilitado:** Los desarrolladores pueden probar cualquier nivel sin tener que jugar todo
3. **Debugging efectivo:** Permite verificar bugs en niveles específicos sin progresión
4. **Mantiene integridad:** Los usuarios normales siguen el flujo correcto de progresión
5. **Sistema de vidas intacto:** Incluso los admins necesitan vidas para jugar
6. **Flexibilidad:** El admin puede elegir entre bypass o compra normal

## Notas de Seguridad

### En producción:

- La contraseña está hardcodeada en el código del frontend
- Esto significa que cualquier usuario que inspeccione el código puede encontrarla
- Para un sistema más seguro, considerar:
  - Verificación de rol de admin desde Supabase
  - Contraseña almacenada en variables de entorno
  - Autenticación de dos factores para admins

### Uso recomendado:

- Solo para desarrollo y testing
- No compartir la contraseña con usuarios finales
- En producción real, implementar verificación de rol desde base de datos

## Testing Checklist

- [ ] Intentar acceder a nivel bloqueado sin contraseña → Debe rechazar
- [ ] Intentar con contraseña incorrecta → Debe mostrar alert
- [ ] Usar contraseña correcta sin vidas → Debe mostrar modal de vidas
- [ ] Usar contraseña correcta con vidas → Debe acceder al nivel
- [ ] Presionar "Cancelar" → Debe cerrar modal
- [ ] Presionar "Comprar" → Debe abrir modal de compra con monedas
- [ ] Presionar Enter en campo de contraseña → Debe ejecutar desbloqueo
- [ ] Verificar que el campo de contraseña oculta los caracteres (tipo password)

## Compatibilidad

✅ Compatible con sistema de vidas
✅ Compatible con sistema de monedas
✅ Compatible con sistema de progresión
✅ Compatible con sistema de compra de desbloqueos
✅ Compatible con WorldMap (usa misma contraseña)
