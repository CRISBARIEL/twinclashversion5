export interface LevelConfig {
  world: number;
  level: number;
  pairs: number;
  timeLimit: number;
  theme: string;
  unlockReward: number;
  obstacles?: { ice?: number; stone?: number; iron?: number; fire?: number; bomb?: number; virus?: number };
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

  101: { world: 21, level: 1, pairs: 4, timeLimit: 40, theme: 'professions', unlockReward: 50 },
  102: { world: 21, level: 2, pairs: 6, timeLimit: 38, theme: 'professions', unlockReward: 60 },
  103: { world: 21, level: 3, pairs: 8, timeLimit: 36, theme: 'professions', unlockReward: 70 },
  104: { world: 21, level: 4, pairs: 10, timeLimit: 34, theme: 'professions', unlockReward: 80, obstacles: { fire: 4 } },
  105: { world: 21, level: 5, pairs: 10, timeLimit: 32, theme: 'professions', unlockReward: 2100, obstacles: { virus: 5 } },

  106: { world: 22, level: 1, pairs: 4, timeLimit: 38, theme: 'emotions', unlockReward: 60 },
  107: { world: 22, level: 2, pairs: 6, timeLimit: 36, theme: 'emotions', unlockReward: 70 },
  108: { world: 22, level: 3, pairs: 8, timeLimit: 34, theme: 'emotions', unlockReward: 80 },
  109: { world: 22, level: 4, pairs: 10, timeLimit: 32, theme: 'emotions', unlockReward: 90, obstacles: { bomb: 3 } },
  110: { world: 22, level: 5, pairs: 10, timeLimit: 30, theme: 'emotions', unlockReward: 2200, obstacles: { fire: 5 } },

  111: { world: 23, level: 1, pairs: 4, timeLimit: 40, theme: 'pirates', unlockReward: 70 },
  112: { world: 23, level: 2, pairs: 6, timeLimit: 38, theme: 'pirates', unlockReward: 80 },
  113: { world: 23, level: 3, pairs: 8, timeLimit: 36, theme: 'pirates', unlockReward: 90 },
  114: { world: 23, level: 4, pairs: 10, timeLimit: 34, theme: 'pirates', unlockReward: 100, obstacles: { virus: 4 } },
  115: { world: 23, level: 5, pairs: 10, timeLimit: 32, theme: 'pirates', unlockReward: 2300, obstacles: { bomb: 4 } },

  116: { world: 24, level: 1, pairs: 4, timeLimit: 38, theme: 'jewels', unlockReward: 80 },
  117: { world: 24, level: 2, pairs: 6, timeLimit: 36, theme: 'jewels', unlockReward: 90 },
  118: { world: 24, level: 3, pairs: 8, timeLimit: 34, theme: 'jewels', unlockReward: 100 },
  119: { world: 24, level: 4, pairs: 10, timeLimit: 32, theme: 'jewels', unlockReward: 110, obstacles: { fire: 5 } },
  120: { world: 24, level: 5, pairs: 10, timeLimit: 30, theme: 'jewels', unlockReward: 2400, obstacles: { virus: 5 } },

  121: { world: 25, level: 1, pairs: 4, timeLimit: 36, theme: 'videogames', unlockReward: 90 },
  122: { world: 25, level: 2, pairs: 6, timeLimit: 34, theme: 'videogames', unlockReward: 100 },
  123: { world: 25, level: 3, pairs: 8, timeLimit: 32, theme: 'videogames', unlockReward: 110 },
  124: { world: 25, level: 4, pairs: 10, timeLimit: 30, theme: 'videogames', unlockReward: 120, obstacles: { bomb: 4 } },
  125: { world: 25, level: 5, pairs: 10, timeLimit: 28, theme: 'videogames', unlockReward: 2500, obstacles: { fire: 6 } },

  126: { world: 26, level: 1, pairs: 4, timeLimit: 38, theme: 'insects', unlockReward: 100 },
  127: { world: 26, level: 2, pairs: 6, timeLimit: 36, theme: 'insects', unlockReward: 110 },
  128: { world: 26, level: 3, pairs: 8, timeLimit: 34, theme: 'insects', unlockReward: 120 },
  129: { world: 26, level: 4, pairs: 10, timeLimit: 32, theme: 'insects', unlockReward: 130, obstacles: { virus: 5 } },
  130: { world: 26, level: 5, pairs: 10, timeLimit: 30, theme: 'insects', unlockReward: 2600, obstacles: { bomb: 5 } },

  131: { world: 27, level: 1, pairs: 4, timeLimit: 36, theme: 'fruits', unlockReward: 110 },
  132: { world: 27, level: 2, pairs: 6, timeLimit: 34, theme: 'fruits', unlockReward: 120 },
  133: { world: 27, level: 3, pairs: 8, timeLimit: 32, theme: 'fruits', unlockReward: 130 },
  134: { world: 27, level: 4, pairs: 10, timeLimit: 30, theme: 'fruits', unlockReward: 140, obstacles: { fire: 6 } },
  135: { world: 27, level: 5, pairs: 10, timeLimit: 28, theme: 'fruits', unlockReward: 2700, obstacles: { virus: 6 } },

  136: { world: 28, level: 1, pairs: 4, timeLimit: 38, theme: 'vegetables', unlockReward: 120 },
  137: { world: 28, level: 2, pairs: 6, timeLimit: 36, theme: 'vegetables', unlockReward: 130 },
  138: { world: 28, level: 3, pairs: 8, timeLimit: 34, theme: 'vegetables', unlockReward: 140 },
  139: { world: 28, level: 4, pairs: 10, timeLimit: 32, theme: 'vegetables', unlockReward: 150, obstacles: { bomb: 5 } },
  140: { world: 28, level: 5, pairs: 10, timeLimit: 30, theme: 'vegetables', unlockReward: 2800, obstacles: { fire: 6, virus: 4 } },
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
