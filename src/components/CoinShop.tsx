import { useState, useEffect } from 'react';
import { Coins, CreditCard, Sparkles, X, ArrowLeft } from 'lucide-react';
import { getLocalCoins, loadFromSupabase } from '../lib/progression';
import { trackTikTokPurchase, trackTikTokShopView } from '../lib/tiktok';

interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  priceLabel: string;
  popular?: boolean;
  bonus?: number;
}

const coinPackages: CoinPackage[] = [
  {
    id: 'small',
    coins: 1000,
    price: 0.99,
    priceLabel: '0,99€',
  },
  {
    id: 'medium',
    coins: 1550,
    price: 3.99,
    priceLabel: '3,99€',
    popular: true,
    bonus: 50,
  },
  {
    id: 'large',
    coins: 2400,
    price: 7.99,
    priceLabel: '7,99€',
    bonus: 200,
  },
  {
    id: 'xlarge',
    coins: 4000,
    price: 14.99,
    priceLabel: '14,99€',
    bonus: 700,
  },
];

interface CoinShopProps {
  onClose: () => void;
}

export function CoinShop({ onClose }: CoinShopProps) {
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCoins, setCurrentCoins] = useState(getLocalCoins());

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const packageId = urlParams.get('packageId');

    if (paymentStatus === 'success') {
      loadFromSupabase().then(() => {
        setCurrentCoins(getLocalCoins());
        alert('¡Pago exitoso! Tus monedas han sido añadidas a tu cuenta.');

        if (packageId) {
          const pkg = coinPackages.find(p => p.id === packageId);
          if (pkg) {
            const totalCoins = pkg.coins + (pkg.bonus || 0);
            trackTikTokPurchase('EUR', pkg.price, pkg.id).catch(console.error);
          }
        }
      });

      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      url.searchParams.delete('packageId');
      window.history.replaceState({}, '', url.toString());
    } else if (paymentStatus === 'cancelled') {
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      url.searchParams.delete('packageId');
      window.history.replaceState({}, '', url.toString());
    }

    trackTikTokShopView().catch(console.error);
  }, []);

  const handleSelectPackage = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setIsProcessing(true);

    try {
      const clientId = localStorage.getItem('client_id');
      if (!clientId) {
        alert('Error: No se pudo obtener el ID del cliente');
        setIsProcessing(false);
        return;
      }

      console.log('=== INICIO DE COMPRA ===');
      console.log('Paquete seleccionado:', selectedPackage);
      console.log('Client ID:', clientId);
      console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Presente' : 'FALTA');
      console.log('========================');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          coins: selectedPackage.coins + (selectedPackage.bonus || 0),
          price: Math.round(selectedPackage.price * 100),
          clientId: clientId,
        }),
      });

      const data = await response.json();

      console.log('=== DIAGNÓSTICO DE PAGO ===');
      console.log('Status:', response.status);
      console.log('Response:', data);
      console.log('===========================');

      if (!response.ok) {
        console.error('Error response:', data);
        alert(`Error: ${data.error || 'Error al procesar el pago'}\n\nRevisa la consola para más detalles.`);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error al procesar el pago. Por favor, intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error al crear checkout:', error);
      alert('Error al conectar con el servidor de pagos.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 max-w-2xl w-full shadow-2xl animate-scale-in relative my-auto max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={28} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-block relative mb-4">
            <div className="text-6xl">💰</div>
            <Sparkles className="absolute -top-2 -right-2 text-yellow-500 animate-pulse" size={24} />
          </div>
          <h2 className="text-4xl font-black text-gray-800 mb-2">
            Tienda de Monedas
          </h2>
          <p className="text-gray-600 text-lg">
            Mejora tu experiencia con monedas adicionales
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
            <Coins className="text-yellow-500" size={20} />
            <span className="font-bold text-gray-800">Saldo actual: {currentCoins}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {coinPackages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handleSelectPackage(pkg)}
              className={`relative p-6 rounded-2xl transition-all transform ${
                selectedPackage?.id === pkg.id
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 scale-105 shadow-2xl'
                  : 'bg-white hover:scale-105 shadow-lg'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  MÁS POPULAR
                </div>
              )}

              <div className="mb-3">
                <div className={`text-5xl font-black ${selectedPackage?.id === pkg.id ? 'text-white' : 'text-yellow-500'}`}>
                  {pkg.coins.toLocaleString()}
                </div>
                {pkg.bonus && (
                  <div className={`text-sm font-semibold ${selectedPackage?.id === pkg.id ? 'text-yellow-100' : 'text-green-600'}`}>
                    +{pkg.bonus} BONUS
                  </div>
                )}
              </div>

              <div className={`flex items-center justify-center gap-1 mb-2 ${selectedPackage?.id === pkg.id ? 'text-white' : 'text-gray-600'}`}>
                <Coins size={20} />
                <span className="text-sm font-semibold">monedas</span>
              </div>

              <div className={`text-3xl font-black ${selectedPackage?.id === pkg.id ? 'text-white' : 'text-gray-800'}`}>
                {pkg.priceLabel}
              </div>

              {selectedPackage?.id === pkg.id && (
                <div className="mt-3 text-white text-sm font-semibold">
                  ✓ Seleccionado
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Sparkles className="text-yellow-500" size={20} />
            ¿Por qué comprar monedas?
          </h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>✨ Desbloquea skins exclusivos para tus cartas</li>
            <li>⚡ Usa power-ups para ayuda adicional en niveles difíciles</li>
            <li>🎨 Personaliza tu experiencia de juego</li>
            <li>🚀 Progresa más rápido en tu aventura</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Volver
          </button>

          <button
            onClick={handlePurchase}
            disabled={!selectedPackage || isProcessing}
            className={`flex-1 py-4 rounded-2xl font-black text-xl shadow-lg transition-all ${
              selectedPackage && !isProcessing
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CreditCard size={24} />
                {selectedPackage ? `Pagar ${selectedPackage.priceLabel}` : 'Selecciona un paquete'}
              </span>
            )}
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-3">
          Pago seguro procesado por Stripe
        </p>
      </div>

      <style>{`
        @keyframes scale-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
