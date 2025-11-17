import { Zap, Sparkles, Coins } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getLocalCoins, spendCoins } from '../lib/progression';

interface PowerUpButtonsProps {
  onPowerUpUsed: (percentage: number) => void;
  disabled: boolean;
  hasObstacles?: boolean;
  onModalStateChange?: (isOpen: boolean) => void;
}

export function PowerUpButtons({ onPowerUpUsed, disabled, hasObstacles = false, onModalStateChange }: PowerUpButtonsProps) {
  const [coins, setCoins] = useState(getLocalCoins());
  const [showConfirm, setShowConfirm] = useState<20 | 40 | null>(null);

  const handlePurchase = (percentage: 20 | 40, cost: number) => {
    setShowConfirm(percentage);
    onModalStateChange?.(true);
  };

  const confirmPurchase = (percentage: 20 | 40, cost: number) => {
    if (spendCoins(cost)) {
      setCoins(getLocalCoins());
      onPowerUpUsed(percentage);
      setShowConfirm(null);
      onModalStateChange?.(false);
    } else {
      alert('¡No tienes suficientes monedas!');
    }
  };

  const cancelPurchase = () => {
    setShowConfirm(null);
    onModalStateChange?.(false);
  };

  return (
    <>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => handlePurchase(20, 100)}
          disabled={disabled || coins < 100}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all ${
            disabled || coins < 100
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 active:scale-95'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Zap size={16} />
            <span>20%</span>
          </div>
          <div className="text-xs flex items-center justify-center gap-1 mt-1">
            <Coins size={12} />
            <span>100</span>
          </div>
        </button>

        <button
          onClick={() => handlePurchase(40, 200)}
          disabled={disabled || coins < 200}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all ${
            disabled || coins < 200
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:scale-105 active:scale-95'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Sparkles size={16} />
            <span>40%</span>
          </div>
          <div className="text-xs flex items-center justify-center gap-1 mt-1">
            <Coins size={12} />
            <span>200</span>
          </div>
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-scale-in">
            <div className="text-6xl mb-4">
              {showConfirm === 20 ? '⚡' : '✨'}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {hasObstacles ? `Desbloquear ${showConfirm}% de Obstáculos` : `Revelar ${showConfirm}% de Parejas`}
            </h3>
            <p className="text-gray-600 mb-4">
              {hasObstacles
                ? 'Esta ayuda eliminará obstáculos (hielo/piedra) dejando las cartas disponibles pero boca abajo'
                : 'Esta ayuda revelará automáticamente algunas parejas de cartas'}
            </p>

            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-3 mb-6">
              <div className="flex items-center justify-center gap-2 text-white">
                <Coins size={24} />
                <span className="text-2xl font-black">
                  {showConfirm === 20 ? '100' : '200'}
                </span>
                <span className="text-sm font-semibold">monedas</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelPurchase}
                className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-bold hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmPurchase(showConfirm, showConfirm === 20 ? 100 : 200)}
                className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${
                  showConfirm === 20
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:scale-105'
                }`}
              >
                Confirmar
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Tu saldo actual: {coins} monedas
            </p>
          </div>
        </div>
      )}

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
    </>
  );
}
