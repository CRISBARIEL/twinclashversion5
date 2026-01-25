import { useState, useEffect } from 'react';
import { Calendar, Star, Gift, X } from 'lucide-react';
import { checkDailyLogin, claimDailyLogin } from '../lib/progressionService';
import { supabase } from '../lib/supabase';

interface DailyLoginPanelProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const DailyLoginPanel = ({ forceOpen = false, onClose }: DailyLoginPanelProps = {}) => {
  const [showModal, setShowModal] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [streak, setStreak] = useState(0);
  const [day, setDay] = useState(1);
  const [claiming, setClaiming] = useState(false);
  const [reward, setReward] = useState<{ coins: number; boosts: number } | null>(null);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const result = await checkDailyLogin(user.id);
    setCanClaim(result.canClaim);
    setStreak(result.streak);
    setDay(result.day);

    if (result.canClaim) {
      setShowModal(true);
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const result = await claimDailyLogin(user.id);
    setReward(result);
    setStreak(result.streak);
    setDay(result.day);
    setCanClaim(false);
    setClaiming(false);
  };

  const rewards = [
    { coins: 50, boosts: 0, icon: '🪙' },
    { coins: 80, boosts: 0, icon: '💰' },
    { coins: 100, boosts: 1, icon: '🚀' },
    { coins: 120, boosts: 0, icon: '💎' },
    { coins: 150, boosts: 2, icon: '⚡' },
    { coins: 200, boosts: 0, icon: '🏆' },
    { coins: 300, boosts: 3, icon: '👑' },
  ];

  const handleClose = () => {
    setShowModal(false);
    if (onClose) onClose();
  };

  if (!showModal && !forceOpen) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className="fixed top-4 right-4 z-40 bg-gradient-to-r from-pink-500 to-rose-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <Calendar size={24} />
        {canClaim && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        )}
      </button>
    );
  }

  return (
    <div className={forceOpen ? '' : 'fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50'}>
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        {!reward ? (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-3xl font-black text-rose-800 mb-2">
                Regalo Diario
              </h2>
              <p className="text-gray-600">
                Racha actual: {streak} día{streak !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-6">
              {rewards.map((r, i) => {
                const dayNum = i + 1;
                const isToday = dayNum === day;
                const isClaimed = dayNum < day;

                return (
                  <div
                    key={i}
                    className={`
                      aspect-square rounded-xl flex flex-col items-center justify-center text-center p-2
                      ${isToday && canClaim ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white animate-pulse shadow-lg scale-110' : ''}
                      ${isToday && !canClaim ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600' : ''}
                      ${isClaimed ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700' : ''}
                      ${!isToday && !isClaimed ? 'bg-white/50 text-gray-400' : ''}
                    `}
                  >
                    <div className="text-2xl mb-1">{r.icon}</div>
                    <div className="text-xs font-bold">
                      {isClaimed ? '✓' : dayNum}
                    </div>
                  </div>
                );
              })}
            </div>

            {canClaim && (
              <div className="bg-white rounded-xl p-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">Recompensa de hoy:</div>
                <div className="flex justify-center gap-4">
                  {rewards[day - 1].coins > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {rewards[day - 1].coins}
                      </div>
                      <div className="text-xs text-gray-500">Monedas</div>
                    </div>
                  )}
                  {rewards[day - 1].boosts > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {rewards[day - 1].boosts}
                      </div>
                      <div className="text-xs text-gray-500">Boosts</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleClaim}
              disabled={!canClaim || claiming}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {claiming ? 'Reclamando...' : canClaim ? 'Reclamar Regalo' : 'Ya reclamado hoy'}
            </button>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-black text-green-600 mb-4">
                ¡Regalo Reclamado!
              </h2>

              <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl p-6 mb-4">
                {reward.coins > 0 && (
                  <div className="mb-3">
                    <div className="text-4xl mb-2">💰</div>
                    <div className="text-2xl font-bold text-amber-700">
                      +{reward.coins} Monedas
                    </div>
                  </div>
                )}
                {reward.boosts > 0 && (
                  <div>
                    <div className="text-4xl mb-2">🚀</div>
                    <div className="text-xl font-bold text-blue-700">
                      +{reward.boosts} Boost{reward.boosts > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-gray-600 mb-4">
                Racha: {streak} día{streak !== 1 ? 's' : ''} 🔥
              </p>

              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                ¡Genial!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
