export interface Card {
  id: number;
  imageIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
  obstacle?: 'ice' | 'stone' | 'iron' | 'fire' | 'bomb' | 'virus' | null;
  obstacleHealth?: number;
  fireTimer?: number;
  bombCountdown?: number;
  virusTimer?: number;
  isInfected?: boolean;
  isWildcard?: boolean;
  blockedHealth?: number;
}

export interface GameState {
  level: number;
  cards: Card[];
  flippedCards: number[];
  matchedPairs: number;
  isPreview: boolean;
  isPlaying: boolean;
  timeLeft: number;
  gameOver: boolean;
  levelComplete: boolean;
  gameComplete: boolean;
}

export interface GameMetrics {
  moves: number;
  timeElapsed: number;
  seed: string;
}

export interface BestScore {
  time: number;
  moves: number;
  date: string;
}

export const PREVIEW_TIME = 10;
export const FLIP_DELAY = 400;
