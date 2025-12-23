import { Zap, Sparkles, Coins, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getLocalCoins, spendCoins } from '../lib/progression';

interface PowerUpButtonsProps {
  onPowerUpUsed: (percentage: number) => void;
  onFreezeTime?: (seconds: number) => void;
  disabled: boolean;
  hasObstacles?: boolean;
  onModalStateChange?: (isOpen: boolean) => void;
  timeRemaining?: number;
}

export function PowerUpButtons({ onPowerUpUsed, onFreezeTime, disabled, hasObstacles = false, onModalStateChange, timeRemaining }: PowerUpButtonsProps) {
  const [coins, setCoins] = useState(getLocalCoins());
  const [showConfirm, setShowConfirm] = useState<20 | 40 | 'freeze10' | 'freeze15' | null>(null);

  const shouldPulse = timeRemaining !== undefined && timeRemaining <= 10 && timeRemaining > 0;

  const handlePurchase = (type: 20 | 40 | 'freeze10' | 'freeze15') => {
    setShowConfirm(type);
    onModalStateChange?.(true);
  };

  const confirmPurchase = (type: 20 | 40 | 'freeze10' | 'freeze15', cost: number) => {
    if (spendCoins(cost)) {
      setCoins(getLocalCoins());
      if (type === 'freeze10') {
        onFreezeTime?.(10);
      } else if (type === 'freeze15') {
        onFreezeTime?.(15);
      } else {
        onPowerUpUsed(type);
      }
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
          onClick={() => handlePurchase(20)}
          disabled={disabled || coins < 600}
          className={`w-14 h-14 rounded-full font-bold text-xs shadow-lg transition-all flex flex-col items-center justify-center ${
            disabled || coins < 600
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-110 active:scale-95'
          } ${shouldPulse && !(disabled || coins < 600) ? 'animate-heartbeat' : ''}`}
          title="Revelar 20% - 600 monedas"
        >
          <Zap size={14} />
          <span className="text-[10px] leading-none mt-0.5">20%</span>
        </button>

        <button
          onClick={() => handlePurchase(40)}
          disabled={disabled || coins < 1000}
          className={`w-14 h-14 rounded-full font-bold text-xs shadow-lg transition-all flex flex-col items-center justify-center ${
            disabled || coins < 1000
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:scale-110 active:scale-95'
          } ${shouldPulse && !(disabled || coins < 1000) ? 'animate-heartbeat' : ''}`}
          title="Revelar 40% - 1000 monedas"
        >
          <Sparkles size={14} />
          <span className="text-[10px] leading-none mt-0.5">40%</span>
        </button>

        {onFreezeTime && (
          <>
            <button
              onClick={() => handlePurchase('freeze10')}
              disabled={disabled || coins < 1000}
              className={`w-14 h-14 rounded-full font-bold text-xs shadow-lg transition-all flex flex-col items-center justify-center ${
                disabled || coins < 1000
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:scale-110 active:scale-95'
              } ${shouldPulse && !(disabled || coins < 1000) ? 'animate-heartbeat' : ''}`}
              title="Congelar +10s - 1000 monedas"
            >
              <Clock size={14} />
              <span className="text-[10px] leading-none mt-0.5">+10s</span>
            </button>

            <button
              onClick={() => handlePurchase('freeze15')}
              disabled={disabled || coins < 1400}
              className={`w-14 h-14 rounded-full font-bold text-xs shadow-lg transition-all flex flex-col items-center justify-center ${
                disabled || coins < 1400
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:scale-110 active:scale-95'
              } ${shouldPulse && !(disabled || coins < 1400) ? 'animate-heartbeat' : ''}`}
              title="Congelar +15s - 1400 monedas"
            >
              <Clock size={14} />
              <span className="text-[10px] leading-none mt-0.5">+15s</span>
            </button>
          </>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-scale-in">
            <div className="text-6xl mb-4">
              {showConfirm === 20 ? '⚡' : showConfirm === 40 ? '✨' : '⏱️'}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {showConfirm === 'freeze10' || showConfirm === 'freeze15'
                ? `Congelar Tiempo ${showConfirm === 'freeze10' ? '10' : '15'} segundos`
                : hasObstacles
                  ? `Desbloquear ${showConfirm}% de Obstáculos`
                  : `Revelar ${showConfirm}% de Parejas`}
            </h3>
            <p className="text-gray-600 mb-4">
              {showConfirm === 'freeze10' || showConfirm === 'freeze15'
                ? 'El tiempo se detendrá durante los segundos comprados para que puedas terminar la partida'
                : hasObstacles
                  ? 'Esta ayuda eliminará obstáculos (hielo/piedra) dejando las cartas disponibles pero boca abajo'
                  : 'Esta ayuda revelará automáticamente algunas parejas de cartas'}
            </p>

            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-3 mb-6">
              <div className="flex items-center justify-center gap-2 text-white">
                <Coins size={24} />
                <span className="text-2xl font-black">
                  {showConfirm === 20 ? '600' : showConfirm === 40 ? '1000' : showConfirm === 'freeze10' ? '1000' : '1400'}
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
                onClick={() => confirmPurchase(
                  showConfirm,
                  showConfirm === 20 ? 600 : showConfirm === 40 ? 1000 : showConfirm === 'freeze10' ? 1000 : 1400
                )}
                className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${
                  showConfirm === 20
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105'
                    : showConfirm === 40
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:scale-105'
                      : showConfirm === 'freeze10'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:scale-105'
                        : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:scale-105'
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

        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          10%, 30% {
            transform: scale(1.15);
          }
          20%, 40% {
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }

        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
