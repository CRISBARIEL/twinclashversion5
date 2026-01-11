import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Share2, Trophy, List, ArrowLeft } from 'lucide-react';
import { GameCard } from './GameCard';
import { Leaderboard } from './Leaderboard';
import { PowerUpButtons } from './PowerUpButtons';
import { CoinShop } from './CoinShop';
import { ExitConfirmModal } from './ExitConfirmModal';
import { SoundGear } from './SoundGear';
import { ShareModal } from './ShareModal';
import { ShatterEffect, ShatterTheme } from './ShatterEffect';
import { CountdownOverlay } from './CountdownOverlay';
import { DifficultyOverlay } from './DifficultyOverlay';
import { Card, PREVIEW_TIME, FLIP_DELAY, GameMetrics, BestScore } from '../types';
import { createConfetti } from '../utils/confetti';
import { getSeedFromURLorToday, shuffleWithSeed } from '../lib/seed';
import { submitScoreAndReward, getCrewIdFromURL, setCrewIdInURL } from '../lib/api';
import { addCoins, getLocalCoins } from '../lib/progression';
import { getLevelConfig } from '../lib/levels';
import { getThemeImages, getThemeBackground } from '../lib/themes';
import { soundManager } from '../lib/sound';
import { useBackExitGuard } from '../hooks/useBackExitGuard';

interface GameCoreProps {
  level: number;
  onComplete: () => void;
  onBackToMenu: () => void;
  isDailyChallenge?: boolean;
  duelCode?: string;
  duelRole?: 'host' | 'guest';
  duelSeed?: string;
  duelLevel?: number;
  onDuelFinish?: (result: {
    win: boolean;
    timeMs: number;
    moves: number;
    pairsFound: number;
    level: number;
    duelCode: string;
    duelRole: 'host' | 'guest';
  }) => void;
}

