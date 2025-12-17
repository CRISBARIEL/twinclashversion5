# Solución de Pagos en Producción - twinclash.org

## Problema Identificado

Tu proyecto usa **DOS URLs de Supabase diferentes**:
- **App (.env)**: `fdlqyqeobwumyjuqgrpl.supabase.co`
- **Docs de Stripe**: `jbqaznerntjlbdhcmodj.supabase.co`

Esto causa que los Edge Functions de pagos estén en un proyecto diferente.

---

## Solución Rápida (3 pasos)

### 1. Verificar qué proyecto de Supabase usar

Abre tu app en `https://twinclash.org`, abre la consola del navegador (F12) y ejecuta:

```javascript
console.log(localStorage.getItem('supabase.auth.token'))
```

Esto te dirá qué proyecto estás usando actualmente. El proyecto correcto es `fdlqyqeobwumyjuqgrpl`.

### 2. Configurar Secrets en Supabase

Ve al Dashboard de Supabase del proyecto correcto:
```
https://supabase.com/dashboard/project/fdlqyqeobwumyjuqgrpl/settings/functions
```

En **Settings → Edge Functions → Secrets**, añade estos 2 secrets:

#### Secret 1: STRIPE_SECRET_KEY
- **Nombre**: `STRIPE_SECRET_KEY`
- **Valor**: Tu clave secreta LIVE de Stripe (empieza con `sk_live_...`)
- Obtenerla en: https://dashboard.stripe.com/apikeys

#### Secret 2: STRIPE_WEBHOOK_SECRET
- **Nombre**: `STRIPE_WEBHOOK_SECRET`
- **Valor**: El signing secret del webhook (empieza con `whsec_...`)
- Obtenerlo en: https://dashboard.stripe.com/webhooks

### 3. Configurar Webhook en Stripe

Ve a https://dashboard.stripe.com/webhooks y:

1. **Si ya existe un webhook**, elimínalo
2. **Crea uno nuevo** con estos datos:
   - **Endpoint URL**: `https://fdlqyqeobwumyjuqgrpl.supabase.co/functions/v1/stripe-webhook`
   - **Eventos a escuchar**:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
3. **Copia el Signing Secret** y úsalo en el paso 2 arriba

---

## Cambios Realizados en el Código

He actualizado el Edge Function `create-checkout` para:
- Detectar correctamente el dominio de origen (`twinclash.org`)
- Usar el header `referer` como respaldo
- Logs mejorados para diagnosticar problemas

El Edge Function ya está desplegado en tu proyecto de Supabase.

---

## Verificar que Funciona

1. Ve a `https://twinclash.org`
2. Abre la consola (F12)
3. Intenta comprar un paquete de monedas
4. Verifica los logs en la consola:

```
=== INICIO DE COMPRA ===
Paquete seleccionado: {id: "small", coins: 1000, ...}
Client ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
URL: https://fdlqyqeobwumyjuqgrpl.supabase.co
Anon Key: Presente
========================
```

5. Si ves errores, revisa:
   - Logs de Supabase: https://supabase.com/dashboard/project/fdlqyqeobwumyjuqgrpl/functions
   - Logs de Stripe: https://dashboard.stripe.com/webhooks

---

## Tarjetas de Prueba Stripe

Para probar pagos **sin cobrar dinero real**:

- **Número**: `4242 4242 4242 4242`
- **Fecha**: Cualquier fecha futura (ej: 12/25)
- **CVC**: Cualquier 3 dígitos (ej: 123)

---

## Errores Comunes

### Error: "Stripe no está configurado"
- Los secrets no están configurados en Supabase
- Solución: Completa el paso 2 arriba

### Error: "Configuración de Stripe inválida"
- La clave no es válida o no es LIVE
- Solución: Verifica que sea `sk_live_...` en https://dashboard.stripe.com/apikeys

### Redirige a localhost después del pago
- El dominio no se detectó correctamente
- Solución: Verifica que estés accediendo desde `https://twinclash.org` (no `www.twinclash.org`)

### Las monedas no se añaden después del pago
- El webhook no está configurado o el secret es incorrecto
- Solución: Completa el paso 3 arriba y verifica los logs en Stripe

---

## Checklist Final

- [ ] Verificar que uso el proyecto `fdlqyqeobwumyjuqgrpl`
- [ ] Configurar `STRIPE_SECRET_KEY` en Supabase Secrets
- [ ] Configurar `STRIPE_WEBHOOK_SECRET` en Supabase Secrets
- [ ] Crear/actualizar webhook en Stripe con la URL correcta
- [ ] Probar pago con tarjeta de prueba
- [ ] Verificar que las monedas se añaden correctamente

Una vez completados todos los pasos, los pagos deberían funcionar perfectamente en producción.
