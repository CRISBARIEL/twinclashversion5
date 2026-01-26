import { useEffect, useState } from 'react';
import { Heart, Clock, Coins } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { getUserLives, getTimeUntilNextLife, formatTimeUntilNextLife, buyLives, UserLives } from '../lib/progressionService';
import { getLocalCoins } from '../lib/progression';
import { supabase } from '../lib/supabase';

interface NoLivesModalProps {
  onClose: () => void;
  onLivesPurchased?: () => void;
}

export const NoLivesModal = ({ onClose, onLivesPurchased }: NoLivesModalProps) => {
  const { t } = useLanguage();
  const [lives, setLives] = useState<UserLives | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    loadLives();
    setCoins(getLocalCoins());

    const interval = setInterval(() => {
      loadLives();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadLives = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    const userLives = await getUserLives(userId);
    setLives(userLives);

    if (userLives && userLives.currentLives < userLives.maxLives) {
      const ms = getTimeUntilNextLife(userLives);
      if (ms) {
        setTimeUntilNext(formatTimeUntilNextLife(ms));
      } else {
        setTimeUntilNext(null);
      }
    } else {
      setTimeUntilNext(null);
    }
  };

  const handleBuyLife = async () => {
    if (buying) return;

    const cost = 1000;
    if (coins < cost) {
      alert('No tienes suficientes monedas. ¡Necesitas 1000 monedas!');
      return;
    }

    setBuying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      const result = await buyLives(userId, 1, cost);
      if (result.success) {
        setCoins(getLocalCoins());
        await loadLives();

        if (result.newLivesCount > 0) {
          if (onLivesPurchased) {
            onLivesPurchased();
          }
          onClose();
        }
      } else {
        alert(result.error || 'Error al comprar vida');
      }
    } catch (error) {
      console.error('Error buying life:', error);
      alert('Error al comprar vida');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl shadow-2xl p-8 max-w-md w-full text-white">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-6 rounded-full">
              <Heart size={64} className="text-white" fill="white" />
            </div>
          </div>
          <h2 className="text-3xl font-black mb-2">¡Sin Vidas!</h2>
          <p className="text-white/90 text-lg">
            No tienes vidas disponibles para jugar
          </p>
        </div>

        {lives && (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart size={32} className="text-white" />
              <span className="text-4xl font-black">
                {lives.currentLives} / {lives.maxLives}
              </span>
            </div>

            {timeUntilNext && (
              <div className="flex items-center justify-center gap-2 text-xl">
                <Clock size={24} />
                <span className="font-bold">{timeUntilNext}</span>
              </div>
            )}

            <p className="text-center text-white/80 text-sm mt-2">
              para la próxima vida
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleBuyLife}
            disabled={buying || coins < 1000}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-gray-900 font-bold py-4 px-6 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            <Coins size={24} />
            <span>Comprar 1 Vida (1000 monedas)</span>
          </button>

          <div className="text-center text-sm text-white/70">
            Tienes: {coins} monedas
          </div>

          <button
            onClick={onClose}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};
