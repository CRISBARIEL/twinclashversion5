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

export const handleVirusMismatch = (
  cardId: number,
  cards: Card[],
  setCards: React.Dispatch<React.SetStateAction<Card[]>>,
  virusTimers: Map<number, VirusTimerData>,
  setVirusTimers: React.Dispatch<React.SetStateAction<Map<number, VirusTimerData>>>
) => {
  const adjacentIndices = getAdjacentIndices(cardId, cards);

  adjacentIndices.forEach(idx => {
    const card = cards[idx];
    if (!card || card.isMatched || virusTimers.has(card.id)) return;

    const intervalId = window.setInterval(() => {
      const timerData = virusTimers.get(card.id);
      if (!timerData) return;

      const newTimeLeft = timerData.timeLeft - 1;

      if (newTimeLeft <= 0) {
        clearInterval(intervalId);
        virusTimers.delete(card.id);
        setVirusTimers(new Map(virusTimers));

        setCards(prev => prev.map(c =>
          c.id === card.id ? { ...c, isWildcard: true, isInfected: false } : c
        ));

        const newAdjacents = getAdjacentIndices(card.id, cards);
        newAdjacents.forEach(adjIdx => {
          const adjCard = cards[adjIdx];
          if (adjCard && !adjCard.isMatched && !virusTimers.has(adjCard.id)) {
            handleVirusMismatch(adjCard.id, cards, setCards, virusTimers, setVirusTimers);
          }
        });
      } else {
        timerData.timeLeft = newTimeLeft;
        setVirusTimers(new Map(virusTimers));
      }
    }, 1000);

    virusTimers.set(card.id, { cardId: card.id, timeLeft: 8, intervalId });
    setCards(prev => prev.map(c =>
      c.id === card.id ? { ...c, isInfected: true } : c
    ));
  });

  setVirusTimers(new Map(virusTimers));
};

export const handleVirusMatch = (
  cardIds: number[],
  cards: Card[],
  virusTimers: Map<number, VirusTimerData>,
  setVirusTimers: React.Dispatch<React.SetStateAction<Map<number, VirusTimerData>>>,
  setCards: React.Dispatch<React.SetStateAction<Card[]>>
) => {
  cardIds.forEach(cardId => {
    const adjacentIndices = getAdjacentIndices(cardId, cards);
    const affectedIndices = [cards.findIndex(c => c.id === cardId), ...adjacentIndices];

    affectedIndices.forEach(idx => {
      if (idx === -1) return;
      const card = cards[idx];
      if (!card) return;

      const timerData = virusTimers.get(card.id);
      if (timerData?.intervalId) {
        clearInterval(timerData.intervalId);
      }
      virusTimers.delete(card.id);

      setCards(prev => prev.map(c =>
        c.id === card.id ? { ...c, isInfected: false, isWildcard: false } : c
      ));
    });
  });

  setVirusTimers(new Map(virusTimers));
};
