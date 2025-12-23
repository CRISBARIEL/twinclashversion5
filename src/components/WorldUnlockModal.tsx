import { useEffect, useState } from 'react';
import { Trophy, Sparkles, Coins } from 'lucide-react';
import { createConfetti } from '../utils/confetti';
import { soundManager } from '../lib/sound';

interface WorldUnlockModalProps {
  completedWorld: number;
  unlockedWorld: number;
  coinsEarned: number;
  onContinue: () => void;
  isGameComplete?: boolean;
}

export function WorldUnlockModal({
  completedWorld,
  unlockedWorld,
  coinsEarned,
  onContinue,
  isGameComplete = false
}: WorldUnlockModalProps) {
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);

  useEffect(() => {
    soundManager.playWin();
    createConfetti();

    const intervals: number[] = [];
    for (let i = 0; i < 3; i++) {
      const interval = window.setTimeout(() => {
        createConfetti();
      }, (i + 1) * 600);
      intervals.push(interval);
    }

    setTimeout(() => setShowCoinAnimation(true), 500);

    return () => intervals.forEach(clearTimeout);
  }, []);

  const worldNames = ['', 'Naturaleza', 'Deportes', 'Juegos', 'Animales', 'Espacio', 'Océano', 'Comida', 'Música', 'Belleza', 'Tecnología', 'Ciudad', 'Ciencia', 'Granja', 'Arte', 'Transporte'];
  const worldEmojis = ['', '🌿', '⚽', '🎮', '🐾', '🚀', '🌊', '🍕', '🎵', '💄', '💻', '🏙️', '🔬', '🚜', '🎨', '🚗'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-white via-yellow-50 to-orange-50 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-bounce-in">

        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
          <Trophy size={48} className="text-white" />
        </div>

        <div className="mt-8 mb-6">
          {isGameComplete ? (
            <>
              <h2 className="text-5xl font-black mb-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                ¡JUEGO COMPLETADO!
              </h2>
              <div className="text-7xl mb-4 animate-bounce">🏆</div>
              <p className="text-2xl font-bold text-gray-700 mb-2">
                ¡Eres un Maestro de la Memoria!
              </p>
              <p className="text-gray-600">
                Has superado todos los mundos
              </p>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ¡Mundo {completedWorld} Completado!
              </h2>
              <div className="text-6xl mb-4">🎉</div>

              <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border-2 border-yellow-200">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Sparkles className="text-yellow-500" size={32} />
                  <h3 className="text-2xl font-bold text-gray-800">
                    Nuevo Mundo Desbloqueado
                  </h3>
                  <Sparkles className="text-yellow-500" size={32} />
                </div>

                <div className="flex items-center justify-center gap-4 py-4">
                  <div className="text-6xl">{worldEmojis[unlockedWorld]}</div>
                  <div className="text-left">
                    <div className="text-3xl font-black text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                      Mundo {unlockedWorld}
                    </div>
                    <div className="text-xl font-semibold text-gray-700">
                      {worldNames[unlockedWorld]}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 mb-6 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 text-white">
            <Coins size={28} />
            <span className="text-3xl font-black">+{coinsEarned}</span>
            <span className="text-lg font-semibold">monedas</span>
          </div>

          {showCoinAnimation && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-2xl animate-coin-fall"
                  style={{
                    left: `${20 + i * 10}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1.2s'
                  }}
                >
                  🪙
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          {isGameComplete ? '¡Vamos!' : `Explorar Mundo ${unlockedWorld}`}
        </button>

        <div className="mt-4 flex justify-center gap-2 flex-wrap">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < completedWorld ? 'bg-yellow-400' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
}
