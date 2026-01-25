import { supabase } from './supabase';
import { getLevelConfig } from './levels';
import { addCoins } from './progression';

export interface LevelStats {
  userId: string;
  levelId: number;
  bestStars: number;
  bestTimeMs: number | null;
  bestMoves: number | null;
  bestAccuracy: number | null;
  completed: boolean;
  timesPlayed: number;
}

export interface LevelResult {
  levelId: number;
  timeMs: number;
  moves: number;
  mistakes: number;
  totalAttempts: number;
}

export interface StarTargets {
  targetMoves2: number;
  targetMoves3: number;
  targetTime3?: number;
}

export interface ChestProgress {
  userId: string;
  progress: number;
  chestLevel: number;
  totalChestsOpened: number;
  lastOpenedAt: Date | null;
}

export interface DailyLogin {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: Date | null;
  lastClaimDate: Date | null;
  totalLogins: number;
}

export interface DailyMission {
  id: string;
  userId: string;
  missionDate: Date;
  missionType: 'complete_levels' | 'earn_stars' | 'perfect_levels';
  target: number;
  progress: number;
  rewardCoins: number;
  rewardBoosts: number;
  claimed: boolean;
}

export interface ChestReward {
  coins: number;
  boosts: number;
  items: string[];
}

// Calcular objetivos de estrellas para un nivel
export function calculateStarTargets(levelId: number): StarTargets {
  const config = getLevelConfig(levelId);
  if (!config) {
    return { targetMoves2: 12, targetMoves3: 10 };
  }

  const pairCount = config.pairs;

  // targetMoves3 = pairCount + floor(pairCount * 0.3)
  const targetMoves3 = pairCount + Math.floor(pairCount * 0.3);

  // targetMoves2 = pairCount + floor(pairCount * 0.6)
  const targetMoves2 = pairCount + Math.floor(pairCount * 0.6);

  // targetTime3 = baseTimePerPair * pairCount (1500ms por pareja)
  const targetTime3 = 1500 * pairCount;

  return { targetMoves2, targetMoves3, targetTime3 };
}

// Calcular cuántas estrellas se ganaron
export function calculateStars(result: LevelResult): number {
  const targets = calculateStarTargets(result.levelId);

  // 1 estrella: solo completar
  let stars = 1;

  // 2 estrellas: moves <= targetMoves2
  if (result.moves <= targets.targetMoves2) {
    stars = 2;
  }

  // 3 estrellas: moves <= targetMoves3 Y tiempo <= targetTime3
  if (result.moves <= targets.targetMoves3 &&
      (targets.targetTime3 === undefined || result.timeMs <= targets.targetTime3)) {
    stars = 3;
  }

  return stars;
}

