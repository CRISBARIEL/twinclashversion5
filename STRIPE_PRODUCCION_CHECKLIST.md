# ✅ Checklist de Configuración de Stripe en Producción

## 🎯 Objetivo
Resolver el problema de pagos en producción verificando claves y desvinculando cuentas rechazadas.

---

## 📋 Tareas a Realizar

### 1️⃣ Desvincular Cuenta Rechazada de Stripe Connect

**Cuenta a desvincular:** `acct_15PGhS5c6G2u5pMf` (Cristian Ariel Bardi Sanchez)

**Método 1: Usando la herramienta web (RECOMENDADO)**
1. Abre el archivo `disconnect-stripe-account.html` en tu navegador
2. Verifica que el Account ID sea: `acct_15PGhS5c6G2u5pMf`
3. Ingresa la clave admin (por defecto: `twinclash-admin-2024`)
4. Haz clic en "Desvincular Cuenta"
5. Espera la confirmación ✅

**Método 2: Desde el Dashboard de Stripe**
1. Ve a [Stripe Dashboard > Connect > Accounts](https://dashboard.stripe.com/connect/accounts/overview)
2. Busca la cuenta `acct_15PGhS5c6G2u5pMf`
3. Haz clic en los tres puntos (⋮) > "Delete account"
4. Confirma la acción

---

### 2️⃣ Verificar Variables de Entorno en Vercel

**Variables requeridas en Vercel:**

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe | [Stripe Dashboard > Developers > API Keys](https://dashboard.stripe.com/apikeys) |

**Pasos:**
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto TwinClash
3. Ve a **Settings > Environment Variables**
4. Verifica que `STRIPE_SECRET_KEY` exista y contenga el valor correcto
5. La clave debe terminar en `...oXLo` (tu clave permanente)

**Si necesitas actualizar:**
1. Haz clic en el botón de editar (✏️)
2. Pega el valor correcto
3. Guarda los cambios
4. **IMPORTANTE:** Redeploy tu aplicación para que tome efecto

---

### 3️⃣ Verificar Variables de Entorno en Supabase

**Variables requeridas en Supabase:**

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe | [Stripe Dashboard > Developers > API Keys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret del webhook | [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks) |

**Pasos:**
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto `jbqaznerntjlbdhcmodj`
3. Ve a **Settings > Edge Functions > Secrets**
4. Verifica que ambas variables existan:
   - ✅ `STRIPE_SECRET_KEY` (la que termina en `...oXLo`)
   - ✅ `STRIPE_WEBHOOK_SECRET` (el Signing Secret de tu webhook)

**Si necesitas actualizar:**
1. Haz clic en "Add secret" o edita la existente
2. Pega el valor correcto
3. Guarda los cambios

---

### 4️⃣ Verificar Configuración del Webhook en Stripe

**Endpoint del webhook en producción:**
```
https://jbqaznerntjlbdhcmodj.supabase.co/functions/v1/stripe-webhook
```

**Eventos requeridos:**
- ✅ `checkout.session.completed`
- ✅ `payment_intent.succeeded`

**Pasos:**
1. Ve a [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Busca el webhook con el endpoint de producción
3. Verifica que los eventos estén habilitados
4. **COPIA el Signing Secret** (comienza con `whsec_...`)
5. Asegúrate de que este valor esté en Supabase como `STRIPE_WEBHOOK_SECRET`

---

### 5️⃣ Probar el Flujo de Pago

Una vez completados los pasos anteriores:

1. Ve a tu app en producción: `https://tudominio.com`
2. Abre la Tienda
3. Intenta comprar un paquete de monedas
4. Usa una tarjeta de prueba de Stripe:
   - Número: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos
5. Completa el pago
6. Verifica que las monedas se agreguen a tu cuenta

---

## 🔍 Diagnóstico de Problemas

### Si el pago no se completa:
1. Revisa los logs en Vercel: [Vercel Dashboard > Deployments > Functions](https://vercel.com/dashboard)
2. Revisa los logs en Supabase: [Supabase Dashboard > Edge Functions > Logs](https://supabase.com/dashboard)
3. Revisa los webhooks en Stripe: [Stripe Dashboard > Developers > Webhooks > Eventos](https://dashboard.stripe.com/webhooks)

### Si el webhook no se ejecuta:
1. Verifica que el endpoint esté correcto
2. Verifica que el `STRIPE_WEBHOOK_SECRET` sea el correcto
3. Intenta reenviar un evento desde el Dashboard de Stripe

---

## 📞 Contacto

Si después de seguir todos estos pasos el problema persiste, revisa:
- Los logs de Stripe para ver si hay errores específicos
- Los logs de Supabase Edge Functions
- Los logs de Vercel

---

## ✅ Checklist Final

- [ ] Cuenta de Stripe Connect desvinculada
- [ ] `STRIPE_SECRET_KEY` verificada en Vercel
- [ ] `STRIPE_SECRET_KEY` verificada en Supabase
- [ ] `STRIPE_WEBHOOK_SECRET` verificada en Supabase
- [ ] Webhook configurado correctamente en Stripe
- [ ] Pago de prueba exitoso en producción

Una vez que todos los ítems estén marcados, el sistema debería funcionar correctamente. ✨
