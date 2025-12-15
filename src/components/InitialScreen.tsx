import { useState, useEffect, useRef } from 'react';
import { Calendar, Swords, ShoppingBag, Gift, Coins, Map } from 'lucide-react';
import { canClaimDaily, claimDailyReward, getLocalCoins, loadFromSupabase, getCurrentLevel } from '../lib/progression';
import { Shop } from './Shop';
import { AdminPanel } from './AdminPanel';
import { NotificationButton } from './NotificationButton';
import { playSoundZap } from '../utils/soundManager';
import { soundManager } from '../lib/sound';

interface InitialScreenProps {
  onStartGame: () => void;
  onStartDailyChallenge: () => void;
  onStartDuel: () => void;
  onShowWorldMap?: () => void;
  onContinueGame?: (level: number) => void;
}

export const InitialScreen = ({ onStartGame, onStartDailyChallenge, onStartDuel, onShowWorldMap, onContinueGame }: InitialScreenProps) => {
  const [showShop, setShowShop] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [coins, setCoins] = useState(0);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [savedLevel, setSavedLevel] = useState(1);
  const logoPlayedRef = useRef(false);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);

  useEffect(() => {
    loadFromSupabase().then(() => {
      setCoins(getLocalCoins());
      setSavedLevel(getCurrentLevel());

      if (canClaimDaily()) {
        setShowDailyReward(true);
      }
    });

    if (!logoPlayedRef.current) {
      setTimeout(() => {
        playSoundZap();
      }, 300);
      logoPlayedRef.current = true;
    }
  }, []);

  // removed custom photo feature

  const handleClaimDaily = () => {
    const newCoins = claimDailyReward();
    setCoins(newCoins);
    setShowDailyReward(false);
  };

  const handleShopClose = () => {
    setShowShop(false);
    setCoins(getLocalCoins());
  };

  const handleAdminTap = () => {
    tapCountRef.current += 1;

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    if (tapCountRef.current >= 7) {
      setShowAdminPanel(true);
      tapCountRef.current = 0;
    } else {
      tapTimerRef.current = window.setTimeout(() => {
        tapCountRef.current = 0;
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="fixed top-0 left-0 w-32 h-32 z-40"
        onClick={handleAdminTap}
      />

      {/* Decorative card pairs in background */}
      <div className="absolute inset-0 pointer-events-none overflow-visible z-0">
        {/* Pair 1: Top Left - Nature */}
        <div className="absolute top-4 left-4 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform rotate-12">
          <span className="text-7xl">🍃</span>
        </div>
        <div className="absolute top-16 left-20 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform -rotate-6">
          <span className="text-7xl">🍃</span>
        </div>

        {/* Pair 2: Top Right - Animals */}
        <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform -rotate-12">
          <span className="text-7xl">🐱</span>
        </div>
        <div className="absolute top-16 right-20 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform rotate-6">
          <span className="text-7xl">🐱</span>
        </div>

        {/* Pair 3: Bottom Right - Space */}
        <div className="absolute bottom-4 right-4 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform rotate-12">
          <span className="text-7xl">🚀</span>
        </div>
        <div className="absolute bottom-16 right-20 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform -rotate-6">
          <span className="text-7xl">🚀</span>
        </div>

        {/* Pair 4: Bottom Left - Ocean */}
        <div className="absolute bottom-4 left-4 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform -rotate-12">
          <span className="text-7xl">🐬</span>
        </div>
        <div className="absolute bottom-16 left-20 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform rotate-6">
          <span className="text-7xl">🐬</span>
        </div>

        {/* Pair 5: Middle Left - Food */}
        <div className="absolute top-1/3 left-2 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform rotate-12">
          <span className="text-7xl">🍕</span>
        </div>
        <div className="absolute top-1/2 left-10 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform -rotate-6">
          <span className="text-7xl">🍕</span>
        </div>

        {/* Pair 6: Middle Right - Music */}
        <div className="absolute top-1/3 right-2 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform rotate-6">
          <span className="text-7xl">🎵</span>
        </div>
        <div className="absolute top-1/2 right-10 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform -rotate-12">
          <span className="text-7xl">🎵</span>
        </div>
      </div>
      <div className="bg-white/50 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10">
        <div className="flex justify-center mb-6">
          <img
            src="/chatgpt_image_15_dic_2025,_11_02_21.png"
            alt="Twin Clash"
            style={{ width: '75%', maxWidth: '420px', margin: '0 auto', opacity: 0.5 }}
          />
        </div>
        <p className="text-center text-gray-600 mb-6 text-sm font-medium">
          Encuentra todas las parejas antes de que se acabe el tiempo
        </p>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex items-center justify-center gap-2">
            <Coins size={20} className="text-white" />
            <span className="text-lg font-bold text-white">{coins}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowShop(true)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-3 flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer"
          >
            <ShoppingBag size={20} className="text-white" />
            <span className="text-sm font-bold text-white">Tienda</span>
          </button>
        </div>

        <div className="space-y-4">
          {savedLevel > 1 && onContinueGame && (
            <button
              type="button"
              onClick={() => onContinueGame(savedLevel)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              ▶️ Continuar Nivel {savedLevel}
            </button>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onStartGame}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              🆕 Nuevo Juego
            </button>
            {onShowWorldMap && (
              <button
                type="button"
                onClick={onShowWorldMap}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <Map size={20} />
                <span className="text-sm">Mundos</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onStartDailyChallenge}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl p-3 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <Calendar size={20} />
            <span className="text-sm">Reto Diario</span>
          </button>

          <button
            type="button"
            onClick={onStartDuel}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl p-3 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <Swords size={20} />
            <span className="text-sm">Duelo</span>
          </button>

          <div className="flex justify-center">
            <NotificationButton />
          </div>
        </div>
      </div>

      {showShop && <Shop onClose={handleShopClose} onSkinChanged={() => {}} />}

      {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}

      {showDailyReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">
              <Gift size={64} className="mx-auto text-yellow-500" />
            </div>
            <h3 className="text-3xl font-bold text-yellow-600 mb-2">¡Recompensa Diaria!</h3>
            <p className="text-gray-600 mb-4">Reclama tus monedas gratis</p>
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Coins size={32} className="text-white" />
                <span className="text-4xl font-bold text-white">+50</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClaimDaily}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Reclamar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