// Obtener estadísticas de un nivel
export async function getLevelStats(userId: string, levelId: number): Promise<LevelStats | null> {
  const { data, error } = await supabase
    .from('level_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('level_id', levelId)
    .maybeSingle();

  if (error) {
    console.error('[progressionService] Error getting level stats:', error);
    return null;
  }

  if (!data) return null;

  return {
    userId: data.user_id,
    levelId: data.level_id,
    bestStars: data.best_stars,
    bestTimeMs: data.best_time_ms,
    bestMoves: data.best_moves,
    bestAccuracy: data.best_accuracy,
    completed: data.completed,
    timesPlayed: data.times_played,
  };
}

// Guardar resultado de nivel y actualizar estadísticas
export async function saveLevelResult(userId: string, result: LevelResult): Promise<{ starsEarned: number; improved: boolean; coinReward: number }> {
  const stars = calculateStars(result);
  const accuracy = result.totalAttempts > 0
    ? ((result.totalAttempts - result.mistakes) / result.totalAttempts) * 100
    : 100;

  // Obtener stats actuales
  const currentStats = await getLevelStats(userId, result.levelId);

  const isNewBest = !currentStats || stars > currentStats.bestStars;
  const improved = isNewBest && currentStats !== null;

  // Calcular recompensa
  let coinReward = 0;
  const config = getLevelConfig(result.levelId);
  const baseReward = config?.unlockReward || 10;

  if (isNewBest) {
    // Recompensa base por completar + bonus por estrellas
    coinReward = baseReward + (stars * 10);

    // Recompensa diferencial si mejoró
    if (improved && currentStats) {
      const starDiff = stars - currentStats.bestStars;
      coinReward = starDiff * 10; // Solo dar diferencial
    }
  }

  // Actualizar o insertar stats
  const statsData = {
    user_id: userId,
    level_id: result.levelId,
    best_stars: isNewBest ? stars : (currentStats?.bestStars || 0),
    best_time_ms: !currentStats || !currentStats.bestTimeMs || result.timeMs < currentStats.bestTimeMs
      ? result.timeMs
      : currentStats.bestTimeMs,
    best_moves: !currentStats || !currentStats.bestMoves || result.moves < currentStats.bestMoves
      ? result.moves
      : currentStats.bestMoves,
    best_accuracy: !currentStats || !currentStats.bestAccuracy || accuracy > currentStats.bestAccuracy
      ? accuracy
      : currentStats.bestAccuracy,
    completed: true,
    times_played: (currentStats?.timesPlayed || 0) + 1,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('level_stats')
    .upsert(statsData, { onConflict: 'user_id,level_id' });

  if (error) {
    console.error('[progressionService] Error saving level stats:', error);
  }

  // Dar monedas si hay recompensa
  if (coinReward > 0) {
    await addCoins(coinReward);
  }

  return { starsEarned: stars, improved, coinReward };
}

// Obtener todas las estadísticas de un usuario
export async function getAllLevelStats(userId: string): Promise<Map<number, LevelStats>> {
  const { data, error } = await supabase
    .from('level_stats')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('[progressionService] Error getting all level stats:', error);
    return new Map();
  }

  const statsMap = new Map<number, LevelStats>();

  data?.forEach(stat => {
    statsMap.set(stat.level_id, {
      userId: stat.user_id,
      levelId: stat.level_id,
      bestStars: stat.best_stars,
      bestTimeMs: stat.best_time_ms,
      bestMoves: stat.best_moves,
      bestAccuracy: stat.best_accuracy,
      completed: stat.completed,
      timesPlayed: stat.times_played,
    });
  });

  return statsMap;
}

// SISTEMA DE COFRES

export async function getChestProgress(userId: string): Promise<ChestProgress | null> {
  const { data, error } = await supabase
    .from('chest_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[progressionService] Error getting chest progress:', error);
    return null;
  }

  if (!data) {
    // Crear progreso inicial
    const { data: newData, error: insertError } = await supabase
      .from('chest_progress')
      .insert({ user_id: userId, progress: 0, chest_level: 1, total_chests_opened: 0 })
      .select()
      .single();

    if (insertError) {
      console.error('[progressionService] Error creating chest progress:', insertError);
      return null;
    }

    return {
      userId: newData.user_id,
      progress: newData.progress,
      chestLevel: newData.chest_level,
      totalChestsOpened: newData.total_chests_opened,
      lastOpenedAt: newData.last_opened_at ? new Date(newData.last_opened_at) : null,
    };
  }

  return {
    userId: data.user_id,
    progress: data.progress,
    chestLevel: data.chest_level,
    totalChestsOpened: data.total_chests_opened,
    lastOpenedAt: data.last_opened_at ? new Date(data.last_opened_at) : null,
  };
}

