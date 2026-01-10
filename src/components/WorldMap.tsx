import { useState, useEffect, useRef } from 'react';
import { Lock, Trophy, Leaf, Dumbbell, Gamepad2, PawPrint, Rocket, Coins, Waves, Pizza, Music, Sparkles, Cpu, Building2, FlaskConical, Tractor, Palette, Car, Shirt, Drama, Candy, Trophy as TrophyIcon, Eye, Briefcase, Smile, Anchor, Gem, Gamepad, Bug, Apple, Carrot, ChevronDown, ChevronUp, Star, Wand2, Castle, TreePine, Mountain, Snowflake, MapPin, Sparkle, Zap, Sun, Flower2, Wind, CloudSnow, Film, BookOpen, Shield, Bot, Rocket as AlienIcon, Flag, Coins as TreasureIcon, Flame, Skull, Music2 } from 'lucide-react';
import { canEnterWorld, isWorldCompleted, purchaseWorld, ensureWorld, WORLD_COSTS, canPlayLevel } from '../lib/worldProgress';
import { getLocalCoins, getCurrentLevel } from '../lib/progression';
import { soundManager } from '../lib/sound';
import { LEVELS, getGlobalLevelId } from '../lib/levels';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../hooks/useLanguage';

const worldIcons = [Leaf, Dumbbell, Gamepad2, PawPrint, Rocket, Waves, Pizza, Music, Sparkles, Cpu, Building2, FlaskConical, Tractor, Palette, Car, Shirt, Drama, Candy, TrophyIcon, Eye, Briefcase, Smile, Anchor, Gem, Gamepad, Bug, Apple, Carrot, Wand2, Castle, TreePine, Mountain, Snowflake, MapPin, Sparkle, Zap, Skull, Music2, Sun, Flower2, Wind, CloudSnow, Film, BookOpen, Shield, Bot, AlienIcon, Flag, TreasureIcon, Flame];
const worldColors = [
  { from: 'from-emerald-500', to: 'to-green-700' },
  { from: 'from-yellow-500', to: 'to-orange-700' },
  { from: 'from-purple-500', to: 'to-pink-700' },
  { from: 'from-orange-500', to: 'to-red-700' },
  { from: 'from-indigo-500', to: 'to-blue-700' },
  { from: 'from-cyan-500', to: 'to-teal-700' },
  { from: 'from-red-500', to: 'to-pink-700' },
  { from: 'from-violet-500', to: 'to-purple-700' },
  { from: 'from-fuchsia-500', to: 'to-pink-700' },
  { from: 'from-slate-500', to: 'to-gray-700' },
  { from: 'from-blue-500', to: 'to-sky-700' },
  { from: 'from-teal-500', to: 'to-cyan-700' },
  { from: 'from-lime-500', to: 'to-green-600' },
  { from: 'from-amber-500', to: 'to-yellow-700' },
  { from: 'from-rose-500', to: 'to-red-600' },
  { from: 'from-pink-500', to: 'to-rose-700' },
  { from: 'from-green-600', to: 'to-emerald-800' },
  { from: 'from-pink-400', to: 'to-red-600' },
  { from: 'from-emerald-500', to: 'to-teal-700' },
  { from: 'from-sky-400', to: 'to-blue-600' },
  { from: 'from-blue-500', to: 'to-indigo-700' },
  { from: 'from-yellow-500', to: 'to-red-600' },
  { from: 'from-slate-600', to: 'to-amber-800' },
  { from: 'from-purple-600', to: 'to-rose-500' },
  { from: 'from-cyan-500', to: 'to-indigo-700' },
  { from: 'from-lime-500', to: 'to-emerald-700' },
  { from: 'from-red-500', to: 'to-yellow-500' },
  { from: 'from-green-500', to: 'to-emerald-700' },
  { from: 'from-violet-600', to: 'to-purple-800' },
  { from: 'from-stone-500', to: 'to-gray-700' },
  { from: 'from-green-600', to: 'to-teal-800' },
  { from: 'from-amber-600', to: 'to-orange-800' },
  { from: 'from-sky-500', to: 'to-blue-700' },
  { from: 'from-zinc-500', to: 'to-slate-700' },
  { from: 'from-fuchsia-600', to: 'to-purple-800' },
  { from: 'from-blue-600', to: 'to-indigo-800' },
  { from: 'from-green-700', to: 'to-emerald-900' },
  { from: 'from-purple-500', to: 'to-violet-700' },
  { from: 'from-yellow-600', to: 'to-orange-700' },
  { from: 'from-pink-600', to: 'to-rose-800' },
  { from: 'from-orange-600', to: 'to-red-800' },
  { from: 'from-cyan-600', to: 'to-blue-800' },
  { from: 'from-slate-700', to: 'to-gray-900' },
  { from: 'from-indigo-600', to: 'to-blue-800' },
  { from: 'from-red-600', to: 'to-rose-800' },
  { from: 'from-teal-600', to: 'to-cyan-800' },
  { from: 'from-violet-700', to: 'to-purple-900' },
  { from: 'from-emerald-600', to: 'to-green-800' },
  { from: 'from-amber-700', to: 'to-yellow-900' },
  { from: 'from-orange-700', to: 'to-red-900' },
];

