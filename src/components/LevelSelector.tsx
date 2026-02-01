import { useState, useEffect } from 'react';
import { Lock, Star, Trophy, Coins } from 'lucide-react';
import { getLevelsByWorld, getGlobalLevelId } from '../lib/levels';
import { getThemeName } from '../lib/themes';
import { canPlayLevel, purchaseLevel, getWorldState, ensureWorld, LEVEL_UNLOCK_COST } from '../lib/worldProgress';
import { getLocalCoins } from '../lib/progression';
import { getAllLevelStats, LevelStats, getUserLives } from '../lib/progressionService';
import { supabase } from '../lib/supabase';
import { NoLivesModal } from './NoLivesModal';

interface LevelSelectorProps {
  world: number;
  currentLevel: number;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export function LevelSelector({ world, currentLevel, onSelectLevel, onBack }: LevelSelectorProps) {
  const levelsInWorld = getLevelsByWorld(world);
  const themeName = getThemeName(levelsInWorld[0]?.theme);
  const [levelAccess, setLevelAccess] = useState<Record<number, boolean>>({});
  const [purchaseModalLevel, setPurchaseModalLevel] = useState<number | null>(null);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [levelStats, setLevelStats] = useState<Map<number, LevelStats>>(new Map());
  const [showNoLivesModal, setShowNoLivesModal] = useState(false);
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLevelTarget, setAdminLevelTarget] = useState<number | null>(null);

