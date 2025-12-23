# Configuración de Pagos con Stripe

Esta guía te ayudará a configurar los pagos reales en Twin Clash.

## Estado Actual

✅ **Configurado:**
- Edge Function `create-checkout` desplegado y activo
- Frontend integrado con Stripe Checkout
- Manejo de pagos exitosos/cancelados
- Validación de paquetes server-side

❌ **Pendiente:**
- Configurar `STRIPE_SECRET_KEY` en Supabase

---

## Pasos para Activar Pagos Reales

### 1. Crear/Configurar Cuenta Stripe

1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
2. Crea una cuenta o inicia sesión
3. Completa la verificación de tu cuenta para activar pagos reales

### 2. Obtener tu Secret Key

**Para pruebas:**
- Ve a **Developers** → **API keys**
- Busca "Test mode" en el toggle superior
- Copia tu **Secret key** (empieza con `sk_test_...`)

**Para producción:**
- Asegúrate de tener "Live mode" activado
- Copia tu **Secret key** (empieza con `sk_live_...`)

⚠️ **IMPORTANTE:** Nunca compartas tu Secret Key públicamente ni la subas a Git.

### 3. Configurar en Supabase

1. Ve a [app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Edge Functions** → **Manage secrets**
4. Haz clic en **"Add new secret"**
5. Configura:
   - **Name:** `STRIPE_SECRET_KEY`
   - **Value:** Tu clave secreta (sk_test_... o sk_live_...)
6. Guarda

### 4. Verificar Configuración

1. Abre tu aplicación
2. Ve a la Tienda de Monedas
3. Intenta comprar un paquete
4. Deberías ser redirigido a Stripe Checkout

Si ves el error "Stripe no está configurado", verifica que:
- La variable se llame exactamente `STRIPE_SECRET_KEY`
- No tenga espacios al inicio o final
- Sea la clave correcta de Stripe

---

## Paquetes de Monedas Disponibles

| Paquete | Monedas | Bonus | Precio |
|---------|---------|-------|--------|
| Small   | 100     | -     | 0,99€  |
| Medium  | 550     | +50   | 3,99€  |
| Large   | 1200    | +200  | 7,99€  |
| XLarge  | 3000    | +700  | 14,99€ |

---

## Modo Test vs Producción

### Test Mode (Desarrollo)
- Usa `sk_test_...`
- No cobra dinero real
- Usa tarjetas de prueba de Stripe
- Tarjeta de prueba: `4242 4242 4242 4242`

### Live Mode (Producción)
- Usa `sk_live_...`
- Cobra dinero real
- Requiere cuenta Stripe verificada
- Los fondos se depositan en tu cuenta Stripe

---

## Despliegue en Vercel

Para desplegar en Vercel, solo necesitas configurar estas variables de entorno:

```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

**NO** añadas `STRIPE_SECRET_KEY` en Vercel. Esta debe estar solo en Supabase.

---

## Solución de Problemas

### Error: "Stripe no está configurado"
- Verifica que `STRIPE_SECRET_KEY` esté en Supabase Edge Functions Secrets
- Asegúrate que el nombre sea exacto (case-sensitive)

### El pago se procesa pero no se añaden monedas
- Verifica que la URL de retorno incluya los parámetros `?payment=success&coins=X`
- Revisa la consola del navegador para errores

### Error al crear checkout session
- Verifica que tu cuenta Stripe esté activa
- Comprueba que la clave sea válida en dashboard.stripe.com

---

## Seguridad

✅ **Buenas prácticas implementadas:**
- Secret key solo en servidor (Edge Function)
- Validación server-side de paquetes y precios
- CORS configurado correctamente
- No se confía en datos del cliente para precios

🔒 **Recomendaciones adicionales:**
- Usa webhooks de Stripe para confirmación robusta de pagos
- Implementa rate limiting en el edge function
- Monitorea transacciones en el dashboard de Stripe

---

## Soporte

Si tienes problemas:
1. Revisa los logs en Supabase: **Edge Functions** → Tu función → **Logs**
2. Revisa la consola del navegador
3. Verifica tu cuenta Stripe en [dashboard.stripe.com](https://dashboard.stripe.com)
