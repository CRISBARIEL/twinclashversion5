import { useState } from 'react';
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

  const handleOpenChest = async () => {
    setOpening(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Animación de apertura
    setTimeout(async () => {
      const chestReward = await openChest(user.id);
      setReward(chestReward);
      setOpened(true);
      setOpening(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        {!opened ? (
          <>
            <div className={`text-8xl mb-6 ${opening ? 'animate-bounce' : ''}`}>
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
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
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
