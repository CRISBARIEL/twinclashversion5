# 🔍 Diagnóstico de Stripe en Producción

## ✅ Estado Actual

### Webhook Configurado:
```
https://jbqaznerntjlbdhcmodj.supabase.co/functions/v1/stripe-webhook
```

### Edge Functions Desplegadas:
- ✅ `create-checkout` - Crea la sesión de pago
- ✅ `stripe-webhook` - Recibe confirmaciones de Stripe

---

## ❌ PROBLEMA IDENTIFICADO

Las **Edge Functions NO pueden acceder a las variables de Stripe** porque estas se configuran de manera diferente al archivo `.env`.

### Variables que FALTAN en Supabase:

Las Edge Functions buscan estas variables de entorno:
- `STRIPE_SECRET_KEY` - Tu clave secreta (sk_live_...)
- `STRIPE_WEBHOOK_SECRET` - El secret del webhook (whsec_...)

Estas variables **NO** están en el archivo `.env` del proyecto. Se configuran directamente en el Dashboard de Supabase.

---

## ✅ SOLUCIÓN (Sin afectar el funcionamiento actual)

### PASO 1: Configurar Secrets en Supabase

1. **Abre tu Dashboard de Supabase:**
   ```
   https://supabase.com/dashboard/project/jbqaznerntjlbdhcmodj/settings/functions
   ```

2. **Navega a:** Settings → Edge Functions → Manage Secrets (o Secrets)

3. **Añade estos dos secrets:**

   **Secret 1:**
   - Nombre: `STRIPE_SECRET_KEY`
   - Valor: Tu clave secreta de Stripe LIVE (la que empieza con `sk_live_...`)
   - ⚠️ IMPORTANTE: Debe ser la clave LIVE, NO la de prueba

   **Secret 2:**
   - Nombre: `STRIPE_WEBHOOK_SECRET`
   - Valor: El Signing Secret de tu webhook (empieza con `whsec_...`)

4. **Guarda ambos secrets**

---

### PASO 2: Obtener tus claves de Stripe

#### Para obtener STRIPE_SECRET_KEY:
1. Ve a: https://dashboard.stripe.com/apikeys
2. En la sección "Secret key", copia la clave que dice "sk_live_..."
3. Si no ves claves LIVE, activa tu cuenta de Stripe primero

#### Para obtener STRIPE_WEBHOOK_SECRET:
1. Ve a: https://dashboard.stripe.com/webhooks
2. Encuentra el webhook con URL: `https://jbqaznerntjlbdhcmodj.supabase.co/functions/v1/stripe-webhook`
3. Haz clic en él
4. En la sección "Signing secret", haz clic en "Reveal" o "Click to reveal"
5. Copia el valor (empieza con `whsec_...`)

---

### PASO 3: Verificar que funciona

Una vez configurados los secrets:

1. **Abre la consola del navegador** (F12)
2. **Ve a tu app en producción**
3. **Intenta comprar un paquete de monedas**
4. **Observa los logs en la consola**

Si todo está bien, deberías ver:
```
=== INICIO DE COMPRA ===
Paquete seleccionado: {...}
Client ID: ...
========================
```

Y luego serás redirigido a Stripe Checkout.

---

### PASO 4: Verificar logs en Supabase

Después de intentar un pago:

1. Ve a: https://supabase.com/dashboard/project/jbqaznerntjlbdhcmodj/functions
2. Haz clic en `create-checkout`
3. Ve a la pestaña "Logs"
4. Deberías ver logs como:
   ```
   === CREATE CHECKOUT SESSION ===
   Stripe Key Present: true
   Stripe Key Type: sk_live
   ✅ Stripe configured with LIVE key
   ```

Si ves `Stripe Key Present: false`, significa que el secret no está configurado.

---

## 🎯 ¿Por qué esto no afecta el funcionamiento actual?

- Las Edge Functions ya están desplegadas y funcionando
- Solo necesitan las variables de entorno para acceder a Stripe
- El resto de tu app funciona normalmente porque usa otras credenciales
- Esta configuración es **completamente independiente** del resto de tu aplicación

---

## 📊 Resumen de lo que necesitas hacer:

1. ✅ **Webhook ya está configurado** (no necesitas hacer nada aquí)
2. ⚠️ **Faltan las variables de entorno en Supabase** (necesitas configurarlas)
3. ✅ **Edge Functions ya están desplegadas** (no necesitas hacer nada aquí)

**Solo necesitas configurar los 2 secrets en Supabase y listo.**

---

## 🔒 Seguridad

- ✅ Las claves secretas están **protegidas** en Supabase
- ✅ NO se exponen al cliente
- ✅ Solo las Edge Functions tienen acceso
- ✅ Tu app sigue funcionando normalmente

---

## 📞 Si necesitas ayuda

Si después de configurar los secrets el problema persiste:

1. **Revisa los logs de Supabase Edge Functions**
2. **Revisa los logs en Stripe Dashboard > Webhooks**
3. **Comparte los logs de la consola del navegador**

---

**¡Esta es la única configuración que falta para que los pagos funcionen!** 💳✨
