import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { openChest, ChestReward } from '../lib/progressionService';
import { supabase } from '../lib/supabase';

interface ChestRewardModalProps {
  onClose: () => void;
}

export const ChestRewardModal = ({ onClose }: ChestRewardModalProps) => {
  const [reward, setReward] = useState<ChestReward | null>(null);
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [exploding, setExploding] = useState(false);

  useEffect(() => {
    if (opened && !showRewards) {
      setTimeout(() => setShowRewards(true), 800);
    }
  }, [opened, showRewards]);

  const handleOpenChest = async () => {
    setOpening(true);
    setShaking(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Shake animation
    setTimeout(() => {
      setShaking(false);
      setExploding(true);
    }, 1200);

    // Get rewards and show explosion
    setTimeout(async () => {
      const chestReward = await openChest(user.id);
      setReward(chestReward);
      setOpened(true);
      setOpening(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
        {!opened && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <X size={24} />
          </button>
        )}

        {/* Particle effects background */}
        {exploding && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute text-3xl animate-particle-burst"
                style={{
                  left: '50%',
                  top: '50%',
                  animationDelay: `${i * 0.05}s`,
                  '--angle': `${(360 / 20) * i}deg`,
                } as any}
              >
                ✨
              </div>
            ))}
          </div>
        )}

        {!opened ? (
          <>
            <div
              className={`text-9xl mb-6 transition-transform duration-200 ${
                shaking ? 'animate-shake-hard' : opening ? 'scale-110' : 'hover:scale-105'
              } ${exploding ? 'scale-150 opacity-0' : ''}`}
              style={{ transition: exploding ? 'all 0.6s ease-out' : undefined }}
            >
              🎁
            </div>
            <h2 className="text-3xl font-black text-amber-800 mb-4">
              ¡Cofre Listo!
            </h2>
            <p className="text-gray-600 mb-6">
              Completaste 3 niveles. ¡Abre tu cofre para reclamar tu recompensa!
            </p>
            <button
              onClick={handleOpenChest}
              disabled={opening}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 transform hover:scale-105"
            >
              {opening ? 'Abriendo...' : 'Abrir Cofre'}
            </button>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6">
              <Sparkles className="w-20 h-20 mx-auto text-yellow-500 animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-green-600 mb-4">
              ¡Recompensas!
            </h2>

            <div className="space-y-4 mb-6">
              {reward && reward.coins > 0 && (
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl p-4">
                  <div className="text-4xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-amber-700">
                    +{reward.coins} Monedas
                  </div>
                </div>
              )}

              {reward && reward.boosts > 0 && (
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-4">
                  <div className="text-4xl mb-2">🚀</div>
                  <div className="text-xl font-bold text-blue-700">
                    +{reward.boosts} Boost{reward.boosts > 1 ? 's' : ''}
                  </div>
                </div>
              )}

              {reward && reward.items.length > 0 && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4">
                  <div className="text-4xl mb-2">✨</div>
                  <div className="text-sm font-bold text-purple-700">
                    {reward.items.join(', ')}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              ¡Genial!
            </button>
          </>
        )}
      </div>
    </div>
  );
};
