# Configuración Final de Pagos - twinclash.org

## Proyecto de Supabase Correcto

**URL del proyecto**: `https://jbqaznerntjlbdhcmodj.supabase.co`

Todas las referencias incorrectas a `fdlqyqeobwumyjuqgrpl` han sido eliminadas del proyecto.

---

## Pasos para Activar los Pagos

### 1. Configurar Secrets en Supabase

Accede a tu Dashboard de Supabase:
```
https://supabase.com/dashboard/project/jbqaznerntjlbdhcmodj/settings/functions
```

Ve a **Settings → Edge Functions → Secrets** y añade:

#### Secret 1: STRIPE_SECRET_KEY
- **Nombre**: `STRIPE_SECRET_KEY`
- **Valor**: Tu clave secreta LIVE de Stripe (empieza con `sk_live_...`)
- **Dónde obtenerla**: https://dashboard.stripe.com/apikeys

#### Secret 2: STRIPE_WEBHOOK_SECRET
- **Nombre**: `STRIPE_WEBHOOK_SECRET`
- **Valor**: El signing secret del webhook (empieza con `whsec_...`)
- **Dónde obtenerlo**: Lo obtienes en el paso 2

---

### 2. Configurar Webhook en Stripe

Accede a: https://dashboard.stripe.com/webhooks

**Si ya existe un webhook**:
1. Verifica que la URL sea: `https://jbqaznerntjlbdhcmodj.supabase.co/functions/v1/stripe-webhook`
2. Si la URL es diferente, elimina ese webhook y crea uno nuevo

**Crear nuevo webhook**:
1. Haz clic en "Add endpoint"
2. **Endpoint URL**: `https://jbqaznerntjlbdhcmodj.supabase.co/functions/v1/stripe-webhook`
3. **Eventos a seleccionar**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Haz clic en "Add endpoint"
5. **IMPORTANTE**: Copia el "Signing secret" (whsec_...) y añádelo en el paso 1 como `STRIPE_WEBHOOK_SECRET`

---

### 3. Probar el Sistema

1. Ve a: `https://twinclash.org`
2. Abre la tienda de monedas
3. Selecciona un paquete
4. Haz clic en "Pagar"

**Tarjetas de prueba** (no cobran dinero real):
- **Número**: `4242 4242 4242 4242`
- **Fecha**: Cualquier fecha futura (ej: 12/25)
- **CVC**: Cualquier 3 dígitos (ej: 123)

---

## Estado Actual del Código

### Lo que ya está listo:

1. **Edge Functions desplegadas**:
   - `create-checkout` - Crea sesiones de pago
   - `stripe-webhook` - Procesa pagos completados

2. **Código actualizado**:
   - URL de Supabase corregida a `jbqaznerntjlbdhcmodj`
   - Detección correcta del dominio `twinclash.org`
   - Logs de diagnóstico mejorados

3. **Frontend listo**:
   - Tienda de monedas funcional
   - Integración con Stripe Checkout
   - Manejo de éxito/cancelación

### Lo que necesitas configurar (manualmente):

1. Los 2 secrets en Supabase (paso 1)
2. El webhook en Stripe (paso 2)

---

## Verificación de Logs

### Logs en el navegador:
Abre la consola (F12) y verás:
```
=== INICIO DE COMPRA ===
Paquete seleccionado: {id: "small", coins: 1000, price: 0.99}
Client ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
URL: https://jbqaznerntjlbdhcmodj.supabase.co
Anon Key: Presente
========================
```

### Logs en Supabase:
Ve a: https://supabase.com/dashboard/project/jbqaznerntjlbdhcmodj/functions

Deberías ver logs como:
```
=== CREATE CHECKOUT SESSION ===
Stripe Key Present: true
Stripe Key Type: sk_live
✅ Stripe configured with LIVE key
Creating checkout session...
Origin: https://twinclash.org
Base URL used: https://twinclash.org
✅ Checkout session created successfully
```

### Logs en Stripe:
Ve a: https://dashboard.stripe.com/webhooks

En tu webhook verás eventos como:
- `checkout.session.completed` - Cuando se completa un pago
- `payment_intent.succeeded` - Cuando el pago es exitoso

---

## Problemas Comunes

### "Stripe no está configurado"
**Causa**: El secret `STRIPE_SECRET_KEY` no está configurado en Supabase
**Solución**: Completa el paso 1

### "Las monedas no se añaden"
**Causa**: El webhook no está configurado o el `STRIPE_WEBHOOK_SECRET` es incorrecto
**Solución**: Completa el paso 2 y verifica que el secret sea correcto

### "Redirige a localhost"
**Causa**: Estás probando desde localhost en vez de producción
**Solución**: Prueba desde `https://twinclash.org` directamente

---

## Checklist Final

- [ ] `STRIPE_SECRET_KEY` añadida en Supabase Secrets
- [ ] Webhook creado/actualizado en Stripe con URL correcta
- [ ] `STRIPE_WEBHOOK_SECRET` añadida en Supabase Secrets
- [ ] Prueba de pago realizada con tarjeta de prueba
- [ ] Monedas se añaden correctamente después del pago

Una vez completados todos los pasos, el sistema de pagos estará 100% funcional en producción.
