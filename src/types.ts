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

export interface AvatarConfig {
  // Sistema Boring Avatars (nuevo y preferido)
  style?: string; // 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus'
  seed?: string; // Para generar avatar único
  colors?: string[]; // Paleta de colores personalizada

  // Opciones DiceBear (legacy - mantener para retrocompatibilidad)
  skinColor?: string[];
  hairStyle?: string[];
  hairColor?: string[];
  facialHairType?: string[];
  facialHairColor?: string[];
  eyesStyle?: string[];
  mouthStyle?: string[];
  accessoriesType?: string[];
  accessoriesColor?: string[];
  clothingColor?: string[];

  // Animales (mantiene compatibilidad)
  animalId?: string | null;

  // Legacy (sistema antiguo - mantener para retrocompatibilidad)
  faceColor?: string;
  eyeColor?: string;
  eyesId?: number;
  mouthId?: number;
  hairId?: number;
  beardId?: number | null;
  mustacheId?: number | null;
  glassesId?: number | null;
  headphonesId?: number | null;
  accessoryId?: number | null;
  faceShapeId?: number;
  glassesColor?: string;
}

export interface PlayerProfile {
  clientId: string;
  displayName: string | null;
  avatarConfig: AvatarConfig | null;
  coins: number;
  totalScore?: number;
  levelsCompleted?: number;
  stars?: number;
}

export interface LeaderboardEntry {
  clientId: string;
  displayName: string;
  avatarConfig: AvatarConfig;
  score: number;
  levelsCompleted: number;
  rank: number;
  isCurrentPlayer: boolean;
}
