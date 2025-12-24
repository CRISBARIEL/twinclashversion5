# Ejemplo: Agregar Anuncio Recompensado en la Tienda de Monedas

## Ubicación: `src/components/CoinShop.tsx`

Este ejemplo muestra cómo agregar un botón de anuncio recompensado GRATIS en tu tienda de monedas existente.

---

## Paso 1: Importar el Componente

Al inicio del archivo `CoinShop.tsx`, agrega:

```typescript
import { RewardedAdButton } from './RewardedAdButton';
```

---

## Paso 2: Actualizar el Estado cuando se Recibe Recompensa

Dentro del componente `CoinShop`, agrega una función para manejar las recompensas:

```typescript
export function CoinShop({ onClose }: CoinShopProps) {
  // ... código existente ...
  const [currentCoins, setCurrentCoins] = useState(getLocalCoins());

  // AGREGAR ESTA FUNCIÓN:
  const handleAdReward = (totalCoins: number) => {
    setCurrentCoins(totalCoins); // Actualiza el contador de monedas en el UI
  };

  // ... resto del código ...
```

---

## Paso 3: Agregar el Botón en el JSX

Busca donde están los paquetes de monedas (alrededor de línea 100-150) y agrega una sección especial para el anuncio gratis:

```typescript
return (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

      {/* Header existente... */}

      <div className="p-6">

        {/* AGREGAR ESTA SECCIÓN NUEVA - Opción Gratis */}
        <div className="mb-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 shadow-lg border-4 border-yellow-400">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <Sparkles className="animate-pulse" />
                ¡MONEDAS GRATIS!
              </h3>
              <p className="text-green-100 mt-1">
                Mira un anuncio corto y gana 1000 monedas
              </p>
            </div>
            <div className="text-5xl font-black text-yellow-300">
              GRATIS
            </div>
          </div>

          <RewardedAdButton
            testMode={true}  {/* Cambiar a false para producción */}
            onRewardGranted={handleAdReward}
            onAdShown={() => console.log('Anuncio mostrado')}
            className="w-full"
          />
        </div>

        {/* Resto del código existente - Paquetes de pago */}
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <CreditCard size={24} />
          O compra más monedas
        </h2>

        {/* Grid de paquetes existente... */}

      </div>
    </div>
  </div>
);
```

---

## Resultado Visual

La tienda mostrará:

```
┌─────────────────────────────────────────┐
│         TIENDA DE MONEDAS               │
│         Monedas actuales: 2500          │
├─────────────────────────────────────────┤
│  ✨ ¡MONEDAS GRATIS!        GRATIS      │
│  Mira un anuncio y gana 1000 monedas    │
│                                          │
│  [▶ Ver Anuncio  💰 +1000]              │
│                                          │
├─────────────────────────────────────────┤
│  O compra más monedas:                  │
│                                          │
│  [1000 💰]  [2500 💰]  [5000 💰]         │
│   0,99€     3,99€      7,99€            │
└─────────────────────────────────────────┘
```

---

## Código Completo de Ejemplo

```typescript
import { useState, useEffect } from 'react';
import { Coins, CreditCard, Sparkles, X, ArrowLeft } from 'lucide-react';
import { getLocalCoins, loadFromSupabase } from '../lib/progression';
import { RewardedAdButton } from './RewardedAdButton'; // NUEVO

// ... interfaces y coinPackages existentes ...

export function CoinShop({ onClose }: CoinShopProps) {
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCoins, setCurrentCoins] = useState(getLocalCoins());

  // NUEVA FUNCIÓN para actualizar monedas cuando se recibe recompensa
  const handleAdReward = (totalCoins: number) => {
    setCurrentCoins(totalCoins);
  };

  // ... resto del código existente ...

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-800 to-blue-800 p-6 rounded-t-3xl border-b-4 border-yellow-500 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <ArrowLeft size={24} className="text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-2">
                <Coins className="text-yellow-400" size={32} />
                TIENDA DE MONEDAS
              </h1>
              <p className="text-purple-200 mt-1">
                Monedas actuales: <span className="font-bold text-yellow-400">{currentCoins}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            <X size={28} className="text-white" />
          </button>
        </div>

        <div className="p-6">

          {/* NUEVA SECCIÓN - Anuncio Recompensado */}
          <div className="mb-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 shadow-lg border-4 border-yellow-400 animate-pulse-slow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <Sparkles className="animate-pulse" size={28} />
                  ¡MONEDAS GRATIS!
                </h3>
                <p className="text-green-100 mt-1 text-lg">
                  Mira un anuncio corto de 30 segundos y gana 1000 monedas
                </p>
              </div>
              <div className="text-5xl font-black text-yellow-300 animate-bounce">
                GRATIS
              </div>
            </div>

            <RewardedAdButton
              testMode={true}
              onRewardGranted={handleAdReward}
              onAdShown={() => console.log('Usuario viendo anuncio')}
              onAdFailed={() => console.log('Error al mostrar anuncio')}
              className="w-full"
            />

            <p className="text-green-100 text-sm mt-3 text-center">
              💡 Disponible cada vez que se cargue un anuncio
            </p>
          </div>

          {/* Sección existente de paquetes de pago */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard size={24} />
              O compra más monedas con pago
            </h2>

            {/* Grid de paquetes existente... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ... paquetes existentes ... */}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
```

---

## Probar Ahora

1. **En navegador (npm run dev):**
   - Los anuncios se simulan (2 segundos de espera)
   - Recibirás las 1000 monedas automáticamente
   - El contador se actualiza en tiempo real

2. **En Android:**
   - Verás anuncios reales de prueba de Google
   - Completa el anuncio para recibir la recompensa
   - Las monedas se sincronizan con Supabase

---

## Ventajas de esta Implementación

✅ Opción gratis visible y atractiva
✅ No requiere configuración de pagos
✅ Usuarios pueden obtener monedas sin pagar
✅ Aumenta la retención de usuarios
✅ Genera ingresos por publicidad
✅ Compatible con web y móvil

---

## Cambiar a Producción

Cuando estés listo:

```typescript
<RewardedAdButton
  testMode={false}  // ← Cambiar a false
  onRewardGranted={handleAdReward}
  className="w-full"
/>
```

---

**¡Listo! Tu tienda ahora tiene una opción gratis con anuncios recompensados.**
