export interface LevelConfig {
  world: number;
  level: number;
  pairs: number;
  timeLimit: number;
  theme: string;
  unlockReward: number;
  obstacles?: { ice?: number; stone?: number; iron?: number };
}

export const LEVELS: Record<number, LevelConfig> = {
  1: { world: 1, level: 1, pairs: 6, timeLimit: 60, theme: 'nature', unlockReward: 10 },
  2: { world: 1, level: 2, pairs: 7, timeLimit: 55, theme: 'nature', unlockReward: 12 },
  3: { world: 1, level: 3, pairs: 8, timeLimit: 52, theme: 'nature', unlockReward: 15 },
  4: { world: 1, level: 4, pairs: 9, timeLimit: 48, theme: 'nature', unlockReward: 18 },
  5: { world: 1, level: 5, pairs: 10, timeLimit: 45, theme: 'nature', unlockReward: 100 },

  6: { world: 2, level: 1, pairs: 8, timeLimit: 55, theme: 'sports', unlockReward: 15 },
  7: { world: 2, level: 2, pairs: 9, timeLimit: 52, theme: 'sports', unlockReward: 18 },
  8: { world: 2, level: 3, pairs: 10, timeLimit: 48, theme: 'sports', unlockReward: 20 },
  9: { world: 2, level: 4, pairs: 10, timeLimit: 44, theme: 'sports', unlockReward: 25 },
  10: { world: 2, level: 5, pairs: 10, timeLimit: 40, theme: 'sports', unlockReward: 120 },

  11: { world: 3, level: 1, pairs: 10, timeLimit: 50, theme: 'arcade', unlockReward: 20 },
  12: { world: 3, level: 2, pairs: 10, timeLimit: 47, theme: 'arcade', unlockReward: 22 },
  13: { world: 3, level: 3, pairs: 10, timeLimit: 44, theme: 'arcade', unlockReward: 25 },
  14: { world: 3, level: 4, pairs: 10, timeLimit: 40, theme: 'arcade', unlockReward: 30 },
  15: { world: 3, level: 5, pairs: 10, timeLimit: 35, theme: 'arcade', unlockReward: 150 },

  16: { world: 4, level: 1, pairs: 10, timeLimit: 45, theme: 'animals', unlockReward: 30, obstacles: { ice: 3 } },
  17: { world: 4, level: 2, pairs: 10, timeLimit: 42, theme: 'animals', unlockReward: 35, obstacles: { ice: 4 } },
  18: { world: 4, level: 3, pairs: 10, timeLimit: 38, theme: 'animals', unlockReward: 40, obstacles: { ice: 4, stone: 2 } },
  19: { world: 4, level: 4, pairs: 10, timeLimit: 34, theme: 'animals', unlockReward: 45, obstacles: { ice: 5, stone: 2 } },
  20: { world: 4, level: 5, pairs: 10, timeLimit: 30, theme: 'animals', unlockReward: 200, obstacles: { ice: 5, stone: 3 } },

  21: { world: 5, level: 1, pairs: 10, timeLimit: 40, theme: 'space', unlockReward: 50, obstacles: { ice: 4, stone: 2 } },
  22: { world: 5, level: 2, pairs: 10, timeLimit: 36, theme: 'space', unlockReward: 60, obstacles: { ice: 5, stone: 2 } },
  23: { world: 5, level: 3, pairs: 10, timeLimit: 32, theme: 'space', unlockReward: 70, obstacles: { ice: 6, stone: 3 } },
  24: { world: 5, level: 4, pairs: 10, timeLimit: 28, theme: 'space', unlockReward: 80, obstacles: { ice: 6, stone: 4 } },
  25: { world: 5, level: 5, pairs: 10, timeLimit: 25, theme: 'space', unlockReward: 500, obstacles: { ice: 7, stone: 4 } },

  26: { world: 6, level: 1, pairs: 10, timeLimit: 50, theme: 'ocean', unlockReward: 70, obstacles: { ice: 5, stone: 3 } },
  27: { world: 6, level: 2, pairs: 10, timeLimit: 46, theme: 'ocean', unlockReward: 80, obstacles: { ice: 6, stone: 3 } },
  28: { world: 6, level: 3, pairs: 10, timeLimit: 42, theme: 'ocean', unlockReward: 90, obstacles: { ice: 7, stone: 4 } },
  29: { world: 6, level: 4, pairs: 10, timeLimit: 38, theme: 'ocean', unlockReward: 100, obstacles: { ice: 7, stone: 5 } },
  30: { world: 6, level: 5, pairs: 10, timeLimit: 35, theme: 'ocean', unlockReward: 600, obstacles: { ice: 8, stone: 5 } },

  31: { world: 7, level: 1, pairs: 10, timeLimit: 48, theme: 'food', unlockReward: 90, obstacles: { ice: 6, stone: 4 } },
  32: { world: 7, level: 2, pairs: 10, timeLimit: 45, theme: 'food', unlockReward: 100, obstacles: { ice: 7, stone: 4 } },
  33: { world: 7, level: 3, pairs: 10, timeLimit: 42, theme: 'food', unlockReward: 110, obstacles: { ice: 7, stone: 5 } },
  34: { world: 7, level: 4, pairs: 10, timeLimit: 38, theme: 'food', unlockReward: 120, obstacles: { ice: 8, stone: 5 } },
  35: { world: 7, level: 5, pairs: 10, timeLimit: 35, theme: 'food', unlockReward: 700, obstacles: { ice: 8, stone: 6 } },

  36: { world: 8, level: 1, pairs: 10, timeLimit: 45, theme: 'music', unlockReward: 110, obstacles: { ice: 7, stone: 5 } },
  37: { world: 8, level: 2, pairs: 10, timeLimit: 42, theme: 'music', unlockReward: 120, obstacles: { ice: 8, stone: 5 } },
  38: { world: 8, level: 3, pairs: 10, timeLimit: 38, theme: 'music', unlockReward: 130, obstacles: { ice: 8, stone: 6 } },
  39: { world: 8, level: 4, pairs: 10, timeLimit: 35, theme: 'music', unlockReward: 140, obstacles: { ice: 9, stone: 6 } },
  40: { world: 8, level: 5, pairs: 10, timeLimit: 32, theme: 'music', unlockReward: 800, obstacles: { ice: 9, stone: 7 } },

  41: { world: 9, level: 1, pairs: 10, timeLimit: 42, theme: 'beauty', unlockReward: 130, obstacles: { ice: 8, stone: 6 } },
  42: { world: 9, level: 2, pairs: 10, timeLimit: 38, theme: 'beauty', unlockReward: 140, obstacles: { ice: 8, stone: 7 } },
  43: { world: 9, level: 3, pairs: 10, timeLimit: 35, theme: 'beauty', unlockReward: 150, obstacles: { ice: 9, stone: 7 } },
  44: { world: 9, level: 4, pairs: 10, timeLimit: 32, theme: 'beauty', unlockReward: 160, obstacles: { ice: 9, stone: 8 } },
  45: { world: 9, level: 5, pairs: 10, timeLimit: 30, theme: 'beauty', unlockReward: 900, obstacles: { ice: 10, stone: 8 } },

  46: { world: 10, level: 1, pairs: 10, timeLimit: 40, theme: 'tech', unlockReward: 150, obstacles: { ice: 8, stone: 7 } },
  47: { world: 10, level: 2, pairs: 10, timeLimit: 36, theme: 'tech', unlockReward: 160, obstacles: { ice: 9, stone: 7 } },
  48: { world: 10, level: 3, pairs: 10, timeLimit: 33, theme: 'tech', unlockReward: 170, obstacles: { ice: 9, stone: 8 } },
  49: { world: 10, level: 4, pairs: 10, timeLimit: 30, theme: 'tech', unlockReward: 180, obstacles: { ice: 10, stone: 8 } },
  50: { world: 10, level: 5, pairs: 10, timeLimit: 28, theme: 'tech', unlockReward: 1000, obstacles: { ice: 10, stone: 8 } },

  51: { world: 11, level: 1, pairs: 10, timeLimit: 38, theme: 'city', unlockReward: 170, obstacles: { ice: 9 } },
  52: { world: 11, level: 2, pairs: 10, timeLimit: 35, theme: 'city', unlockReward: 180, obstacles: { ice: 10 } },
  53: { world: 11, level: 3, pairs: 10, timeLimit: 32, theme: 'city', unlockReward: 190, obstacles: { ice: 10 } },
  54: { world: 11, level: 4, pairs: 10, timeLimit: 30, theme: 'city', unlockReward: 200, obstacles: { ice: 11 } },
  55: { world: 11, level: 5, pairs: 10, timeLimit: 28, theme: 'city', unlockReward: 1100, obstacles: { ice: 11 } },

  56: { world: 12, level: 1, pairs: 10, timeLimit: 36, theme: 'science', unlockReward: 190, obstacles: { ice: 10 } },
  57: { world: 12, level: 2, pairs: 10, timeLimit: 33, theme: 'science', unlockReward: 200, obstacles: { ice: 11 } },
  58: { world: 12, level: 3, pairs: 10, timeLimit: 30, theme: 'science', unlockReward: 210, obstacles: { ice: 11 } },
  59: { world: 12, level: 4, pairs: 10, timeLimit: 28, theme: 'science', unlockReward: 220, obstacles: { ice: 12 } },
  60: { world: 12, level: 5, pairs: 10, timeLimit: 26, theme: 'science', unlockReward: 1200, obstacles: { ice: 12 } },

  61: { world: 13, level: 1, pairs: 10, timeLimit: 38, theme: 'farm', unlockReward: 210, obstacles: { ice: 11 } },
  62: { world: 13, level: 2, pairs: 10, timeLimit: 35, theme: 'farm', unlockReward: 220, obstacles: { ice: 12 } },
  63: { world: 13, level: 3, pairs: 10, timeLimit: 32, theme: 'farm', unlockReward: 230, obstacles: { ice: 12 } },
  64: { world: 13, level: 4, pairs: 10, timeLimit: 30, theme: 'farm', unlockReward: 240, obstacles: { ice: 13 } },
  65: { world: 13, level: 5, pairs: 10, timeLimit: 28, theme: 'farm', unlockReward: 1300, obstacles: { ice: 13 } },

  66: { world: 14, level: 1, pairs: 10, timeLimit: 36, theme: 'art', unlockReward: 230, obstacles: { ice: 12 } },
  67: { world: 14, level: 2, pairs: 10, timeLimit: 33, theme: 'art', unlockReward: 240, obstacles: { ice: 13 } },
  68: { world: 14, level: 3, pairs: 10, timeLimit: 30, theme: 'art', unlockReward: 250, obstacles: { ice: 13 } },
  69: { world: 14, level: 4, pairs: 10, timeLimit: 28, theme: 'art', unlockReward: 260, obstacles: { ice: 14 } },
  70: { world: 14, level: 5, pairs: 10, timeLimit: 26, theme: 'art', unlockReward: 1400, obstacles: { ice: 14 } },

  71: { world: 15, level: 1, pairs: 10, timeLimit: 35, theme: 'transport', unlockReward: 250, obstacles: { ice: 13 } },
  72: { world: 15, level: 2, pairs: 10, timeLimit: 32, theme: 'transport', unlockReward: 260, obstacles: { ice: 14 } },
  73: { world: 15, level: 3, pairs: 10, timeLimit: 30, theme: 'transport', unlockReward: 270, obstacles: { ice: 14 } },
  74: { world: 15, level: 4, pairs: 10, timeLimit: 28, theme: 'transport', unlockReward: 280, obstacles: { ice: 15 } },
  75: { world: 15, level: 5, pairs: 10, timeLimit: 25, theme: 'transport', unlockReward: 1500, obstacles: { ice: 15 } },

  76: { world: 16, level: 1, pairs: 10, timeLimit: 45, theme: 'clothing', unlockReward: 270, obstacles: { ice: 4, iron: 2 } },
  77: { world: 16, level: 2, pairs: 10, timeLimit: 42, theme: 'clothing', unlockReward: 280, obstacles: { ice: 5, iron: 2 } },
  78: { world: 16, level: 3, pairs: 10, timeLimit: 38, theme: 'clothing', unlockReward: 290, obstacles: { ice: 5, iron: 3 } },
  79: { world: 16, level: 4, pairs: 10, timeLimit: 35, theme: 'clothing', unlockReward: 300, obstacles: { ice: 6, iron: 3 } },
  80: { world: 16, level: 5, pairs: 10, timeLimit: 32, theme: 'clothing', unlockReward: 1600, obstacles: { ice: 6, iron: 4 } },

  81: { world: 17, level: 1, pairs: 10, timeLimit: 42, theme: 'dinosaurs', unlockReward: 290, obstacles: { ice: 5, iron: 3 } },
  82: { world: 17, level: 2, pairs: 10, timeLimit: 38, theme: 'dinosaurs', unlockReward: 300, obstacles: { ice: 6, iron: 3 } },
  83: { world: 17, level: 3, pairs: 10, timeLimit: 35, theme: 'dinosaurs', unlockReward: 310, obstacles: { ice: 6, iron: 4 } },
  84: { world: 17, level: 4, pairs: 10, timeLimit: 32, theme: 'dinosaurs', unlockReward: 320, obstacles: { ice: 7, iron: 4 } },
  85: { world: 17, level: 5, pairs: 10, timeLimit: 30, theme: 'dinosaurs', unlockReward: 1700, obstacles: { ice: 7, iron: 5 } },

  86: { world: 18, level: 1, pairs: 10, timeLimit: 40, theme: 'sweets', unlockReward: 310, obstacles: { ice: 6, iron: 4 } },
  87: { world: 18, level: 2, pairs: 10, timeLimit: 36, theme: 'sweets', unlockReward: 320, obstacles: { ice: 7, iron: 4 } },
  88: { world: 18, level: 3, pairs: 10, timeLimit: 33, theme: 'sweets', unlockReward: 330, obstacles: { ice: 7, iron: 5 } },
  89: { world: 18, level: 4, pairs: 10, timeLimit: 30, theme: 'sweets', unlockReward: 340, obstacles: { ice: 8, iron: 5 } },
  90: { world: 18, level: 5, pairs: 10, timeLimit: 28, theme: 'sweets', unlockReward: 1800, obstacles: { ice: 8, iron: 6 } },

  91: { world: 19, level: 1, pairs: 10, timeLimit: 38, theme: 'jerseys', unlockReward: 330, obstacles: { ice: 7, iron: 5 } },
  92: { world: 19, level: 2, pairs: 10, timeLimit: 35, theme: 'jerseys', unlockReward: 340, obstacles: { ice: 8, iron: 5 } },
  93: { world: 19, level: 3, pairs: 10, timeLimit: 32, theme: 'jerseys', unlockReward: 350, obstacles: { ice: 8, iron: 6 } },
  94: { world: 19, level: 4, pairs: 10, timeLimit: 30, theme: 'jerseys', unlockReward: 360, obstacles: { ice: 9, iron: 6 } },
  95: { world: 19, level: 5, pairs: 10, timeLimit: 28, theme: 'jerseys', unlockReward: 1900, obstacles: { ice: 9, iron: 7 } },

  96: { world: 20, level: 1, pairs: 10, timeLimit: 36, theme: 'eyes', unlockReward: 350, obstacles: { ice: 8, iron: 6 } },
  97: { world: 20, level: 2, pairs: 10, timeLimit: 33, theme: 'eyes', unlockReward: 360, obstacles: { ice: 9, iron: 6 } },
  98: { world: 20, level: 3, pairs: 10, timeLimit: 30, theme: 'eyes', unlockReward: 370, obstacles: { ice: 9, iron: 7 } },
  99: { world: 20, level: 4, pairs: 10, timeLimit: 28, theme: 'eyes', unlockReward: 380, obstacles: { ice: 10, iron: 7 } },
  100: { world: 20, level: 5, pairs: 10, timeLimit: 25, theme: 'eyes', unlockReward: 2000, obstacles: { ice: 10, iron: 8 } },
};

export function getLevelConfig(levelId: number): LevelConfig | undefined {
  return LEVELS[levelId];
}

export function getLevelsByWorld(worldId: number): LevelConfig[] {
  return Object.values(LEVELS)
    .filter(l => l.world === worldId)
    .sort((a, b) => a.level - b.level);
}

export function getGlobalLevelId(world: number, level: number): number {
  return (world - 1) * 5 + level;
}