  useEffect(() => {
    const loadLevelStates = async () => {
      console.log('[LevelSelector] ====================================');
      console.log('[LevelSelector] Loading level states for world', world);

      const worldKey = `world-${world}`;
      console.log('[LevelSelector] Calling ensureWorld...');
      await ensureWorld(worldKey, 5);

      console.log('[LevelSelector] Calling getWorldState...');
      const state = await getWorldState(worldKey);
      console.log('[LevelSelector] State received:', JSON.stringify(state, null, 2));

      const access: Record<number, boolean> = {};

      state.levels.forEach((levelState, idx) => {
        access[idx + 1] = levelState.unlocked;
        console.log(`[LevelSelector] Level ${idx + 1}: unlocked=${levelState.unlocked}, completed=${levelState.completed}`);
      });

      access[1] = true;

      console.log('[LevelSelector] Final levelAccess:', access);
      setLevelAccess(access);
      setCoins(getLocalCoins());

      // Cargar estadísticas de nivel
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const stats = await getAllLevelStats(user.id);
        setLevelStats(stats);
      }

      console.log('[LevelSelector] ====================================');
    };

    loadLevelStates();
  }, [world]);

  const handleLevelClick = async (level: number) => {
    const globalLevel = getGlobalLevelId(world, level);
    const isUnlocked = level === 1 || levelAccess[level];

    if (!isUnlocked) {
      setAdminLevelTarget(level);
      setShowAdminPasswordModal(true);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    const lives = await getUserLives(userId);

    if (!lives || lives.currentLives <= 0) {
      console.log('[LevelSelector] No lives available - showing modal');
      setShowNoLivesModal(true);
      return;
    }

    onSelectLevel(globalLevel);
  };

  const handlePurchaseLevel = async () => {
    if (!purchaseModalLevel) return;

    setLoading(true);
    const worldKey = `world-${world}`;
    const result = await purchaseLevel(worldKey, purchaseModalLevel, LEVEL_UNLOCK_COST);

    if (result.ok) {
      setLevelAccess({ ...levelAccess, [purchaseModalLevel]: true });
      setCoins(getLocalCoins());
      const globalLevel = getGlobalLevelId(world, purchaseModalLevel);
      setPurchaseModalLevel(null);
      onSelectLevel(globalLevel);
    } else {
      alert(result.reason);
    }

    setLoading(false);
  };

  const handleAdminUnlock = async () => {
    const correctPassword = 'admin2025';

    if (adminPassword !== correctPassword) {
      alert('Contraseña incorrecta');
      return;
    }

    if (!adminLevelTarget) return;

    const globalLevel = getGlobalLevelId(world, adminLevelTarget);
    setShowAdminPasswordModal(false);
    setAdminPassword('');
    setAdminLevelTarget(null);

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    const lives = await getUserLives(userId);

    if (!lives || lives.currentLives <= 0) {
      console.log('[LevelSelector] No lives available - showing modal');
      setShowNoLivesModal(true);
      return;
    }

    onSelectLevel(globalLevel);
  };

  const maxLevelInWorld = Math.min(5, currentLevel - (world - 1) * 5);

  return (
    <>
      {showNoLivesModal && (
        <NoLivesModal
          onClose={() => setShowNoLivesModal(false)}
          onLivesPurchased={() => setShowNoLivesModal(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-6">
      <button
        onClick={onBack}
        className="text-white mb-6 font-semibold text-lg flex items-center gap-2 hover:scale-105 transition-transform"
      >
        ← Mundos
      </button>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Mundo {world}
        </h1>
        <p className="text-white/90 text-xl">{themeName}</p>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-4 max-w-lg mx-auto mb-8 px-4">
        {levelsInWorld.map((lvl) => {
          const isUnlocked = levelAccess[lvl.level] ?? false;
          const globalLevel = getGlobalLevelId(world, lvl.level);
          const isCurrent = globalLevel === currentLevel;
          const stats = levelStats.get(globalLevel);
          const stars = stats?.bestStars || 0;

          return (
            <button
              key={lvl.level}
              onClick={() => handleLevelClick(lvl.level)}
              className={`relative aspect-square rounded-2xl font-bold text-base sm:text-xl transition-all shadow-lg flex flex-col items-center justify-center ${
                isUnlocked
                  ? isCurrent
                    ? 'bg-yellow-400 scale-110 shadow-xl text-yellow-900'
                    : 'bg-white hover:scale-105 text-purple-700'
                  : 'bg-gray-700 opacity-50 text-gray-400'
              }`}
            >
              {isUnlocked ? (
                <>
                  <span className="mb-1">{lvl.level}</span>
                  {stars > 0 && (
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <span
                          key={s}
                          className={`text-xs ${s <= stars ? 'opacity-100' : 'opacity-20'}`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  )}
                  {isCurrent && (
                    <Star
                      className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 text-yellow-600 fill-yellow-400"
                      size={16}
                    />
                  )}
                  {lvl.level === 5 && (
                    <Trophy
                      className="absolute -bottom-0.5 sm:-bottom-1 left-1/2 -translate-x-1/2 text-orange-500"
                      size={14}
                    />
                  )}
                </>
              ) : (
                <Lock className="absolute inset-0 m-auto text-gray-500" size={16} />
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 max-w-lg mx-auto text-white">
        <h3 className="font-bold text-xl mb-3">📋 Información del Mundo</h3>
        <div className="space-y-2 text-sm">
          <p>⏱️ Tiempo: {levelsInWorld[0].timeLimit}s - {levelsInWorld[4].timeLimit}s</p>
          <p>🎯 Parejas: {levelsInWorld[0].pairs} - {levelsInWorld[4].pairs}</p>
          <p>💰 Recompensa total: {levelsInWorld.reduce((sum, l) => sum + l.unlockReward, 0)} monedas</p>
          <p className="text-yellow-300 font-semibold">✨ Completa niveles para desbloquear el siguiente</p>
          <p className="text-yellow-300 font-semibold">🏆 Completar nivel 5 desbloquea el siguiente mundo</p>
        </div>
      </div>

      {purchaseModalLevel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">🔓</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              Desbloquear Nivel {purchaseModalLevel}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Saltarás el requisito de completar el nivel anterior. Solo este nivel será desbloqueado.
            </p>

            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Coins size={24} className="text-white" />
                <span className="text-2xl font-bold text-white">{LEVEL_UNLOCK_COST}</span>
              </div>
              <div className="text-xs text-white/80 mt-1">
                Tienes: {coins} monedas
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPurchaseModalLevel(null)}
                disabled={loading}
                className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePurchaseLevel}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Desbloqueando...' : 'Desbloquear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdminPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">🔑</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              Acceso Administrador
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Este nivel está bloqueado. ¿Deseas comprarlo con monedas o usar acceso de administrador?
            </p>

            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Contraseña de admin"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdminUnlock();
                }
              }}
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAdminPasswordModal(false);
                  setAdminPassword('');
                  setAdminLevelTarget(null);
                }}
                className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdminPasswordModal(false);
                  setAdminPassword('');
                  if (adminLevelTarget) {
                    setPurchaseModalLevel(adminLevelTarget);
                  }
                  setAdminLevelTarget(null);
                }}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Comprar
              </button>
              <button
                type="button"
                onClick={handleAdminUnlock}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Desbloquear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