interface WorldMapProps {
  currentWorld: number;
  currentLevel: number;
  worldsCompleted: number;
  onSelectWorld: (world: number) => void;
  onBackToMenu: () => void;
}

export function WorldMap({ currentWorld, currentLevel, worldsCompleted, onSelectWorld, onBackToMenu }: WorldMapProps) {
  const { t } = useLanguage();
  const worldNames = [
    t.worlds.nature, t.worlds.sports, t.worlds.games, t.worlds.animals,
    t.worlds.space, t.worlds.ocean, t.worlds.food, t.worlds.music,
    t.worlds.beauty, t.worlds.technology, t.worlds.city, t.worlds.science,
    t.worlds.farm, t.worlds.art, t.worlds.transport, t.worlds.clothing,
    t.worlds.dinosaurs, t.worlds.sweets, t.worlds.tshirts, t.worlds.eyes,
    t.worlds.professions, t.worlds.emotions, t.worlds.pirates, t.worlds.jewels,
    t.worlds.videogames, t.worlds.insects, t.worlds.fruits, t.worlds.vegetables,
    t.worlds.mythology, t.worlds.medieval, t.worlds.jungle, t.worlds.desert,
    t.worlds.arctic, t.worlds.urban, t.worlds.fantasy, t.worlds.scifi,
    t.worlds.dinosaurs, t.worlds.music, t.worlds.summer, t.worlds.spring,
    t.worlds.autumn, t.worlds.winter, t.worlds.cinema, t.worlds.history,
    t.worlds.superheroes, t.worlds.robots, t.worlds.aliens, t.worlds.castles,
    t.worlds.treasures, t.worlds.volcano
  ];
  const [worldAccess, setWorldAccess] = useState<Record<number, boolean>>({ 1: true });
  const [worldsComplete, setWorldsComplete] = useState<Record<number, boolean>>({});
  const [coins, setCoins] = useState(0);
  const [purchaseModalWorld, setPurchaseModalWorld] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminWorldTarget, setAdminWorldTarget] = useState<number | null>(null);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [expandedWorld, setExpandedWorld] = useState<number | null>(currentWorld || null);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);

  useEffect(() => {
    soundManager.stopStartMusic();

    const loadWorldStates = async () => {
      const access: Record<number, boolean> = { 1: true };
      const complete: Record<number, boolean> = {};

      for (let i = 1; i <= 50; i++) {
        await ensureWorld(`world-${i}`, 5);

        if (i > 1) {
          const canEnter = await canEnterWorld(`world-${i}`);
          access[i] = canEnter;
        }

        const completed = await isWorldCompleted(`world-${i}`);
        complete[i] = completed;
      }

      setWorldAccess(access);
      setWorldsComplete(complete);
      setCoins(getLocalCoins());
    };

    loadWorldStates();
  }, []);

  const handleWorldClick = async (worldId: number) => {
    if (worldId === 1 || worldAccess[worldId]) {
      setExpandedWorld(expandedWorld === worldId ? null : worldId);
      return;
    }

    setPurchaseModalWorld(worldId);
  };

  const handleLevelClick = (worldId: number, levelNum: number) => {
    onSelectWorld(worldId);
  };

  const handlePurchaseWorld = async () => {
    if (!purchaseModalWorld) return;

    setLoading(true);
    const worldKey = `world-${purchaseModalWorld}` as keyof typeof WORLD_COSTS;
    const cost = WORLD_COSTS[worldKey];
    const result = await purchaseWorld(worldKey, cost);

    if (result.ok) {
      setWorldAccess({ ...worldAccess, [purchaseModalWorld]: true });
      setCoins(getLocalCoins());
      setPurchaseModalWorld(null);
      onSelectWorld(purchaseModalWorld);
    } else {
      alert(result.reason);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-700 p-6">
      <LanguageSelector />
      <button
        onClick={onBackToMenu}
        className="mb-6 text-white flex items-center gap-2 font-semibold text-lg hover:scale-105 transition-transform"
      >
        ← {t.common.back}
      </button>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{t.menu.worldMap}</h1>
        <p className="text-white/90 text-lg mb-4">50 {t.menu.worldMap} · 250 {t.common.level}s</p>

        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 max-w-md mx-auto border-2 border-white/30">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow-lg">1</div>
              <span className="text-white font-semibold">{t.duel.selectLevel}</span>
            </div>
            <div className="text-white text-2xl">→</div>
            <div className="flex items-center gap-2">
              <div className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow-lg">2</div>
              <span className="text-white font-semibold">{t.common.play}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50].map((worldId) => {
          const isUnlocked = worldAccess[worldId] ?? false;
          const Icon = worldIcons[worldId - 1];
          const colors = worldColors[worldId - 1];
          const isCurrent = currentWorld === worldId;
          const isCompleted = worldsComplete[worldId] ?? false;
          const isExpanded = expandedWorld === worldId;

          return (
            <div key={worldId} className="transition-all">
              <button
                onClick={() => handleWorldClick(worldId)}
                className={`w-full relative p-5 rounded-2xl shadow-xl transition-all transform ${
                  isUnlocked
                    ? `bg-gradient-to-br ${colors.from} ${colors.to} hover:scale-102 active:scale-98`
                    : 'bg-gradient-to-br from-gray-600 to-gray-800'
                } ${isExpanded ? 'rounded-b-none' : ''}`}
              >
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <div className={`relative ${isUnlocked ? '' : 'opacity-40'}`}>
                      <Icon size={40} className="text-white drop-shadow-lg" strokeWidth={2} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold drop-shadow-lg">{t.menu.worldMap} {worldId}</h3>
                      <p className={`text-sm font-medium ${isUnlocked ? 'opacity-90' : 'opacity-60'}`}>
                        {worldNames[worldId - 1]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <Trophy className="text-yellow-300 drop-shadow-lg" size={28} />
                    ) : !isUnlocked ? (
                      <Lock size={28} className="text-white/60" />
                    ) : isCurrent ? (
                      <div className="text-xs bg-white/30 rounded-lg px-2 py-1 backdrop-blur-sm font-semibold">
                        Nivel {currentLevel}/5
                      </div>
                    ) : null}

                    {isUnlocked && (
                      isExpanded ?
                        <ChevronUp size={24} className="text-white" strokeWidth={3} /> :
                        <ChevronDown size={24} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && isUnlocked && (
                <div className={`bg-gradient-to-br ${colors.from} ${colors.to} rounded-b-2xl p-4 shadow-xl border-t-2 border-white/20`}>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((levelNum) => {
                      const globalLevelId = getGlobalLevelId(worldId, levelNum);
                      const userCurrentLevel = getCurrentLevel();
                      const levelUnlocked = globalLevelId <= userCurrentLevel;
                      const isCurrentLevel = globalLevelId === userCurrentLevel;

                      return (
                        <button
                          key={levelNum}
                          onClick={() => handleLevelClick(worldId, levelNum)}
                          className={`relative aspect-square rounded-xl font-bold text-lg transition-all transform ${
                            levelUnlocked
                              ? isCurrentLevel
                                ? 'bg-white text-blue-600 scale-110 shadow-2xl ring-4 ring-yellow-300'
                                : 'bg-white/90 text-gray-800 hover:scale-110 hover:shadow-xl active:scale-95'
                              : 'bg-white/20 text-white/40 cursor-not-allowed'
                          }`}
                        >
                          {levelUnlocked ? (
                            <>
                              <span className="text-2xl">{levelNum}</span>
                              {isCurrentLevel && (
                                <Star className="absolute -top-1 -right-1 text-yellow-400 fill-yellow-400" size={16} />
                              )}
                            </>
                          ) : (
                            <Lock size={20} className="mx-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-center text-white/80 text-xs mt-3 font-medium">
                    Toca un nivel para jugar
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAdminPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">🔑</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              Acceso Admin
            </h3>
            <p className="text-gray-600 mb-6">
              Ingresa la contraseña de administrador
            </p>

            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const correctPassword = 'admin2025';
                  if (adminPassword === correctPassword) {
                    if (adminWorldTarget) {
                      setWorldAccess({ ...worldAccess, [adminWorldTarget]: true });
                      localStorage.setItem(`world_${adminWorldTarget}_unlocked`, 'true');
                      onSelectWorld(adminWorldTarget);
                    }
                    setShowAdminPassword(false);
                    setAdminPassword('');
                    setAdminWorldTarget(null);
                  } else {
                    alert('Contraseña incorrecta');
                    setAdminPassword('');
                  }
                }
              }}
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAdminPassword(false);
                  setAdminPassword('');
                  setAdminWorldTarget(null);
                }}
                className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const correctPassword = 'admin2025';
                  if (adminPassword === correctPassword) {
                    if (adminWorldTarget) {
                      setWorldAccess({ ...worldAccess, [adminWorldTarget]: true });
                      localStorage.setItem(`world_${adminWorldTarget}_unlocked`, 'true');
                      onSelectWorld(adminWorldTarget);
                    }
                    setShowAdminPassword(false);
                    setAdminPassword('');
                    setAdminWorldTarget(null);
                  } else {
                    alert('Contraseña incorrecta');
                    setAdminPassword('');
                  }
                }}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Desbloquear
              </button>
            </div>
          </div>
        </div>
      )}

      {purchaseModalWorld && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div
              className="text-6xl mb-4 cursor-pointer select-none"
              onClick={() => {
                tapCountRef.current += 1;

                if (tapTimerRef.current) {
                  clearTimeout(tapTimerRef.current);
                }

                if (tapCountRef.current >= 5) {
                  setShowAdminButton(true);
                  tapCountRef.current = 0;
                  if (tapTimerRef.current) {
                    clearTimeout(tapTimerRef.current);
                    tapTimerRef.current = null;
                  }
                } else {
                  tapTimerRef.current = window.setTimeout(() => {
                    tapCountRef.current = 0;
                    tapTimerRef.current = null;
                  }, 1000);
                }
              }}
            >
              🔓
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              Desbloquear Mundo {purchaseModalWorld}
            </h3>
            <p className="text-gray-600 mb-4">
              {worldNames[purchaseModalWorld - 1]}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Al desbloquear este mundo, podrás jugar el nivel 1. Los demás niveles se desbloquean jugando.
            </p>

            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Coins size={24} className="text-white" />
                <span className="text-2xl font-bold text-white">
                  {WORLD_COSTS[`world-${purchaseModalWorld}` as keyof typeof WORLD_COSTS]}
                </span>
              </div>
              <div className="text-xs text-white/80 mt-1">
                Tienes: {coins} monedas
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setPurchaseModalWorld(null);
                  setShowAdminButton(false);
                  tapCountRef.current = 0;
                  if (tapTimerRef.current) {
                    clearTimeout(tapTimerRef.current);
                    tapTimerRef.current = null;
                  }
                }}
                disabled={loading}
                className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePurchaseWorld}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Desbloqueando...' : 'Desbloquear'}
              </button>
            </div>

            {showAdminButton && (
              <button
                type="button"
                onClick={() => {
                  setAdminWorldTarget(purchaseModalWorld);
                  setPurchaseModalWorld(null);
                  setShowAdminPassword(true);
                  setShowAdminButton(false);
                }}
                className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Admin
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
