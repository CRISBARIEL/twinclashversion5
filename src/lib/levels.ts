export interface LevelConfig {
  world: number;
  level: number;
  pairs: number;
  timeLimit: number;
  theme: string;
  unlockReward: number;
  obstacles?: { ice?: number; stone?: number };
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
  9: { world: 2, level: 4, pairs: 11, timeLimit: 44, theme: 'sports', unlockReward: 25 },
  10: { world: 2, level: 5, pairs: 12, timeLimit: 40, theme: 'sports', unlockReward: 120 },

  11: { world: 3, level: 1, pairs: 10, timeLimit: 50, theme: 'arcade', unlockReward: 20 },
  12: { world: 3, level: 2, pairs: 11, timeLimit: 47, theme: 'arcade', unlockReward: 22 },
  13: { world: 3, level: 3, pairs: 12, timeLimit: 44, theme: 'arcade', unlockReward: 25 },
  14: { world: 3, level: 4, pairs: 13, timeLimit: 40, theme: 'arcade', unlockReward: 30 },
  15: { world: 3, level: 5, pairs: 14, timeLimit: 35, theme: 'arcade', unlockReward: 150 },

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

  26: { world: 6, level: 1, pairs: 10, timeLimit: 38, theme: 'ocean', unlockReward: 70, obstacles: { ice: 5, stone: 3 } },
  27: { world: 6, level: 2, pairs: 10, timeLimit: 34, theme: 'ocean', unlockReward: 80, obstacles: { ice: 6, stone: 3 } },
  28: { world: 6, level: 3, pairs: 10, timeLimit: 30, theme: 'ocean', unlockReward: 90, obstacles: { ice: 7, stone: 4 } },
  29: { world: 6, level: 4, pairs: 10, timeLimit: 26, theme: 'ocean', unlockReward: 100, obstacles: { ice: 7, stone: 5 } },
  30: { world: 6, level: 5, pairs: 10, timeLimit: 22, theme: 'ocean', unlockReward: 600, obstacles: { ice: 8, stone: 5 } },

  31: { world: 7, level: 1, pairs: 10, timeLimit: 36, theme: 'food', unlockReward: 90, obstacles: { ice: 6, stone: 4 } },
  32: { world: 7, level: 2, pairs: 10, timeLimit: 32, theme: 'food', unlockReward: 100, obstacles: { ice: 7, stone: 4 } },
  33: { world: 7, level: 3, pairs: 10, timeLimit: 28, theme: 'food', unlockReward: 110, obstacles: { ice: 7, stone: 5 } },
  34: { world: 7, level: 4, pairs: 10, timeLimit: 24, theme: 'food', unlockReward: 120, obstacles: { ice: 8, stone: 5 } },
  35: { world: 7, level: 5, pairs: 10, timeLimit: 20, theme: 'food', unlockReward: 700, obstacles: { ice: 8, stone: 6 } },

  36: { world: 8, level: 1, pairs: 10, timeLimit: 34, theme: 'music', unlockReward: 110, obstacles: { ice: 7, stone: 5 } },
  37: { world: 8, level: 2, pairs: 10, timeLimit: 30, theme: 'music', unlockReward: 120, obstacles: { ice: 8, stone: 5 } },
  38: { world: 8, level: 3, pairs: 10, timeLimit: 26, theme: 'music', unlockReward: 130, obstacles: { ice: 8, stone: 6 } },
  39: { world: 8, level: 4, pairs: 10, timeLimit: 22, theme: 'music', unlockReward: 140, obstacles: { ice: 9, stone: 6 } },
  40: { world: 8, level: 5, pairs: 10, timeLimit: 18, theme: 'music', unlockReward: 800, obstacles: { ice: 9, stone: 7 } },

  41: { world: 9, level: 1, pairs: 10, timeLimit: 32, theme: 'beauty', unlockReward: 130, obstacles: { ice: 8, stone: 6 } },
  42: { world: 9, level: 2, pairs: 10, timeLimit: 28, theme: 'beauty', unlockReward: 140, obstacles: { ice: 8, stone: 7 } },
  43: { world: 9, level: 3, pairs: 10, timeLimit: 24, theme: 'beauty', unlockReward: 150, obstacles: { ice: 9, stone: 7 } },
  44: { world: 9, level: 4, pairs: 10, timeLimit: 20, theme: 'beauty', unlockReward: 160, obstacles: { ice: 9, stone: 8 } },
  45: { world: 9, level: 5, pairs: 10, timeLimit: 16, theme: 'beauty', unlockReward: 900, obstacles: { ice: 10, stone: 8 } },

  46: { world: 10, level: 1, pairs: 10, timeLimit: 30, theme: 'tech', unlockReward: 150, obstacles: { ice: 8, stone: 7 } },
  47: { world: 10, level: 2, pairs: 10, timeLimit: 26, theme: 'tech', unlockReward: 160, obstacles: { ice: 9, stone: 7 } },
  48: { world: 10, level: 3, pairs: 10, timeLimit: 22, theme: 'tech', unlockReward: 170, obstacles: { ice: 9, stone: 8 } },
  49: { world: 10, level: 4, pairs: 10, timeLimit: 18, theme: 'tech', unlockReward: 180, obstacles: { ice: 10, stone: 8 } },
  50: { world: 10, level: 5, pairs: 10, timeLimit: 15, theme: 'tech', unlockReward: 1000, obstacles: { ice: 10, stone: 8 } },
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