export const GameCore = ({
  level,
  onComplete,
  onBackToMenu,
  isDailyChallenge = false,
  duelCode,
  duelRole,
  duelSeed,
  duelLevel,
  onDuelFinish,
}: GameCoreProps) => {
  const isDuel = !!duelCode && !!duelRole && !!duelSeed && typeof duelLevel === 'number';
  const activeLevel = isDuel ? (duelLevel as number) : level;
  const levelConfig = getLevelConfig(activeLevel);

  if (!levelConfig) {
    console.error('[GameCore] Invalid level config for level:', activeLevel);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Nivel inválido</h2>
            <p className="text-gray-600 mb-6">
              No se pudo cargar la configuración del nivel {activeLevel}
            </p>
            <button
              onClick={onBackToMenu}
              className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl transition-all"
            >
              Volver al Menú
            </button>
          </div>
        </div>
      </div>
    );
  }
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [showDifficulty, setShowDifficulty] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [isPreview, setIsPreview] = useState(true);
  const [timeLeft, setTimeLeft] = useState(levelConfig?.timeLimit || 60);
  const [gameOver, setGameOver] = useState(false);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showWinModal, setShowWinModal] = useState(false);
  const [bestScore, setBestScore] = useState<BestScore | null>(null);
  const [seed] = useState(() => {
    if (isDuel) return duelSeed as string;
    return isDailyChallenge ? getSeedFromURLorToday() : `random-${Date.now()}`;
  });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isPioneer, setIsPioneer] = useState(false);
  const [crewId, setCrewId] = useState(() => getCrewIdFromURL());
  const [finalTime, setFinalTime] = useState(0);
  const [finalMoves, setFinalMoves] = useState(0);
  const [hintCards, setHintCards] = useState<number[]>([]);
  const [consecutiveMisses, setConsecutiveMisses] = useState(0);
  const [showCoinShop, setShowCoinShop] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({ text: '', url: '' });
  const [crackedCards, setCrackedCards] = useState<Set<number>>(new Set());
  const [breakingCards, setBreakingCards] = useState<Set<number>>(new Set());
  const [showObstacleTutorial, setShowObstacleTutorial] = useState(false);
  const [shatterTrigger, setShatterTrigger] = useState(false);
  const [shatterTheme, setShatterTheme] = useState<ShatterTheme>('ice');
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [currentCoins, setCurrentCoins] = useState(0);
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(0);
  const [streakMatches, setStreakMatches] = useState(0);
  const [comboCardId, setComboCardId] = useState<number | null>(null);
  const [enableHazards, setEnableHazards] = useState(false);
  const [lastAdjacentPairMatchedAtMs, setLastAdjacentPairMatchedAtMs] = useState(0);
  const [hazardMessage, setHazardMessage] = useState<string | null>(null);
  const hazardTickRef = useRef<number | null>(null);

  const handleExitConfirmed = useCallback(() => {
    soundManager.stopLevelMusic();
    onBackToMenu();
  }, [onBackToMenu]);

  const { open: exitModalOpen, openModal: openExitModal, closeModal: closeExitModal } = useBackExitGuard({
    enabled: !showWinModal && !gameOver,
    onConfirmExit: handleExitConfirmed,
    isLevelCompleted: showWinModal,
  });

  const isCheckingRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const previewTimerRef = useRef<number | null>(null);
  const elapsedTimerRef = useRef<number | null>(null);
  const gameStartTimeRef = useRef<number>(0);
  const hintTimeoutRef = useRef<number | null>(null);
  const triggerIceBreakerRef = useRef<((cardId: number) => void) | null>(null);
  const levelCompletedRef = useRef(false);

  const BASE_LEVEL_WORLD_21 = 101;
  const LEVELS_PER_WORLD = 5;

  function shouldEnableHazardsFor(levelNumber: number, worldId: number) {
    if (worldId < 21 || worldId > 28) return false;

    const worldIndex = worldId - 21;
    const worldStart = BASE_LEVEL_WORLD_21 + worldIndex * LEVELS_PER_WORLD;
    const levelIndexInWorld = levelNumber - worldStart;

    return levelIndexInWorld >= 3 && levelIndexInWorld <= 4;
  }

  function applySafeVirusInfection(prevCards: Card[]): Card[] {
    const gridSize = Math.ceil(Math.sqrt(prevCards.length));

    const getAdjacent = (idx: number) => {
      const row = Math.floor(idx / gridSize);
      const col = idx % gridSize;
      const adj: number[] = [];
      if (col > 0) adj.push(idx - 1);
      if (col < gridSize - 1) adj.push(idx + 1);
      if (row > 0) adj.push(idx - gridSize);
      if (row < gridSize - 1) adj.push(idx + gridSize);
      return adj.filter(i => i >= 0 && i < prevCards.length);
    };

    const virusIdxs = prevCards
      .map((c, i) => (c.obstacle === 'virus' ? i : -1))
      .filter(i => i >= 0);

    if (virusIdxs.length === 0) return prevCards;

    const candidates: number[] = [];
    for (const vIdx of virusIdxs) {
      for (const a of getAdjacent(vIdx)) {
        const c = prevCards[a];
        if (!c) continue;
        if (c.isMatched) continue;
        if (c.isFlipped) continue;
        if (c.obstacle && (c.obstacleHealth ?? 0) > 0) continue;
        if (c.obstacle === 'virus' || c.obstacle === 'bomb' || c.obstacle === 'fire') continue;
        candidates.push(a);
      }
    }

    if (candidates.length === 0) return prevCards;

    const MAX_INFECT = 2;
    const picked: number[] = [];
    const usedImageIndex = new Set<number>();

    for (const idx of candidates.sort(() => Math.random() - 0.5)) {
      if (picked.length >= MAX_INFECT) break;
      const c = prevCards[idx];

      if (usedImageIndex.has(c.imageIndex)) continue;

      usedImageIndex.add(c.imageIndex);
      picked.push(idx);
    }

    if (picked.length === 0) return prevCards;

    return prevCards.map((c, idx) => {
      if (!picked.includes(idx)) return c;
      return { ...c, obstacle: 'ice', obstacleHealth: 1 };
    });
  }

  const initializeLevel = useCallback(() => {
    console.log('[GameCore] initializeLevel', { level: activeLevel, seed, isDuel, duelCode });

    const config = getLevelConfig(activeLevel);
    const pairs = config?.pairs || 6;
    const timeLimit = config?.timeLimit || 60;
    const theme = config?.theme || 'nature';

    const worldId = config?.world ?? 0;
    const hazardsOn = shouldEnableHazardsFor(level, worldId);
    setEnableHazards(hazardsOn);
    setLastAdjacentPairMatchedAtMs(Date.now());
    setHazardMessage(null);

    const themeImages = getThemeImages(theme);
    const selectedImages = themeImages.slice(0, pairs);

    const cardPairs = selectedImages.flatMap((img, idx) => [
      { id: idx * 2, imageIndex: idx, isFlipped: false, isMatched: false, obstacle: null, obstacleHealth: 0 },
      { id: idx * 2 + 1, imageIndex: idx, isFlipped: false, isMatched: false, obstacle: null, obstacleHealth: 0 },
    ]);

    const shuffled = isDailyChallenge ? shuffleWithSeed(cardPairs, seed) : cardPairs.sort(() => Math.random() - 0.5);

    const obstacles = config?.obstacles;
    if (obstacles) {
      const totalCards = shuffled.length;
      const pairsCount = totalCards / 2;
      const gridSize = 4;

      const totalObstacles = (obstacles.ice || 0) + (obstacles.stone || 0) + (obstacles.iron || 0);
      const minFreePairs = Math.max(2, Math.ceil(pairsCount * 0.35));

      const pairGroups = new Map<number, number[]>();
      shuffled.forEach((card, idx) => {
        if (!pairGroups.has(card.imageIndex)) {
          pairGroups.set(card.imageIndex, []);
        }
        pairGroups.get(card.imageIndex)!.push(idx);
      });

      const allPairIndices = Array.from(pairGroups.keys());
      const protectedPairs = allPairIndices.slice(0, minFreePairs);
      const protectedIndices = new Set<number>();

      protectedPairs.forEach(pairIdx => {
        const indices = pairGroups.get(pairIdx) || [];
        indices.forEach(idx => protectedIndices.add(idx));
      });

      const getAdjacentIndices = (idx: number) => {
        const adjacent: number[] = [];
        const row = Math.floor(idx / gridSize);
        const col = idx % gridSize;
        if (col > 0) adjacent.push(idx - 1);
        if (col < gridSize - 1) adjacent.push(idx + 1);
        if (row > 0) adjacent.push(idx - gridSize);
        if (row < gridSize - 1) adjacent.push(idx + gridSize);
        return adjacent;
      };

      const hasAccess = (idx: number, occupiedIndices: Set<number>) => {
        const adjacentIndices = getAdjacentIndices(idx);
        return adjacentIndices.some(adjIdx => !occupiedIndices.has(adjIdx));
      };

      const canPlaceObstacle = (idx: number, occupiedIndices: Set<number>, isHeavy: boolean) => {
        const pairCard = shuffled.find(c => c.id !== shuffled[idx].id && c.imageIndex === shuffled[idx].imageIndex);
        if (!pairCard) return false;

        const pairIdx = shuffled.findIndex(c => c.id === pairCard.id);

        const tempOccupied = new Set(occupiedIndices);
        tempOccupied.add(idx);

        if (!hasAccess(pairIdx, tempOccupied)) {
          return false;
        }

        if (isHeavy) {
          const adjacentIndices = getAdjacentIndices(idx);
          const hasHeavyNeighbor = adjacentIndices.some(adjIdx => {
            const card = shuffled[adjIdx];
            return card.obstacle === 'stone' || card.obstacle === 'iron';
          });
          if (hasHeavyNeighbor) return false;
        }

        return true;
      };

      const availableIndices = shuffled
        .map((_, i) => i)
        .filter(i => !protectedIndices.has(i));

      const shuffleIndices = isDailyChallenge
        ? shuffleWithSeed([...availableIndices], seed + '-obstacles')
        : availableIndices.sort(() => Math.random() - 0.5);

      const occupiedIndices = new Set<number>();

      if (obstacles.ice) {
        let placed = 0;
        for (let i = 0; i < shuffleIndices.length && placed < obstacles.ice; i++) {
          const idx = shuffleIndices[i];
          if (canPlaceObstacle(idx, occupiedIndices, false)) {
            shuffled[idx].obstacle = 'ice';
            shuffled[idx].obstacleHealth = 1;
            occupiedIndices.add(idx);
            placed++;
          }
        }
      }

      if (obstacles.stone) {
        let placed = 0;
        for (let i = 0; i < shuffleIndices.length && placed < obstacles.stone; i++) {
          const idx = shuffleIndices[i];
          if (!occupiedIndices.has(idx) && canPlaceObstacle(idx, occupiedIndices, true)) {
            shuffled[idx].obstacle = 'stone';
            shuffled[idx].obstacleHealth = 2;
            occupiedIndices.add(idx);
            placed++;
          }
        }
      }

      if (obstacles.iron) {
        let placed = 0;
        for (let i = 0; i < shuffleIndices.length && placed < obstacles.iron; i++) {
          const idx = shuffleIndices[i];
          if (!occupiedIndices.has(idx) && canPlaceObstacle(idx, occupiedIndices, true)) {
            shuffled[idx].obstacle = 'iron';
            shuffled[idx].obstacleHealth = 2;
            occupiedIndices.add(idx);
            placed++;
          }
        }
      }

      if (obstacles.fire) {
        let placed = 0;
        for (let i = 0; i < shuffleIndices.length && placed < obstacles.fire; i++) {
          const idx = shuffleIndices[i];
          if (!occupiedIndices.has(idx) && canPlaceObstacle(idx, occupiedIndices, false)) {
            shuffled[idx].obstacle = 'fire';
            shuffled[idx].obstacleHealth = 0;
            shuffled[idx].blockedHealth = 2;
            occupiedIndices.add(idx);
            placed++;
          }
        }
      }

      if (obstacles.bomb) {
        let placed = 0;
        for (let i = 0; i < shuffleIndices.length && placed < obstacles.bomb; i++) {
          const idx = shuffleIndices[i];
          if (!occupiedIndices.has(idx) && canPlaceObstacle(idx, occupiedIndices, false)) {
            shuffled[idx].obstacle = 'bomb';
            shuffled[idx].obstacleHealth = 0;
            shuffled[idx].blockedHealth = 2;
            occupiedIndices.add(idx);
            placed++;
          }
        }
      }

      if (obstacles.virus) {
        let placed = 0;
        for (let i = 0; i < shuffleIndices.length && placed < obstacles.virus; i++) {
          const idx = shuffleIndices[i];
          if (!occupiedIndices.has(idx) && canPlaceObstacle(idx, occupiedIndices, false)) {
            shuffled[idx].obstacle = 'virus';
            shuffled[idx].obstacleHealth = 0;
            shuffled[idx].blockedHealth = 1;
            occupiedIndices.add(idx);
            placed++;
          }
        }
      }
    }

    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setShowCountdown(false);
    setShowDifficulty(!isDailyChallenge && !!config?.difficulty);
    setIsPreview(true);
    setGameOver(false);
    setTimeLeft(timeLimit);
    setMoves(0);
    setTimeElapsed(0);
    setShowWinModal(false);
    setHintCards([]);
    setConsecutiveMisses(0);
    setCrackedCards(new Set());
    setBreakingCards(new Set());
    setStreakMatches(0);
    setComboCardId(null);
    gameStartTimeRef.current = 0;
    levelCompletedRef.current = false;

    if (config?.obstacles && (config.obstacles.ice || config.obstacles.stone || config.obstacles.iron)) {
      const hasSeenTutorial = localStorage.getItem('obstacle_tutorial_seen');
      if (!hasSeenTutorial) {
        setTimeout(() => {
          setShowObstacleTutorial(true);
          setIsTimerPaused(true);
        }, 1000);
      }
    }

    if (isDailyChallenge || !config?.difficulty) {
      setShowCountdown(true);
    }

    soundManager.stopLevelMusic();
    if (config) {
      soundManager.playLevelMusic(config.world);
    }

    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    const totalPreviewTime = (!isDailyChallenge && config?.difficulty)
      ? 2.5 + PREVIEW_TIME
      : PREVIEW_TIME;
    previewTimerRef.current = window.setTimeout(() => {
      setIsPreview(false);
      setShowCountdown(false);
      setShowDifficulty(false);
    }, totalPreviewTime * 1000);
    if (isDailyChallenge) {
      const stored = localStorage.getItem(`best:${seed}`);
      if (stored) {
        try {
          setBestScore(JSON.parse(stored));
        } catch (e) {
          setBestScore(null);
        }
      } else {
        setBestScore(null);
      }
    }
  }, [level, seed, isDailyChallenge]);

  useEffect(() => {
    console.log('[GameCore] mount for level', level);
    initializeLevel();
    setCurrentCoins(getLocalCoins());

    return () => {
      console.log('[GameCore] unmount for level', level);
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      if (hazardTickRef.current) clearInterval(hazardTickRef.current);
    };
  }, [level, initializeLevel]);

  useEffect(() => {
    if (isPreview || gameOver || isTimerPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      return;
    }

    if (gameStartTimeRef.current === 0) {
      gameStartTimeRef.current = Date.now();
    }

    timerRef.current = window.setInterval(() => {
      setFreezeTimeLeft((freeze) => {
        if (freeze > 0) {
          return freeze - 1;
        }

        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
            soundManager.stopLevelMusic();
            soundManager.playLose();

            if (isDuel && duelCode && duelRole && onDuelFinish) {
              const elapsedMs = gameStartTimeRef.current > 0
                ? Date.now() - gameStartTimeRef.current
                : Date.now();
              console.log('[GameCore] Time out! Calling onDuelFinish with:', {
                win: false,
                timeMs: elapsedMs,
                moves,
                pairsFound: matchedPairs,
                level: activeLevel,
              });
              onDuelFinish({
                win: false,
                timeMs: elapsedMs,
                moves,
                pairsFound: matchedPairs,
                level: activeLevel,
                duelCode,
                duelRole,
              });
              return 0;
            }

            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });

        return 0;
      });
    }, 1000);

    elapsedTimerRef.current = window.setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - gameStartTimeRef.current) / 1000));
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [isPreview, gameOver, isTimerPaused]);

  useEffect(() => {
    const TIMEOUT_MS = 15_000;

    if (!enableHazards || isPreview || gameOver || isTimerPaused) {
      if (hazardTickRef.current) clearInterval(hazardTickRef.current);
      return;
    }

    if (hazardTickRef.current) clearInterval(hazardTickRef.current);

    hazardTickRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastAdjacentPairMatchedAtMs;
      if (elapsed < TIMEOUT_MS) return;

      const hasBomb = cards.some(c => c.obstacle === 'bomb');
      const hasVirus = cards.some(c => c.obstacle === 'virus');

      if (hasBomb) {
        if (hazardTickRef.current) clearInterval(hazardTickRef.current);
        soundManager.stopLevelMusic();
        soundManager.playLose();
        setHazardMessage('💣 La bomba explotó (15s sin pareja adyacente).');
        setGameOver(true);
        return;
      }

      if (hasVirus) {
        setCards(prev => applySafeVirusInfection(prev));
        setLastAdjacentPairMatchedAtMs(now);
      } else {
        setLastAdjacentPairMatchedAtMs(now);
      }
    }, 250);

    return () => {
      if (hazardTickRef.current) clearInterval(hazardTickRef.current);
    };
  }, [enableHazards, isPreview, gameOver, isTimerPaused, lastAdjacentPairMatchedAtMs, cards]);

  useEffect(() => {
    const totalPairs = levelConfig?.pairs || 6;
    if (matchedPairs === totalPairs && matchedPairs > 0 && !levelCompletedRef.current) {
      levelCompletedRef.current = true;
      console.log('[GameCore] LEVEL COMPLETED', { level, matchedPairs, moves, timeElapsed, totalPairs });
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      createConfetti();
      soundManager.stopLevelMusic();
      soundManager.playWin();

      const finalTimeValue = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      setTimeElapsed(finalTimeValue);
      setFinalTime(finalTimeValue);
      setFinalMoves(moves);

      if (isDuel && duelCode && duelRole && onDuelFinish) {
        console.log('[GameCore] Calling onDuelFinish with:', {
          win: true,
          timeMs: finalTimeValue * 1000,
          moves,
          pairsFound: totalPairs,
          level: activeLevel,
        });
        onDuelFinish({
          win: true,
          timeMs: finalTimeValue * 1000,
          moves,
          pairsFound: totalPairs,
          level: activeLevel,
          duelCode,
          duelRole,
        });
        return;
      }

      const handleLevelComplete = async () => {
        if (isDailyChallenge) {
          const stored = localStorage.getItem(`best:${seed}`);
          let shouldSave = true;
          if (stored) {
            try {
              const prev: BestScore = JSON.parse(stored);
              if (finalTimeValue > prev.time || (finalTimeValue === prev.time && moves >= prev.moves)) {
                shouldSave = false;
              }
            } catch (e) {
              //
            }
          }

          if (shouldSave) {
            const newBest: BestScore = { time: finalTimeValue, moves, date: new Date().toISOString() };
            localStorage.setItem(`best:${seed}`, JSON.stringify(newBest));
            setBestScore(newBest);
          }

          try {
            const result = await submitScoreAndReward({ seed, timeMs: finalTimeValue * 1000, moves, crewId, levelId: activeLevel });
            if (result.isPioneer) {
              setIsPioneer(true);
            }
            console.log('[GameCore] Score saved successfully for challenge level', level);
          } catch (err) {
            console.error('[GameCore] Failed to submit score:', err);
          }

          const baseCoins = 10;
          setCoinsEarned(baseCoins);
          addCoins(baseCoins);
          setCurrentCoins(getLocalCoins());

          setTimeout(() => {
            setShowWinModal(true);
            setTimeout(() => setShowCoinAnimation(true), 500);
          }, 1500);
        } else {
          try {
            const result = await submitScoreAndReward({ seed, timeMs: finalTimeValue * 1000, moves, crewId, levelId: activeLevel });
            if (result.isPioneer) {
              setIsPioneer(true);
            }
          } catch (err) {
            console.error('[GameCore] Failed to submit score:', err);
          }

          const baseCoins = 10;
          setCoinsEarned(baseCoins);
          addCoins(baseCoins);
          setCurrentCoins(getLocalCoins());

          setTimeout(() => {
            setShowWinModal(true);
            setTimeout(() => setShowCoinAnimation(true), 500);
          }, 1500);
        }
      };

      handleLevelComplete();
    }
  }, [matchedPairs, level, onComplete, isDailyChallenge, seed, crewId, moves]);

  useEffect(() => {
    triggerIceBreakerRef.current = (centerCardId: number) => {
      const centerIdx = cards.findIndex(c => c.id === centerCardId);
      if (centerIdx === -1) return;

      const gridSize = Math.ceil(Math.sqrt(cards.length));
      const centerRow = Math.floor(centerIdx / gridSize);
      const centerCol = centerIdx % gridSize;

      const neighborIndices: number[] = [];
      for (let dRow = -1; dRow <= 1; dRow++) {
        for (let dCol = -1; dCol <= 1; dCol++) {
          const newRow = centerRow + dRow;
          const newCol = centerCol + dCol;
          if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            const idx = newRow * gridSize + newCol;
            if (idx < cards.length) {
              neighborIndices.push(idx);
            }
          }
        }
      }

      setComboCardId(centerCardId);
      setTimeout(() => setComboCardId(null), 1000);

      const newCrackedCards = new Set(crackedCards);
      const newBreakingCards = new Set(breakingCards);

      neighborIndices.forEach((idx) => {
        const card = cards[idx];
        if (card?.obstacle === 'ice' && (card.obstacleHealth ?? 0) > 0) {
          const newHealth = (card.obstacleHealth ?? 0) - 1;
          if (newHealth <= 0) {
            newBreakingCards.add(card.id);
            setTimeout(() => {
              setBreakingCards((prev) => {
                const updated = new Set(prev);
                updated.delete(card.id);
                return updated;
              });
            }, 600);
          } else {
            newCrackedCards.add(card.id);
            setTimeout(() => {
              setCrackedCards((prev) => {
                const updated = new Set(prev);
                updated.delete(card.id);
                return updated;
              });
            }, 500);
          }
        }
      });

      setCrackedCards(newCrackedCards);
      setBreakingCards(newBreakingCards);

      setCards((prev) =>
        prev.map((c, idx) => {
          if (neighborIndices.includes(idx) && c.obstacle === 'ice' && (c.obstacleHealth ?? 0) > 0) {
            const newHealth = (c.obstacleHealth ?? 0) - 1;
            if (newHealth <= 0) {
              addCoins(10);
              setCurrentCoins(getLocalCoins());
              setShatterTheme('ice');
              setShatterTrigger(true);
              setTimeout(() => setShatterTrigger(false), 100);
              return { ...c, obstacle: null, obstacleHealth: 0 };
            }
            return { ...c, obstacleHealth: newHealth };
          }
          return c;
        })
      );
    };
  }, [cards, crackedCards, breakingCards]);

  const handleCardClick = useCallback((id: number) => {
    if (isPreview || isCheckingRef.current || flippedCards.length >= 2) return;

    const card = cards.find((c) => c.id === id);
    if (!card || card.isMatched || flippedCards.includes(id)) return;

    if (card.bombCountdown && card.bombCountdown > 0) {
      return;
    }

    if (card.obstacle && (card.obstacleHealth ?? 0) > 0) {
      return;
    }

    if ((card.blockedHealth ?? 0) > 0) {
      return;
    }

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
    );

    if (newFlipped.length === 2) {
      isCheckingRef.current = true;
      setMoves((prev) => prev + 1);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      const isMatch = firstCard && secondCard && (
        firstCard.imageIndex === secondCard.imageIndex ||
        firstCard.isWildcard ||
        secondCard.isWildcard
      );

      if (isMatch) {
        const idxA = cards.findIndex(c => c.id === firstId);
        const idxB = cards.findIndex(c => c.id === secondId);

        const isAdjacentPair = (() => {
          if (idxA < 0 || idxB < 0) return false;
          const gridSize = Math.ceil(Math.sqrt(cards.length));
          const rowA = Math.floor(idxA / gridSize);
          const colA = idxA % gridSize;

          const neighbors: number[] = [];
          if (colA > 0) neighbors.push(idxA - 1);
          if (colA < gridSize - 1) neighbors.push(idxA + 1);
          if (rowA > 0) neighbors.push(idxA - gridSize);
          if (rowA < gridSize - 1) neighbors.push(idxA + gridSize);

          return neighbors.includes(idxB);
        })();

        if (enableHazards && isAdjacentPair) {
          setLastAdjacentPairMatchedAtMs(Date.now());
        }

        soundManager.playMatch();

        const getAdjacentIndices = (cardId: number): number[] => {
          const idx = cards.findIndex(c => c.id === cardId);
          const gridSize = Math.ceil(Math.sqrt(cards.length));
          const row = Math.floor(idx / gridSize);
          const col = idx % gridSize;

          const adjacent: number[] = [];
          if (col > 0) adjacent.push(idx - 1);
          if (col < gridSize - 1) adjacent.push(idx + 1);
          if (row > 0) adjacent.push(idx - gridSize);
          if (row < gridSize - 1) adjacent.push(idx + gridSize);

          return adjacent;
        };

        const adjacentIndices = [...getAdjacentIndices(firstId), ...getAdjacentIndices(secondId)];

        const newCrackedCards = new Set(crackedCards);
        const newBreakingCards = new Set(breakingCards);

        adjacentIndices.forEach((idx) => {
          const card = cards[idx];
          if (card?.obstacle && (card.obstacleHealth ?? 0) > 0) {
            const newHealth = (card.obstacleHealth ?? 0) - 1;
            if (newHealth <= 0) {
              newBreakingCards.add(card.id);
              setTimeout(() => {
                setBreakingCards((prev) => {
                  const updated = new Set(prev);
                  updated.delete(card.id);
                  return updated;
                });
              }, 600);
            } else {
              newCrackedCards.add(card.id);
              setTimeout(() => {
                setCrackedCards((prev) => {
                  const updated = new Set(prev);
                  updated.delete(card.id);
                  return updated;
                });
              }, 500);
            }
          }
        });

        setCrackedCards(newCrackedCards);
        setBreakingCards(newBreakingCards);

        setCards((prev) =>
          prev.map((c, idx) => {
            if (c.id === firstId || c.id === secondId) {
              return { ...c, isMatched: true };
            }

            if (adjacentIndices.includes(idx) && c.obstacle && (c.obstacleHealth ?? 0) > 0) {
              const newHealth = (c.obstacleHealth ?? 0) - 1;
              if (newHealth <= 0) {
                // Award coins when obstacle is destroyed
                if (c.obstacle === 'ice') {
                  addCoins(10); // 10 coins for ice
                  setCurrentCoins(getLocalCoins());
                  console.log('[GameCore] Ice destroyed! +10 coins');
                  setShatterTheme('ice');
                  setShatterTrigger(true);
                  setTimeout(() => setShatterTrigger(false), 100);
                } else if (c.obstacle === 'stone') {
                  addCoins(20);
                  setCurrentCoins(getLocalCoins());
                  console.log('[GameCore] Stone destroyed! +20 coins');
                  setShatterTheme('stone');
                  setShatterTrigger(true);
                  setTimeout(() => setShatterTrigger(false), 100);
                } else if (c.obstacle === 'iron') {
                  addCoins(20);
                  setCurrentCoins(getLocalCoins());
                  console.log('[GameCore] Iron destroyed! +20 coins');
                  setShatterTheme('stone');
                  setShatterTrigger(true);
                  setTimeout(() => setShatterTrigger(false), 100);
                }
                return { ...c, obstacle: null, obstacleHealth: 0 };
              }
              return { ...c, obstacleHealth: newHealth };
            }

            if (adjacentIndices.includes(idx) && (c.blockedHealth ?? 0) > 0) {
              const newBlockedHealth = (c.blockedHealth ?? 0) - 1;
              if (newBlockedHealth <= 0) {
                return { ...c, blockedHealth: 0, obstacle: null, obstacleHealth: 0 };
              }
              return { ...c, blockedHealth: newBlockedHealth };
            }

            return c;
          })
        );

        setMatchedPairs((prev) => prev + 1);
        setFlippedCards([]);
        setConsecutiveMisses(0);
        setHintCards([]);

        setStreakMatches((prev) => {
          const newStreak = prev + 1;
          if (newStreak >= 6) {
            const hasIceOnly = cards.some(c => c.obstacle === 'ice' && !cards.some(c2 => c2.obstacle === 'stone' || c2.obstacle === 'iron'));
            if (hasIceOnly) {
              setTimeout(() => {
                triggerIceBreakerRef.current?.(secondId);
              }, 100);
            }
            return 0;
          }
          return newStreak;
        });

        isCheckingRef.current = false;
      } else {
        setStreakMatches(0);
        setConsecutiveMisses((prev) => prev + 1);

        if (firstCard?.obstacle === 'fire' || secondCard?.obstacle === 'fire') {
          setTimeLeft((prev) => Math.max(0, prev - 5));
        }

        if (firstCard?.obstacle === 'bomb' || secondCard?.obstacle === 'bomb') {
          const unmatched = cards.map((_, i) => i).filter(i => !cards[i].isMatched);
          const toFlip = Math.min(6, unmatched.length);
          const shuffled = unmatched.sort(() => Math.random() - 0.5).slice(0, toFlip);

          setCards((prev) =>
            prev.map((c, idx) => {
              if (shuffled.includes(idx)) {
                return { ...c, isFlipped: false };
              }
              return c;
            })
          );

          setFlippedCards([]);
          isCheckingRef.current = false;
          return;
        }

        if (firstCard?.obstacle === 'virus' || secondCard?.obstacle === 'virus') {
          setTimeLeft((prev) => Math.max(0, prev - 3));
        }

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
          isCheckingRef.current = false;
        }, FLIP_DELAY);
      }
    }
  }, [cards, flippedCards, isPreview, crackedCards, breakingCards]);

  useEffect(() => {
    if (consecutiveMisses >= 4 && !isPreview && !gameOver && hintCards.length === 0) {
      const unmatchedCards = cards.filter(c => !c.isMatched && !c.isFlipped);

      if (unmatchedCards.length >= 2) {
        const imageIndexes = new Map<number, number[]>();
        unmatchedCards.forEach(card => {
          if (!imageIndexes.has(card.imageIndex)) {
            imageIndexes.set(card.imageIndex, []);
          }
          imageIndexes.get(card.imageIndex)!.push(card.id);
        });

        for (const [, cardIds] of imageIndexes) {
          if (cardIds.length >= 2) {
            const [first, second] = cardIds.slice(0, 2);
            setHintCards([first, second]);

            if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
            hintTimeoutRef.current = window.setTimeout(() => {
              setHintCards([]);
            }, 3000);

            break;
          }
        }
      }
    }
  }, [consecutiveMisses, isPreview, gameOver, cards, hintCards.length]);

  const handleFreezeTime = useCallback((seconds: number) => {
    setFreezeTimeLeft(seconds);
  }, []);

  const handlePowerUp = useCallback((percentage: number) => {
    const unmatchedCards = cards.filter(c => !c.isMatched);
    const totalPairs = unmatchedCards.length / 2;
    const pairsToReveal = Math.max(1, Math.floor(totalPairs * (percentage / 100)));

    const pairsByImage = new Map<number, number[]>();
    unmatchedCards.forEach(card => {
      if (!pairsByImage.has(card.imageIndex)) {
        pairsByImage.set(card.imageIndex, []);
      }
      pairsByImage.get(card.imageIndex)!.push(card.id);
    });

    const availablePairs = Array.from(pairsByImage.entries()).filter(([, ids]) => ids.length === 2);

    // Check if level has obstacles
    const hasObstacles = cards.some(c => c.obstacle);

    if (hasObstacles) {
      // DIFFICULT LEVELS: Unlock obstacles based on percentage of cards (not pairs)
      // NEW STRATEGY: Find pairs where AT LEAST ONE card has obstacles, and unlock BOTH cards in those pairs

      // Calculate how many cards to unlock (percentage of total unmatched cards)
      const cardsToUnlockCount = Math.max(2, Math.floor(unmatchedCards.length * (percentage / 100)));
      // Ensure it's an even number (pairs)
      const pairsToUnlock = Math.floor(cardsToUnlockCount / 2);

      // Group all unmatched cards by image index
      const allPairsByImage = new Map<number, Card[]>();
      unmatchedCards.forEach(card => {
        if (!allPairsByImage.has(card.imageIndex)) {
          allPairsByImage.set(card.imageIndex, []);
        }
        allPairsByImage.get(card.imageIndex)!.push(card);
      });

      // Get pairs (both cards) and check if at least one has obstacles
      const pairsWithObstacles = Array.from(allPairsByImage.values())
        .filter(pair => pair.length === 2) // Ensure it's a complete pair
        .filter(pair => pair.some(card => {
          // Include all obstacle types: ice, stone, iron, virus, fire, bomb
          if (!card.obstacle) return false;
          // For obstacles without health, consider them active if they exist
          if (card.obstacle === 'virus' || card.obstacle === 'fire' || card.obstacle === 'bomb') return true;
          // For obstacles with health, check if health > 0
          return (card.obstacleHealth ?? 0) > 0;
        })); // At least one has obstacle

      // Helper: Check if a card is adjacent to locked cards (4-column grid)
      const getAdjacentScore = (pair: Card[]) => {
        return pair.reduce((total, card) => {
          const index = cards.findIndex(c => c.id === card.id);
          if (index === -1) return total;

          const row = Math.floor(index / 4);
          const col = index % 4;

          const adjacentPositions = [
            index - 4,     // top
            index + 4,     // bottom
            col > 0 ? index - 1 : -1,     // left
            col < 3 ? index + 1 : -1,     // right
          ];

          const adjacentLockedCount = adjacentPositions.filter(pos => {
            if (pos < 0 || pos >= cards.length) return false;
            const adjacentCard = cards[pos];
            if (!adjacentCard || !adjacentCard.obstacle) return false;
            // Include all obstacle types
            if (adjacentCard.obstacle === 'virus' || adjacentCard.obstacle === 'fire' || adjacentCard.obstacle === 'bomb') return true;
            return (adjacentCard.obstacleHealth ?? 0) > 0;
          }).length;

          return total + adjacentLockedCount;
        }, 0);
      };

      // Sort pairs by: 1) priority to pairs with obstacles, 2) adjacency score
      const sortedPairs = pairsWithObstacles.sort((pairA, pairB) => {
        const scoreA = getAdjacentScore(pairA);
        const scoreB = getAdjacentScore(pairB);
        return scoreB - scoreA; // Higher score first
      });

      // Select pairs to unlock (both cards in each pair)
      const selectedPairs = sortedPairs.slice(0, pairsToUnlock);
      const cardIdsToUnlock = selectedPairs.flat().map(c => c.id);

      console.log(`[PowerUp ${percentage}%] Unlocking ${cardIdsToUnlock.length} cards in ${selectedPairs.length} pairs`);

      setCards(prev => prev.map(c => {
        if (cardIdsToUnlock.includes(c.id)) {
          // Ice: remove obstacle completely (card stays face down)
          if (c.obstacle === 'ice' && (c.obstacleHealth ?? 0) > 0) {
            console.log(`[PowerUp] Removing ice from card ${c.id}`);
            return { ...c, obstacle: null, obstacleHealth: 0 };
          }
          // Stone with 2 health: reduce to 1 (20% unlock)
          else if (c.obstacle === 'stone' && (c.obstacleHealth ?? 0) === 2) {
            if (percentage === 20) {
              console.log(`[PowerUp] Reducing stone health from 2 to 1 on card ${c.id}`);
              return { ...c, obstacleHealth: 1 };
            } else if (percentage === 40) {
              // 40% removes stone completely
              console.log(`[PowerUp] Removing stone from card ${c.id}`);
              return { ...c, obstacle: null, obstacleHealth: 0 };
            }
          }
          // Stone with 1 health: remove obstacle completely
          else if (c.obstacle === 'stone' && (c.obstacleHealth ?? 0) === 1) {
            console.log(`[PowerUp] Removing stone (health 1) from card ${c.id}`);
            return { ...c, obstacle: null, obstacleHealth: 0 };
          }
          // Iron with 2 health: reduce to 1 (20% unlock) or remove (40% unlock)
          else if (c.obstacle === 'iron' && (c.obstacleHealth ?? 0) === 2) {
            if (percentage === 20) {
              console.log(`[PowerUp] Reducing iron health from 2 to 1 on card ${c.id}`);
              return { ...c, obstacleHealth: 1 };
            } else if (percentage === 40) {
              // 40% removes iron completely
              console.log(`[PowerUp] Removing iron from card ${c.id}`);
              return { ...c, obstacle: null, obstacleHealth: 0 };
            }
          }
          // Iron with 1 health: remove obstacle completely
          else if (c.obstacle === 'iron' && (c.obstacleHealth ?? 0) === 1) {
            console.log(`[PowerUp] Removing iron (health 1) from card ${c.id}`);
            return { ...c, obstacle: null, obstacleHealth: 0 };
          }
          // Virus: Clear virus from card (no propagation during power-up)
          else if (c.obstacle === 'virus') {
            console.log(`[PowerUp] Removing virus from card ${c.id}`);
            return { ...c, obstacle: null, obstacleHealth: 0, isInfected: false, isWildcard: false };
          }
          // Fire: Clear fire from card (no propagation during power-up)
          else if (c.obstacle === 'fire') {
            console.log(`[PowerUp] Removing fire from card ${c.id}`);
            return { ...c, obstacle: null, obstacleHealth: 0 };
          }
          // Bomb: Clear bomb from card
          else if (c.obstacle === 'bomb') {
            console.log(`[PowerUp] Removing bomb from card ${c.id}`);
            return { ...c, obstacle: null, obstacleHealth: 0, bombCountdown: undefined };
          }
        }
        return c;
      }));

      // Don't add to matchedPairs - we only unlocked obstacles
    } else {
      // NO OBSTACLES: Normal behavior
      const pairsToMatch = availablePairs.slice(0, pairsToReveal);

      const cardIdsToMatch: number[] = [];
      pairsToMatch.forEach(([, ids]) => {
        cardIdsToMatch.push(...ids);
      });

      setCards(prev => prev.map(c => {
        if (cardIdsToMatch.includes(c.id)) {
          return { ...c, isFlipped: true, isMatched: true };
        }
        return c;
      }));

      setMatchedPairs(prev => prev + pairsToMatch.length);
    }

    createConfetti();
  }, [cards]);

  const handleRestart = useCallback(() => {
    initializeLevel();
  }, [initializeLevel]);

  const handleShare = useCallback(() => {
    let shareText: string;
    let shareUrl: string;

    if (isDailyChallenge) {
      const url = new URL(window.location.href);
      url.searchParams.set('seed', seed);
      url.searchParams.set('time', finalTime.toString());
      url.searchParams.set('moves', finalMoves.toString());

      let currentCrewId = crewId;
      if (!currentCrewId) {
        const newCrewId = crypto.randomUUID().slice(0, 8);
        url.searchParams.set('crew', newCrewId);
        setCrewIdInURL(newCrewId);
        setCrewId(newCrewId);
        currentCrewId = newCrewId;
      } else {
        url.searchParams.set('crew', currentCrewId);
      }

      shareUrl = url.toString();
      shareText = `¡Completé el reto diario en ${finalTime}s con ${finalMoves} movimientos! ¿Puedes superarme?`;
    } else {
      shareUrl = window.location.origin;
      shareText = `¡Completé el Nivel ${level} en ${finalTime}s con ${finalMoves} movimientos! 🎉 Juega TwinClash y pon a prueba tu memoria.`;
    }

    setShareData({ text: shareText, url: shareUrl });
    setShowShareModal(true);
  }, [seed, finalTime, finalMoves, crewId, isDailyChallenge, level]);

  const config = getLevelConfig(level);
  const theme = config?.theme || 'nature';
  const themeImages = getThemeImages(theme);
  const pairs = config?.pairs || 6;
  const selectedImages = themeImages.slice(0, pairs);
  const timeLimit = config?.timeLimit || 60;
  const background = getThemeBackground(theme);

  const getGridColumns = () => {
    if (pairs <= 10) return 4;
    if (pairs <= 12) return 4;
    if (pairs <= 15) return 5;
    return 6;
  };

  const gridCols = getGridColumns();

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${background.gradient} flex flex-col p-4 relative overflow-hidden`}
      style={{
        backgroundImage: background.pattern
          ? `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
             radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)`
          : undefined
      }}
    >
      {background.pattern && (
        <div className="absolute inset-0 opacity-5 pointer-events-none text-9xl flex flex-wrap justify-around items-center overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="transform rotate-12 scale-150">
              {background.pattern}
            </span>
          ))}
        </div>
      )}
      {showDifficulty && isPreview && !isDailyChallenge && (
        <DifficultyOverlay
          difficulty={levelConfig?.difficulty}
          levelNumber={levelConfig?.level || 1}
          onComplete={() => {
            setShowDifficulty(false);
            setShowCountdown(true);
          }}
        />
      )}
      {showCountdown && isPreview && !showDifficulty && (
        <CountdownOverlay
          initialCount={PREVIEW_TIME}
          onComplete={() => {
            setShowCountdown(false);
            setIsPreview(false);
          }}
        />
      )}
      <div className="bg-white rounded-2xl shadow-xl p-3 mb-3">
        {isDailyChallenge && (
          <div className="mb-2 text-sm text-gray-600 flex flex-col gap-1">
            <span>Reto: {seed}</span>
            {bestScore && (
              <span className="flex items-center gap-1">
                <Trophy size={14} className="text-yellow-500" />
                Mejor: {bestScore.time}s, {bestScore.moves} mov
              </span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">
              {isDailyChallenge ? 'Reto Diario' : `Nivel ${level}`}
            </h2>
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-md flex items-center gap-1">
              🪙 {currentCoins}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SoundGear />
            <div className={`text-2xl font-bold ${freezeTimeLeft > 0 ? 'text-cyan-500' : timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
              {isPreview ? `Preview: ${Math.max(0, Math.ceil(timeLeft - (timeLimit - PREVIEW_TIME)))}s` : freezeTimeLeft > 0 ? `⏱️ ${timeLeft}s` : `${timeLeft}s`}
            </div>
            {freezeTimeLeft > 0 && !isPreview && (
              <div className="text-xs text-cyan-600 font-semibold mt-1">
                ❄️ Congelado: {freezeTimeLeft}s
              </div>
            )}
            {streakMatches > 0 && !isPreview && cards.some(c => c.obstacle === 'ice') && (
              <div className={`text-sm font-bold transition-all ${streakMatches >= 6 ? 'text-green-500 animate-pulse' : 'text-orange-500'}`}>
                🔥 {streakMatches}/6
              </div>
            )}
          </div>
        </div>
        {isDailyChallenge && (
          <div className="flex gap-4 mb-3 text-sm font-semibold text-gray-700">
            <span>Tiempo: {timeElapsed}s</span>
            <span>Movimientos: {moves}</span>
          </div>
        )}

        <div className="flex gap-2 w-full">
          <button
            onClick={openExitModal}
            className="bg-gray-500 text-white py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1 hover:bg-gray-600 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
          <button
            onClick={handleRestart}
            className="flex-1 bg-orange-500 text-white py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1 hover:bg-orange-600 transition-colors text-sm"
          >
            <RotateCcw size={16} />
            Reiniciar
          </button>
          {isDailyChallenge && (
            <button
              onClick={() => setShowLeaderboard(true)}
              className="flex-1 bg-yellow-500 text-white py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1 hover:bg-yellow-600 transition-colors text-sm"
            >
              <List size={16} />
              Top
            </button>
          )}
        </div>

        {!isDailyChallenge && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600 font-semibold mb-1.5 text-center">
              💡 Ayuda Extra
            </div>
            <PowerUpButtons
              onPowerUpUsed={handlePowerUp}
              onFreezeTime={handleFreezeTime}
              disabled={isPreview || gameOver}
              hasObstacles={cards.some(c => c.obstacle)}
              onModalStateChange={setIsTimerPaused}
              timeRemaining={timeLeft}
            />
            <button
              onClick={() => {
                setShowCoinShop(true);
                setIsTimerPaused(true);
              }}
              className="w-full mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-1.5 px-3 rounded-lg font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              💰 Comprar Monedas
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden px-4">
        <div className="w-full max-w-lg">
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`${crackedCards.has(card.id) ? 'obstacle-crack' : ''} ${breakingCards.has(card.id) ? 'obstacle-break' : ''} ${comboCardId === card.id ? 'combo-power-animation' : ''}`}
              >
                <GameCard
                  card={{ ...card, isFlipped: isPreview || card.isFlipped }}
                  image={selectedImages[card.imageIndex]}
                  onClick={handleCardClick}
                  disabled={isPreview || isCheckingRef.current}
                  showHint={hintCards.includes(card.id)}
                  isBreaking={breakingCards.has(card.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">😢</div>
            <h3 className="text-3xl font-bold text-red-600 mb-2">Game Over</h3>
            <p className="text-gray-600 mb-6">{hazardMessage ?? 'Se acabó el tiempo'}</p>
            <div className="flex gap-3">
              <button
                onClick={onBackToMenu}
                className="flex-1 bg-gray-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Salir
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {showWinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-3xl font-bold text-green-600 mb-4">¡Completado!</h3>

            {isPioneer && (
              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-4 mb-4">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-white font-bold text-lg">¡Medalla Pionero!</div>
                <div className="text-yellow-100 text-sm">+20 monedas por ser el primero</div>
              </div>
            )}

            <div className="bg-gray-100 rounded-xl p-4 mb-4">
              <div className="flex justify-around text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{finalTime}s</div>
                  <div className="text-xs text-gray-600">Tiempo</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{finalMoves}</div>
                  <div className="text-xs text-gray-600">Movimientos</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl p-6 mb-6 relative overflow-hidden">
              <div className="text-4xl mb-2">💰</div>
              <div className="text-2xl font-bold text-amber-700 mb-1">
                +{coinsEarned} Monedas
              </div>
              <div className="text-sm text-amber-600">¡Ganadas en este nivel!</div>

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
            <div className="flex flex-col gap-2">
              {!isDailyChallenge && !isDuel && (
                <button
                  onClick={() => {
                    console.log('[GameCore] ===== CLICK SIGUIENTE NIVEL =====');
                    console.log('[GameCore] Current level:', activeLevel);
                    console.log('[GameCore] Calling onComplete...');
                    setShowWinModal(false);
                    setTimeout(() => {
                      onComplete();
                    }, 100);
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Nivel {activeLevel + 1} 🎯
                </button>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                >
                  <Share2 size={18} />
                  Compartir
                </button>
                <button
                  onClick={handleRestart}
                  className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                >
                  Reintentar
                </button>
              </div>
              <button
                onClick={() => {
                  setShowWinModal(false);
                  onBackToMenu();
                }}
                className="w-full bg-gray-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft size={18} />
                {isDailyChallenge ? 'Salir' : 'Volver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaderboard && (
        <Leaderboard
          seed={seed}
          onClose={() => setShowLeaderboard(false)}
          onPlayNow={() => {
            setShowLeaderboard(false);
            handleRestart();
          }}
        />
      )}

      {showCoinShop && (
        <CoinShop
          onClose={() => {
            setShowCoinShop(false);
            setIsTimerPaused(false);
          }}
        />
      )}

      <ExitConfirmModal
        open={exitModalOpen}
        onStay={closeExitModal}
        onExit={handleExitConfirmed}
      />

      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareText={shareData.text}
        shareUrl={shareData.url}
      />

      {showObstacleTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">¡Nuevos Obstáculos!</h3>
              <p className="text-gray-600">Aprende a superarlos</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">🧊</div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Hielo</h4>
                    <p className="text-sm text-gray-600">Bloquea cartas. Haz un match cercano (arriba, abajo, izquierda o derecha) para romperlo.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-4 rounded-xl border-2 border-gray-300">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">🪨</div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Piedra</h4>
                    <p className="text-sm text-gray-600">Más resistente. Necesita 2 matches cercanos para romperse. Verás un contador rojo.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border-2 border-yellow-200">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">✨</div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Estrategia</h4>
                    <p className="text-sm text-gray-600">Primero libera las cartas bloqueadas haciendo matches alrededor. ¡Verás el hielo agrietarse!</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowObstacleTutorial(false);
                setIsTimerPaused(false);
                localStorage.setItem('obstacle_tutorial_seen', 'true');
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      <ShatterEffect trigger={shatterTrigger} theme={shatterTheme} />
    </div>
  );
};
