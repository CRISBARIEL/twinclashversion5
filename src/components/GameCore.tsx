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
import { Card, PREVIEW_TIME, FLIP_DELAY, GameMetrics, BestScore } from '../types';
import { createConfetti } from '../utils/confetti';
import { getSeedFromURLorToday, shuffleWithSeed } from '../lib/seed';
import { submitScoreAndReward, getCrewIdFromURL, setCrewIdInURL } from '../lib/api';
import { addCoins, getLocalCoins } from '../lib/progression';
import { getLevelConfig } from '../lib/levels';
import { getThemeImages } from '../lib/themes';
import { soundManager } from '../lib/sound';
import { useBackExitGuard } from '../hooks/useBackExitGuard';

interface GameCoreProps {
  level: number;
  onComplete: () => void;
  onBackToMenu: () => void;
  isDailyChallenge?: boolean;
  // removed custom photo feature
}

export const GameCore = ({ level, onComplete, onBackToMenu, isDailyChallenge = false }: GameCoreProps) => {
  const levelConfig = getLevelConfig(level);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isPreview, setIsPreview] = useState(true);
  const [timeLeft, setTimeLeft] = useState(levelConfig?.timeLimit || 60);
  const [gameOver, setGameOver] = useState(false);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showWinModal, setShowWinModal] = useState(false);
  const [bestScore, setBestScore] = useState<BestScore | null>(null);
  const [seed] = useState(() => isDailyChallenge ? getSeedFromURLorToday() : `random-${Date.now()}`);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isPioneer, setIsPioneer] = useState(false);
  const [crewId, setCrewId] = useState(() => getCrewIdFromURL());
  const [finalTime, setFinalTime] = useState(0);
  const [finalMoves, setFinalMoves] = useState(0);
  const [hintCards, setHintCards] = useState<number[]>([]);
  const [consecutiveMisses, setConsecutiveMisses] = useState(0);
  const [powerUpUsed, setPowerUpUsed] = useState(false);
  const [showCoinShop, setShowCoinShop] = useState(false);
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

  const initializeLevel = useCallback(() => {
    console.log('[GameCore] initializeLevel', { level, seed });

    const config = getLevelConfig(level);
    const pairs = config?.pairs || 6;
    const timeLimit = config?.timeLimit || 60;
    const theme = config?.theme || 'nature';

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

      const totalObstacles = (obstacles.ice || 0) + (obstacles.stone || 0);
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

      const canPlaceObstacle = (idx: number, occupiedIndices: Set<number>, isStone: boolean) => {
        const pairCard = shuffled.find(c => c.id !== shuffled[idx].id && c.imageIndex === shuffled[idx].imageIndex);
        if (!pairCard) return false;

        const pairIdx = shuffled.findIndex(c => c.id === pairCard.id);

        const tempOccupied = new Set(occupiedIndices);
        tempOccupied.add(idx);

        if (!hasAccess(pairIdx, tempOccupied)) {
          return false;
        }

        if (isStone) {
          const adjacentIndices = getAdjacentIndices(idx);
          const hasStoneNeighbor = adjacentIndices.some(adjIdx => {
            const card = shuffled[adjIdx];
            return card.obstacle === 'stone';
          });
          if (hasStoneNeighbor) return false;
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
    }
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setIsPreview(true);
    setGameOver(false);
    setTimeLeft(timeLimit);
    setMoves(0);
    setTimeElapsed(0);
    setShowWinModal(false);
    setHintCards([]);
    setConsecutiveMisses(0);
    setPowerUpUsed(false);
    setCrackedCards(new Set());
    setBreakingCards(new Set());
    gameStartTimeRef.current = 0;

    if (config?.obstacles && (config.obstacles.ice || config.obstacles.stone)) {
      const hasSeenTutorial = localStorage.getItem('obstacle_tutorial_seen');
      if (!hasSeenTutorial) {
        setTimeout(() => setShowObstacleTutorial(true), 1000);
      }
    }

    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = window.setTimeout(() => {
      setIsPreview(false);
    }, PREVIEW_TIME * 1000);
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
    };
  }, [level, initializeLevel]);

  useEffect(() => {
    if (isPreview || gameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      return;
    }

    if (gameStartTimeRef.current === 0) {
      gameStartTimeRef.current = Date.now();
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
          soundManager.playLose();
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    elapsedTimerRef.current = window.setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - gameStartTimeRef.current) / 1000));
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [isPreview, gameOver]);

  useEffect(() => {
    const totalPairs = levelConfig?.pairs || 6;
    if (matchedPairs === totalPairs && matchedPairs > 0) {
      console.log('[GameCore] LEVEL COMPLETED', { level, matchedPairs, moves, timeElapsed });
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      createConfetti();
      soundManager.playWin();

      if (isDailyChallenge) {
        const finalTimeValue = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
        setTimeElapsed(finalTimeValue);
        setFinalTime(finalTimeValue);
        setFinalMoves(moves);

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

        submitScoreAndReward({ seed, timeMs: finalTimeValue * 1000, moves, crewId, levelId: level }).then((result) => {
          if (result.isPioneer) {
            setIsPioneer(true);
          }
        }).catch((err) => {
          console.error('[GameCore] Failed to submit score:', err);
        });

        const baseCoins = 10;
        setCoinsEarned(baseCoins);
        addCoins(baseCoins);
        setCurrentCoins(getLocalCoins());

        setShowWinModal(true);
        setTimeout(() => setShowCoinAnimation(true), 500);
      } else {
        const baseCoins = 10;
        setCoinsEarned(baseCoins);
        addCoins(baseCoins);
        onComplete();
      }
    }
  }, [matchedPairs, level, onComplete, isDailyChallenge, moves, seed, timeElapsed]);

  const handleCardClick = useCallback((id: number) => {
    if (isPreview || isCheckingRef.current || flippedCards.length >= 2) return;

    const card = cards.find((c) => c.id === id);
    if (!card || card.isMatched || flippedCards.includes(id)) return;

    if (card.obstacle && (card.obstacleHealth ?? 0) > 0) {
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

      if (firstCard && secondCard && firstCard.imageIndex === secondCard.imageIndex) {
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
                  addCoins(20); // 20 coins for stone
                  setCurrentCoins(getLocalCoins());
                  console.log('[GameCore] Stone destroyed! +20 coins');
                  setShatterTheme('stone');
                  setShatterTrigger(true);
                  setTimeout(() => setShatterTrigger(false), 100);
                }
                return { ...c, obstacle: null, obstacleHealth: 0 };
              }
              return { ...c, obstacleHealth: newHealth };
            }

            return c;
          })
        );
        setMatchedPairs((prev) => prev + 1);
        setFlippedCards([]);
        setConsecutiveMisses(0);
        setHintCards([]);
        isCheckingRef.current = false;
      } else {
        setConsecutiveMisses((prev) => prev + 1);
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
      // SMART LOGIC: Prioritize revealing cards WITH obstacles
      const pairsWithObstacles: Array<[number, number[]]> = [];
      const pairsWithoutObstacles: Array<[number, number[]]> = [];

      availablePairs.forEach(([imageIndex, ids]) => {
        const hasObstacle = ids.some(id => {
          const card = cards.find(c => c.id === id);
          return card && card.obstacle && (card.obstacleHealth ?? 0) > 0;
        });

        if (hasObstacle) {
          pairsWithObstacles.push([imageIndex, ids]);
        } else {
          pairsWithoutObstacles.push([imageIndex, ids]);
        }
      });

      // Prioritize pairs with obstacles, then clean pairs
      const sortedPairs = [...pairsWithObstacles, ...pairsWithoutObstacles];
      const pairsToMatch = sortedPairs.slice(0, pairsToReveal);

      const cardIdsToMatch: number[] = [];
      pairsToMatch.forEach(([, ids]) => {
        cardIdsToMatch.push(...ids);
      });

      setCards(prev => prev.map(c => {
        if (cardIdsToMatch.includes(c.id)) {
          // If card has stone (2 health), reduce to 1 instead of fully revealing
          if (c.obstacle === 'stone' && (c.obstacleHealth ?? 0) === 2) {
            return { ...c, obstacleHealth: 1 };
          }
          // If card has ice (1 health), remove obstacle and reveal
          else if (c.obstacle === 'ice' && (c.obstacleHealth ?? 0) === 1) {
            return { ...c, isFlipped: true, isMatched: true, obstacle: null, obstacleHealth: 0 };
          }
          // If card has stone with 1 health left, remove obstacle and reveal
          else if (c.obstacle === 'stone' && (c.obstacleHealth ?? 0) === 1) {
            return { ...c, isFlipped: true, isMatched: true, obstacle: null, obstacleHealth: 0 };
          }
          // Clean cards (no obstacle) - reveal normally
          else {
            return { ...c, isFlipped: true, isMatched: true };
          }
        }
        return c;
      }));

      // Only count fully matched pairs
      const fullyMatchedPairs = pairsToMatch.filter(([, ids]) => {
        return ids.every(id => {
          const card = cards.find(c => c.id === id);
          return !card?.obstacle || (card.obstacleHealth ?? 0) <= 1;
        });
      }).length;

      setMatchedPairs(prev => prev + fullyMatchedPairs);
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

    setPowerUpUsed(true);
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

  const getGridColumns = () => {
    if (pairs <= 10) return 4;
    if (pairs <= 12) return 4;
    if (pairs <= 15) return 5;
    return 6;
  };

  const gridCols = getGridColumns();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex flex-col p-4">
      <div className="bg-white rounded-2xl shadow-xl p-4 mb-4">
        {isDailyChallenge && (
          <div className="mb-3 text-sm text-gray-600 flex flex-col gap-1">
            <span>Reto: {seed}</span>
            {bestScore && (
              <span className="flex items-center gap-1">
                <Trophy size={14} className="text-yellow-500" />
                Mejor: {bestScore.time}s, {bestScore.moves} mov
              </span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between mb-3">
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
            <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
              {isPreview ? `Preview: ${Math.max(0, Math.ceil(timeLeft - (timeLimit - PREVIEW_TIME)))}s` : `${timeLeft}s`}
            </div>
          </div>
        </div>
        {isDailyChallenge && (
          <div className="flex gap-4 mb-3 text-sm font-semibold text-gray-700">
            <span>Tiempo: {timeElapsed}s</span>
            <span>Movimientos: {moves}</span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={openExitModal}
            className="bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft size={18} />
            Volver
          </button>
          <button
            onClick={handleRestart}
            className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
          >
            <RotateCcw size={18} />
            Reiniciar
          </button>
          {isDailyChallenge && (
            <button
              onClick={() => setShowLeaderboard(true)}
              className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-yellow-600 transition-colors"
            >
              <List size={18} />
              Top
            </button>
          )}
        </div>

        {!isDailyChallenge && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-600 font-semibold mb-2 text-center">
              💡 Ayuda Extra (Revela Parejas)
            </div>
            <PowerUpButtons
              onPowerUpUsed={handlePowerUp}
              disabled={isPreview || gameOver || powerUpUsed}
            />
            {powerUpUsed && (
              <div className="text-xs text-center text-green-600 font-semibold mt-2">
                ✅ Ayuda usada en este nivel
              </div>
            )}
            <button
              onClick={() => setShowCoinShop(true)}
              className="w-full mt-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-2 px-4 rounded-lg font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
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
                className={`${crackedCards.has(card.id) ? 'obstacle-crack' : ''} ${breakingCards.has(card.id) ? 'obstacle-break' : ''}`}
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
            <p className="text-gray-600 mb-6">Se acabó el tiempo</p>
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
                Salir
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
          onClose={() => setShowCoinShop(false)}
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