export async function incrementChestProgress(userId: string): Promise<{ shouldOpenChest: boolean; progress: ChestProgress | null }> {
  const current = await getChestProgress(userId);
  if (!current) return { shouldOpenChest: false, progress: null };

  const newProgress = current.progress + 1;
  const shouldOpenChest = newProgress >= 3;

  const { data, error } = await supabase
    .from('chest_progress')
    .update({
      progress: shouldOpenChest ? 0 : newProgress,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[progressionService] Error incrementing chest progress:', error);
    return { shouldOpenChest: false, progress: current };
  }

  return {
    shouldOpenChest,
    progress: {
      userId: data.user_id,
      progress: data.progress,
      chestLevel: data.chest_level,
      totalChestsOpened: data.total_chests_opened,
      lastOpenedAt: data.last_opened_at ? new Date(data.last_opened_at) : null,
    },
  };
}

export async function openChest(userId: string): Promise<ChestReward> {
  const current = await getChestProgress(userId);
  if (!current) {
    return { coins: 0, boosts: 0, items: [] };
  }

  // Calcular recompensa basada en chest_level
  const baseCoins = 50;
  const coins = baseCoins + (current.chestLevel * 20) + Math.floor(Math.random() * 50);
  const boosts = Math.random() < 0.3 ? 1 : 0; // 30% chance de boost
  const items: string[] = [];

  // Actualizar progreso
  await supabase
    .from('chest_progress')
    .update({
      total_chests_opened: current.totalChestsOpened + 1,
      chest_level: current.chestLevel + 1,
      last_opened_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  // Dar monedas
  await addCoins(coins);

  return { coins, boosts, items };
}

// SISTEMA DE LOGIN DIARIO

export async function getDailyLogin(userId: string): Promise<DailyLogin | null> {
  const { data, error } = await supabase
    .from('daily_login')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[progressionService] Error getting daily login:', error);
    return null;
  }

  if (!data) {
    // Crear registro inicial
    const { data: newData, error: insertError } = await supabase
      .from('daily_login')
      .insert({
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
        total_logins: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[progressionService] Error creating daily login:', insertError);
      return null;
    }

    return {
      userId: newData.user_id,
      currentStreak: newData.current_streak,
      longestStreak: newData.longest_streak,
      lastLoginDate: newData.last_login_date ? new Date(newData.last_login_date) : null,
      lastClaimDate: newData.last_claim_date ? new Date(newData.last_claim_date) : null,
      totalLogins: newData.total_logins,
    };
  }

  return {
    userId: data.user_id,
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    lastLoginDate: data.last_login_date ? new Date(data.last_login_date) : null,
    lastClaimDate: data.last_claim_date ? new Date(data.last_claim_date) : null,
    totalLogins: data.total_logins,
  };
}

export async function checkDailyLogin(userId: string): Promise<{ canClaim: boolean; streak: number; day: number }> {
  const login = await getDailyLogin(userId);
  if (!login) return { canClaim: false, streak: 0, day: 1 };

  const today = new Date().toISOString().split('T')[0];
  const lastClaim = login.lastClaimDate?.toISOString().split('T')[0];

  // Si ya reclamó hoy, no puede reclamar
  if (lastClaim === today) {
    const day = ((login.currentStreak - 1) % 7) + 1;
    return { canClaim: false, streak: login.currentStreak, day };
  }

  // Puede reclamar
  const day = (login.currentStreak % 7) + 1;
  return { canClaim: true, streak: login.currentStreak, day };
}

export async function claimDailyLogin(userId: string): Promise<{ coins: number; boosts: number; streak: number; day: number }> {
  const login = await getDailyLogin(userId);
  if (!login) return { coins: 0, boosts: 0, streak: 0, day: 1 };

  const today = new Date().toISOString().split('T')[0];
  const lastLogin = login.lastLoginDate?.toISOString().split('T')[0];
  const lastClaim = login.lastClaimDate?.toISOString().split('T')[0];

  // Si ya reclamó hoy, no dar nada
  if (lastClaim === today) {
    const day = ((login.currentStreak - 1) % 7) + 1;
    return { coins: 0, boosts: 0, streak: login.currentStreak, day };
  }

  let newStreak = login.currentStreak;

  // Calcular racha
  if (!lastLogin) {
    newStreak = 1;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastLogin === yesterdayStr) {
      newStreak = login.currentStreak + 1;
    } else if (lastLogin === today) {
      newStreak = login.currentStreak;
    } else {
      newStreak = 1;
    }
  }

  const day = ((newStreak - 1) % 7) + 1;
  const longestStreak = Math.max(newStreak, login.longestStreak);

  // Recompensas según día (ciclo de 7)
  const rewards = [
    { coins: 50, boosts: 0 },   // Día 1
    { coins: 80, boosts: 0 },   // Día 2
    { coins: 100, boosts: 1 },  // Día 3
    { coins: 120, boosts: 0 },  // Día 4
    { coins: 150, boosts: 2 },  // Día 5
    { coins: 200, boosts: 0 },  // Día 6
    { coins: 300, boosts: 3 },  // Día 7
  ];

  const reward = rewards[day - 1];

  // Actualizar registro
  await supabase
    .from('daily_login')
    .update({
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_login_date: today,
      last_claim_date: today,
      total_logins: login.totalLogins + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  // Dar recompensa
  await addCoins(reward.coins);

  return { ...reward, streak: newStreak, day };
}

// SISTEMA DE MISIONES DIARIAS

export async function getDailyMissions(userId: string): Promise<DailyMission[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('mission_date', today);

  if (error) {
    console.error('[progressionService] Error getting daily missions:', error);
    return [];
  }

  // Si no hay misiones para hoy, generarlas
  if (!data || data.length === 0) {
    return await generateDailyMissions(userId);
  }

  return data.map(m => ({
    id: m.id,
    userId: m.user_id,
    missionDate: new Date(m.mission_date),
    missionType: m.mission_type,
    target: m.target,
    progress: m.progress,
    rewardCoins: m.reward_coins,
    rewardBoosts: m.reward_boosts,
    claimed: m.claimed,
  }));
}

async function generateDailyMissions(userId: string): Promise<DailyMission[]> {
  const today = new Date().toISOString().split('T')[0];

  // Borrar misiones antiguas
  await supabase
    .from('daily_missions')
    .delete()
    .eq('user_id', userId)
    .neq('mission_date', today);

  // Generar 3 misiones
  const missions = [
    {
      user_id: userId,
      mission_date: today,
      mission_type: 'complete_levels',
      target: 5,
      progress: 0,
      reward_coins: 100,
      reward_boosts: 0,
      claimed: false,
    },
    {
      user_id: userId,
      mission_date: today,
      mission_type: 'earn_stars',
      target: 8,
      progress: 0,
      reward_coins: 120,
      reward_boosts: 0,
      claimed: false,
    },
    {
      user_id: userId,
      mission_date: today,
      mission_type: 'perfect_levels',
      target: 2,
      progress: 0,
      reward_coins: 0,
      reward_boosts: 1,
      claimed: false,
    },
  ];

  const { data, error } = await supabase
    .from('daily_missions')
    .insert(missions)
    .select();

  if (error) {
    console.error('[progressionService] Error generating daily missions:', error);
    return [];
  }

  return data.map(m => ({
    id: m.id,
    userId: m.user_id,
    missionDate: new Date(m.mission_date),
    missionType: m.mission_type,
    target: m.target,
    progress: m.progress,
    rewardCoins: m.reward_coins,
    rewardBoosts: m.reward_boosts,
    claimed: m.claimed,
  }));
}

export async function updateMissionProgress(userId: string, starsEarned: number, isPerfect: boolean): Promise<void> {
  const missions = await getDailyMissions(userId);

  for (const mission of missions) {
    if (mission.claimed) continue;

    let newProgress = mission.progress;

    if (mission.missionType === 'complete_levels') {
      newProgress += 1;
    } else if (mission.missionType === 'earn_stars') {
      newProgress += starsEarned;
    } else if (mission.missionType === 'perfect_levels' && isPerfect) {
      newProgress += 1;
    }

    if (newProgress !== mission.progress) {
      await supabase
        .from('daily_missions')
        .update({
          progress: Math.min(newProgress, mission.target),
          updated_at: new Date().toISOString(),
        })
        .eq('id', mission.id);
    }
  }
}

export async function claimMission(missionId: string): Promise<{ coins: number; boosts: number }> {
  const { data, error } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('id', missionId)
    .single();

  if (error || !data || data.claimed || data.progress < data.target) {
    return { coins: 0, boosts: 0 };
  }

  await supabase
    .from('daily_missions')
    .update({ claimed: true, updated_at: new Date().toISOString() })
    .eq('id', missionId);

  // Dar recompensa
  if (data.reward_coins > 0) {
    await addCoins(data.reward_coins);
  }

  return { coins: data.reward_coins, boosts: data.reward_boosts };
}

// SISTEMA DE VIDAS

export interface UserLives {
  userId: string;
  currentLives: number;
  maxLives: number;
  lastLifeLostAt: Date | null;
}

const LIFE_REGEN_TIME_MS = 60 * 60 * 1000; // 1 hora

export async function getUserLives(userId: string): Promise<UserLives | null> {
  const { data, error } = await supabase
    .from('user_lives')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[progressionService] Error getting user lives:', error);
    return null;
  }

  if (!data) {
    // Crear registro inicial con 5 vidas
    const { data: newData, error: insertError } = await supabase
      .from('user_lives')
      .insert({
        user_id: userId,
        current_lives: 5,
        max_lives: 5,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[progressionService] Error creating user lives:', insertError);
      return null;
    }

    return {
      userId: newData.user_id,
      currentLives: newData.current_lives,
      maxLives: newData.max_lives,
      lastLifeLostAt: null,
    };
  }

  // Calcular vidas regeneradas
  let currentLives = data.current_lives;
  const lastLifeLost = data.last_life_lost_at ? new Date(data.last_life_lost_at) : null;

  if (lastLifeLost && currentLives < data.max_lives) {
    const now = Date.now();
    const timeSinceLastLoss = now - lastLifeLost.getTime();
    const livesRegained = Math.floor(timeSinceLastLoss / LIFE_REGEN_TIME_MS);

    if (livesRegained > 0) {
      currentLives = Math.min(data.max_lives, currentLives + livesRegained);

      // Actualizar en base de datos
      await supabase
        .from('user_lives')
        .update({
          current_lives: currentLives,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    }
  }

  return {
    userId: data.user_id,
    currentLives,
    maxLives: data.max_lives,
    lastLifeLostAt: lastLifeLost,
  };
}

export async function loseLife(userId: string): Promise<{ success: boolean; livesLeft: number }> {
  const lives = await getUserLives(userId);
  if (!lives || lives.currentLives <= 0) {
    return { success: false, livesLeft: 0 };
  }

  const newLives = lives.currentLives - 1;

  const { error } = await supabase
    .from('user_lives')
    .update({
      current_lives: newLives,
      last_life_lost_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('[progressionService] Error losing life:', error);
    return { success: false, livesLeft: lives.currentLives };
  }

  return { success: true, livesLeft: newLives };
}

export function getTimeUntilNextLife(lives: UserLives): number | null {
  if (lives.currentLives >= lives.maxLives) return null;
  if (!lives.lastLifeLostAt) return null;

  const now = Date.now();
  const timeSinceLastLoss = now - lives.lastLifeLostAt.getTime();
  const timeUntilNextLife = LIFE_REGEN_TIME_MS - (timeSinceLastLoss % LIFE_REGEN_TIME_MS);

  return timeUntilNextLife;
}

export function formatTimeUntilNextLife(ms: number): string {
  const minutes = Math.floor(ms / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
