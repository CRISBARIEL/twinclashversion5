import { useCallback, useEffect, useRef, useState } from 'react';
import { GameCore } from './GameCore';
import { addCoins, setCurrentLevel } from '../lib/progression';
import { getLevelConfig } from '../lib/levels';
import { WorldUnlockModal } from './WorldUnlockModal';
import { WorldIntroScreen } from './WorldIntroScreen';
import { soundManager } from '../lib/sound';
import { completeWorldLevel, getWorldIdForLevel, getLevelInWorld } from '../lib/worldProgress';

export interface WorldUnlockEvent {
  completedWorld: number;
  unlockedWorld: number;
  coinsEarned: number;
  isGameComplete: boolean;
}

type BannerType = 'level' | 'end' | null;

interface GameShellProps {
  initialLevel: number;
  onBackToMenu: () => void;
  onShowWorldMap?: () => void;
  // removed custom photo feature
}

export const GameShell = ({ initialLevel, onBackToMenu, onShowWorldMap }: GameShellProps) => {
  const [level, setLevel] = useState(initialLevel);
  const [nextLevel, setNextLevel] = useState<number | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerType, setBannerType] = useState<BannerType>(null);
  const [worldUnlockEvent, setWorldUnlockEvent] = useState<WorldUnlockEvent | null>(null);
  const [showWorldIntro, setShowWorldIntro] = useState(false);
  const [introWorld, setIntroWorld] = useState(1);

  const completedRef = useRef(false);
  const lastWorldRef = useRef<number>(getLevelConfig(initialLevel)?.world || 1);

  const onLevelCompleted = useCallback(async () => {
    if (completedRef.current) {
      console.log('[GameShell] onLevelCompleted: already completed, skipping');
      return;
    }
    completedRef.current = true;

    const config = getLevelConfig(level);
    if (!config) return;

    const worldId = getWorldIdForLevel(level);
    const levelInWorld = getLevelInWorld(level);

    await completeWorldLevel(worldId, levelInWorld, 3);

    addCoins(config.unlockReward);

    if (config.level === 5) {
      const nextWorld = config.world + 1;

      if (nextWorld <= 10) {
        setWorldUnlockEvent({
          completedWorld: config.world,
          unlockedWorld: nextWorld,
          coinsEarned: config.unlockReward,
          isGameComplete: false,
        });
      } else {
        setWorldUnlockEvent({
          completedWorld: config.world,
          unlockedWorld: config.world,
          coinsEarned: config.unlockReward,
          isGameComplete: true,
        });
      }
    } else {
      const nextLevelId = level + 1;
      console.log('[GameShell] Moving to next level:', nextLevelId);
      setCurrentLevel(nextLevelId);
      setLevel(nextLevelId);
    }
  }, [level]);

  useEffect(() => {
    console.log('[GameShell] LEVEL_CHANGED', level);
    completedRef.current = false;

    const currentConfig = getLevelConfig(level);
    if (currentConfig && currentConfig.world !== lastWorldRef.current && currentConfig.level === 1) {
      setIntroWorld(currentConfig.world);
      setShowWorldIntro(true);
      lastWorldRef.current = currentConfig.world;
    }

    soundManager.stopStartMusic();
  }, [level]);

  const handleNextLevel = useCallback(() => {
    console.log('[GameShell] handleNextLevel', { level, nextLevel });
    if (nextLevel == null) return;
    setLevel(nextLevel);
    setNextLevel(null);
    setShowBanner(false);
    setBannerType(null);
  }, [nextLevel, level]);

  const handleWorldUnlockContinue = useCallback(() => {
    setWorldUnlockEvent(null);
    const nextLevelId = level + 1;
    const newLevelConfig = getLevelConfig(nextLevelId);
    if (newLevelConfig) {
      setIntroWorld(newLevelConfig.world);
      setShowWorldIntro(true);
      lastWorldRef.current = newLevelConfig.world;
    }
    setLevel(nextLevelId);
  }, [level]);

  const handleStartWorld = useCallback(() => {
    setShowWorldIntro(false);
  }, []);

  console.log('[GameShell] Render', { level, nextLevel, showBanner, bannerType, worldUnlockEvent });

  return (
    <>
      {showWorldIntro ? (
        <WorldIntroScreen
          world={introWorld}
          onStart={handleStartWorld}
        />
      ) : (
        <section key={`level-${level}`}>
          <GameCore
            level={level}
            onComplete={onLevelCompleted}
            onBackToMenu={onBackToMenu}
          />
        </section>
      )}

      {worldUnlockEvent && (
        <WorldUnlockModal
          completedWorld={worldUnlockEvent.completedWorld}
          unlockedWorld={worldUnlockEvent.unlockedWorld}
          coinsEarned={worldUnlockEvent.coinsEarned}
          isGameComplete={worldUnlockEvent.isGameComplete}
          onContinue={handleWorldUnlockContinue}
        />
      )}

      {showBanner && nextLevel != null && !worldUnlockEvent && (() => {
        console.log('[GameShell] SHOWING BANNER MODAL');
        return true;
      })() && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl pointer-events-auto">
            {bannerType === 'level' ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold text-green-600 mb-2">¡Nivel {level} Completado!</h3>
                <p className="text-gray-600 mb-6">Pulsa para continuar.</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleNextLevel}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Siguiente Nivel {nextLevel}
                  </button>
                  <div className="flex gap-3">
                    {onShowWorldMap && (
                      <button
                        onClick={onShowWorldMap}
                        className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all"
                      >
                        Ver Mundos
                      </button>
                    )}
                    <button
                      onClick={onBackToMenu}
                      className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all"
                    >
                      Menú
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2">
                  ¡Has completado todas las fases!
                </h3>
                <p className="text-gray-600 mb-6">¿Quieres volver a empezar?</p>
                <div className="flex gap-3">
                  <button
                    onClick={onBackToMenu}
                    className="flex-1 bg-gray-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Menú
                  </button>
                  <button
                    onClick={handleNextLevel}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Nivel {nextLevel}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
