import { Card } from '../types';

export interface FireTimerData {
  cardId: number;
  timeLeft: number;
  intervalId?: number;
}

export interface VirusTimerData {
  cardId: number;
  timeLeft: number;
  intervalId?: number;
}

export interface GlobalVirusTimerData {
  timeLeft: number;
  intervalId?: number;
  isActive: boolean;
}

export const getAdjacentIndices = (cardId: number, cards: Card[]): number[] => {
  const idx = cards.findIndex(c => c.id === cardId);
  if (idx === -1) return [];

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

export const handleFireMismatch = (
  cardId: number,
  cards: Card[],
  setCards: React.Dispatch<React.SetStateAction<Card[]>>,
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>,
  fireTimers: Map<number, FireTimerData>,
  setFireTimers: React.Dispatch<React.SetStateAction<Map<number, FireTimerData>>>
) => {
  const adjacentIndices = getAdjacentIndices(cardId, cards);
  const affectedIndices = [cards.findIndex(c => c.id === cardId), ...adjacentIndices];

  affectedIndices.forEach(idx => {
    if (idx === -1) return;
    const card = cards[idx];
    if (!card || card.isMatched) return;

    if (fireTimers.has(card.id)) return;

    const intervalId = window.setInterval(() => {
      const timerData = fireTimers.get(card.id);
      if (!timerData) return;

      const newTimeLeft = timerData.timeLeft - 1;

      if (newTimeLeft <= 0) {
        clearInterval(intervalId);
        fireTimers.delete(card.id);
        setFireTimers(new Map(fireTimers));

        const shouldPenalizeTime = Math.random() > 0.5;
        if (shouldPenalizeTime) {
          setTimeLeft(prev => Math.max(0, prev - 10));
        } else {
          const adjacents = getAdjacentIndices(card.id, cards);
          const validAdjacents = adjacents.filter(i => {
            const c = cards[i];
            return c && !c.isMatched && !c.isFlipped;
          });

          const toFlip = validAdjacents.slice(0, 2);
          setCards(prev => prev.map(c =>
            toFlip.some(i => cards[i]?.id === c.id)
              ? { ...c, isFlipped: true }
              : c
          ));

          setTimeout(() => {
            setCards(prev => prev.map(c =>
              toFlip.some(i => cards[i]?.id === c.id)
                ? { ...c, isFlipped: false }
                : c
            ));
          }, 1000);
        }

        const newAdjacents = getAdjacentIndices(card.id, cards);
        newAdjacents.forEach(adjIdx => {
          const adjCard = cards[adjIdx];
          if (adjCard && !adjCard.isMatched && !fireTimers.has(adjCard.id)) {
            handleFireMismatch(adjCard.id, cards, setCards, setTimeLeft, fireTimers, setFireTimers);
          }
        });
      } else {
        timerData.timeLeft = newTimeLeft;
        setFireTimers(new Map(fireTimers));
      }
    }, 1000);

    fireTimers.set(card.id, { cardId: card.id, timeLeft: 5, intervalId });
  });

  setFireTimers(new Map(fireTimers));
};

export const handleFireMatch = (
  cardIds: number[],
  cards: Card[],
  fireTimers: Map<number, FireTimerData>,
  setFireTimers: React.Dispatch<React.SetStateAction<Map<number, FireTimerData>>>
) => {
  cardIds.forEach(cardId => {
    const adjacentIndices = getAdjacentIndices(cardId, cards);
    const affectedIndices = [cards.findIndex(c => c.id === cardId), ...adjacentIndices];

    affectedIndices.forEach(idx => {
      if (idx === -1) return;
      const card = cards[idx];
      if (!card) return;

      const timerData = fireTimers.get(card.id);
      if (timerData?.intervalId) {
        clearInterval(timerData.intervalId);
      }
      fireTimers.delete(card.id);
    });
  });

  setFireTimers(new Map(fireTimers));
};

export const handleBombMismatch = (
  cards: Card[],
  setCards: React.Dispatch<React.SetStateAction<Card[]>>,
  setFlippedCards: React.Dispatch<React.SetStateAction<number[]>>
) => {
  const unmatched = cards.filter(c => !c.isMatched);
  const halfCount = Math.ceil(unmatched.length / 2);
  const toShuffle = [...unmatched].sort(() => Math.random() - 0.5).slice(0, halfCount);

  const shuffledPairs = toShuffle.map(c => ({
    ...c,
    isFlipped: false
  }));

  const toFreeze = [...unmatched]
    .filter(c => !toShuffle.find(s => s.id === c.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  setCards(prev => prev.map(c => {
    const shuffled = shuffledPairs.find(s => s.id === c.id);
    if (shuffled) return { ...shuffled, bombCountdown: undefined };

    const frozen = toFreeze.find(f => f.id === c.id);
    if (frozen) return { ...c, bombCountdown: 3 };

    return c;
  }));

  setFlippedCards([]);

  const freezeInterval = setInterval(() => {
    setCards(prev => prev.map(c => {
      if (c.bombCountdown !== undefined && c.bombCountdown > 0) {
        const newCountdown = c.bombCountdown - 1;
        return { ...c, bombCountdown: newCountdown > 0 ? newCountdown : undefined };
      }
      return c;
    }));
  }, 1000);

  setTimeout(() => clearInterval(freezeInterval), 3000);
};

// Nueva implementación de virus progresivo con timer global
// Se activa en mundo 40+, niveles very_hard y expert
export const startGlobalVirusTimer = (
  cards: Card[],
  setCards: React.Dispatch<React.SetStateAction<Card[]>>,
  globalVirusTimer: GlobalVirusTimerData | null,
  setGlobalVirusTimer: React.Dispatch<React.SetStateAction<GlobalVirusTimerData | null>>
) => {
  // Verificar si hay cartas con virus
  const hasVirus = cards.some(c => c.obstacle === 'virus' && !c.isMatched);

  if (!hasVirus) {
    // No hay virus, limpiar timer si existe
    if (globalVirusTimer?.intervalId) {
      clearInterval(globalVirusTimer.intervalId);
    }
    setGlobalVirusTimer(null);
    return;
  }

  // Si ya hay un timer activo, no crear uno nuevo
  if (globalVirusTimer?.isActive) {
    return;
  }

  // Crear nuevo timer global
  const intervalId = window.setInterval(() => {
    setGlobalVirusTimer(prev => {
      if (!prev) return null;

      const newTimeLeft = prev.timeLeft - 1;

      if (newTimeLeft <= 0) {
        // Timer llegó a 0, contagiar cartas adyacentes
        setCards(currentCards => spreadVirus(currentCards));

        // Reiniciar timer a 20 segundos
        return { ...prev, timeLeft: 20 };
      }

      return { ...prev, timeLeft: newTimeLeft };
    });
  }, 1000);

  setGlobalVirusTimer({ timeLeft: 20, intervalId, isActive: true });
};

// Función para propagar el virus a cartas adyacentes
const spreadVirus = (cards: Card[]): Card[] => {
  const gridSize = Math.ceil(Math.sqrt(cards.length));

  // Encontrar todas las cartas con virus que no están emparejadas
  const virusCards = cards
    .map((c, idx) => ({ card: c, idx }))
    .filter(({ card }) => card.obstacle === 'virus' && !card.isMatched);

  if (virusCards.length === 0) return cards;

  // Para cada virus, encontrar una carta adyacente para infectar
  const toInfect: number[] = [];

  virusCards.forEach(({ card, idx }) => {
    const adjacentIndices = getAdjacentIndices(card.id, cards);

    // Filtrar cartas adyacentes válidas para infección
    const validTargets = adjacentIndices.filter(adjIdx => {
      const adjCard = cards[adjIdx];
      return (
        adjCard &&
        !adjCard.isMatched &&
        adjCard.obstacle !== 'virus' &&
        adjCard.obstacle !== 'fire' &&
        adjCard.obstacle !== 'bomb' &&
        !toInfect.includes(adjIdx)
      );
    });

    // Infectar una carta aleatoria de las válidas
    if (validTargets.length > 0) {
      const randomTarget = validTargets[Math.floor(Math.random() * validTargets.length)];
      toInfect.push(randomTarget);
    }
  });

  // Aplicar las infecciones
  return cards.map((card, idx) => {
    if (toInfect.includes(idx)) {
      return {
        ...card,
        obstacle: 'virus',
        blockedHealth: 1,
        obstacleHealth: 0
      };
    }
    return card;
  });
};

// Eliminar virus cuando se hace match adyacente
export const handleVirusMatch = (
  cardIds: number[],
  cards: Card[],
  setCards: React.Dispatch<React.SetStateAction<Card[]>>,
  globalVirusTimer: GlobalVirusTimerData | null,
  setGlobalVirusTimer: React.Dispatch<React.SetStateAction<GlobalVirusTimerData | null>>
) => {
  // Para cada carta emparejada, eliminar virus en cartas adyacentes
  cardIds.forEach(cardId => {
    const adjacentIndices = getAdjacentIndices(cardId, cards);

    adjacentIndices.forEach(idx => {
      if (idx === -1) return;
      const card = cards[idx];
      if (!card || card.isMatched) return;

      // Si la carta adyacente tiene virus, reducir su blockedHealth
      if (card.obstacle === 'virus' && (card.blockedHealth ?? 0) > 0) {
        setCards(prev => prev.map((c, i) => {
          if (i !== idx) return c;

          const newBlockedHealth = (c.blockedHealth ?? 0) - 1;

          if (newBlockedHealth <= 0) {
            // Virus eliminado
            return { ...c, obstacle: null, blockedHealth: 0 };
          }

          return { ...c, blockedHealth: newBlockedHealth };
        }));
      }
    });
  });

  // Verificar si todavía quedan virus
  setTimeout(() => {
    setCards(currentCards => {
      const stillHasVirus = currentCards.some(c => c.obstacle === 'virus' && !c.isMatched);

      if (!stillHasVirus && globalVirusTimer?.intervalId) {
        // No quedan virus, detener timer
        clearInterval(globalVirusTimer.intervalId);
        setGlobalVirusTimer(null);
      }

      return currentCards;
    });
  }, 100);
};

// Funciones antiguas mantenidas por compatibilidad (pero no se usan)
export const handleVirusMismatch = (
  cardId: number,
  cards: Card[],
  setCards: React.Dispatch<React.SetStateAction<Card[]>>,
  virusTimers: Map<number, VirusTimerData>,
  setVirusTimers: React.Dispatch<React.SetStateAction<Map<number, VirusTimerData>>>
) => {
  // Esta función ya no se usa, mantenida por compatibilidad
  console.warn('[advancedObstacles] handleVirusMismatch is deprecated, use startGlobalVirusTimer instead');
};
