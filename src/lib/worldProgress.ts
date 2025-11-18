import { supabase, getOrCreateClientId } from './supabase';
import { spendCoins } from './progression';

export type LevelState = {
  unlocked: boolean;
  completed: boolean;
  stars: number;
};

export type WorldState = {
  purchased: boolean;
  levels: LevelState[];
};

const WORLD_ORDER = ['world-1', 'world-2', 'world-3', 'world-4', 'world-5', 'world-6', 'world-7', 'world-8', 'world-9', 'world-10', 'world-11', 'world-12', 'world-13', 'world-14', 'world-15'];

async function readWorldSupabase(worldId: string): Promise<WorldState | null> {
  try {
    const clientId = getOrCreateClientId();
    const { data, error } = await supabase
      .from('world_progress')
      .select('purchased, levels')
      .eq('client_id', clientId)
      .eq('world_id', worldId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      purchased: !!data.purchased,
      levels: (data.levels as LevelState[]) || []
    };
  } catch (error) {
    console.error('Error reading world from Supabase:', error);
    return readWorldLocal(worldId);
  }
}

async function writeWorldSupabase(worldId: string, state: WorldState): Promise<void> {
  try {
    const clientId = getOrCreateClientId();
    const { error } = await supabase
      .from('world_progress')
      .upsert({
        client_id: clientId,
        world_id: worldId,
        purchased: state.purchased,
        levels: state.levels,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'client_id,world_id'
      });

    if (error) throw error;
    writeWorldLocal(worldId, state);
  } catch (error) {
    console.error('Error writing world to Supabase:', error);
    writeWorldLocal(worldId, state);
  }
}

function readWorldLocal(worldId: string): WorldState | null {
  const raw = localStorage.getItem(`progress.${worldId}`);
  return raw ? JSON.parse(raw) : null;
}

function writeWorldLocal(worldId: string, state: WorldState): void {
  localStorage.setItem(`progress.${worldId}`, JSON.stringify(state));
}

async function readWorld(worldId: string): Promise<WorldState | null> {
  return await readWorldSupabase(worldId);
}

async function writeWorld(worldId: string, state: WorldState): Promise<void> {
  await writeWorldSupabase(worldId, state);
}

export async function ensureWorld(worldId: string, totalLevels: number): Promise<void> {
  const existing = await readWorld(worldId);
  if (existing && existing.levels?.length >= totalLevels) return;

  const isPurchased = existing?.purchased ?? (worldId === 'world-1');
  const levels: LevelState[] = Array.from({ length: totalLevels }, (_, i) => ({
    unlocked: isPurchased && i === 0,
    completed: false,
    stars: 0,
  }));

  const state: WorldState = {
    purchased: isPurchased,
    levels
  };

  await writeWorld(worldId, state);
}

export async function isWorldPurchased(worldId: string): Promise<boolean> {
  const st = await readWorld(worldId);
  return !!st?.purchased;
}

export async function isWorldCompleted(worldId: string): Promise<boolean> {
  const st = await readWorld(worldId);
  if (!st) return false;
  return st.levels.length > 0 && st.levels.every(l => l.completed === true);
}

export async function canEnterWorld(worldId: string): Promise<boolean> {
  if (worldId === 'world-1') return true;
  if (await isWorldPurchased(worldId)) return true;

  const idx = WORLD_ORDER.indexOf(worldId);
  if (idx <= 0) return true;

  const prevId = WORLD_ORDER[idx - 1];
  return await isWorldCompleted(prevId);
}

export async function purchaseWorld(worldId: string, cost: number): Promise<{ ok: true } | { ok: false; reason: string }> {
  const st = (await readWorld(worldId)) ?? { purchased: false, levels: [] as LevelState[] };
  if (st.purchased) return { ok: true };

  if (!spendCoins(cost)) {
    return { ok: false, reason: 'No tienes suficientes monedas' };
  }

  st.purchased = true;
  if (!st.levels.length) {
    st.levels = [{ unlocked: true, completed: false, stars: 0 }];
  } else {
    st.levels[0].unlocked = true;
  }

  await writeWorld(worldId, st);
  return { ok: true };
}

export async function purchaseLevel(worldId: string, level: number, cost: number): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (level < 1) return { ok: false, reason: 'Nivel inválido' };
  if (level === 1) return { ok: true };

  const st = await readWorld(worldId);
  if (!st) return { ok: false, reason: 'Mundo no encontrado' };

  const idx = level - 1;
  if (idx >= st.levels.length) return { ok: false, reason: 'Nivel inexistente' };

  const lv = st.levels[idx];
  if (lv.unlocked) return { ok: true };

  if (!spendCoins(cost)) {
    return { ok: false, reason: 'No tienes suficientes monedas' };
  }

  lv.unlocked = true;
  await writeWorld(worldId, st);
  return { ok: true };
}

export async function canPlayLevel(worldId: string, level: number): Promise<boolean> {
  if (level === 1) return true;
  const st = await readWorld(worldId);
  if (!st) return false;
  const idx = level - 1;
  const lv = st.levels[idx];
  return !!lv?.unlocked;
}

export async function completeWorldLevel(worldId: string, level: number, stars = 0): Promise<void> {
  const st = await readWorld(worldId);
  if (!st) throw new Error('World not found');

  const idx = level - 1;
  const lv = st.levels[idx];
  if (!lv) throw new Error('Level not found');

  lv.completed = true;
  lv.stars = Math.max(lv.stars, Math.max(0, Math.min(3, stars)));

  const next = st.levels[idx + 1];
  if (next && !next.unlocked) {
    next.unlocked = true;
  }

  await writeWorld(worldId, st);
}

export async function getWorldState(worldId: string): Promise<WorldState> {
  const st = await readWorld(worldId);
  return st ?? { purchased: false, levels: [] as LevelState[] };
}

export function getWorldIdForLevel(levelNumber: number): string {
  const worldNum = Math.ceil(levelNumber / 5);
  return `world-${worldNum}`;
}

export function getLevelInWorld(levelNumber: number): number {
  return ((levelNumber - 1) % 5) + 1;
}

export const WORLD_COSTS = {
  'world-1': 0,
  'world-2': 300,
  'world-3': 500,
  'world-4': 700,
  'world-5': 1000,
  'world-6': 1500,
  'world-7': 2000,
  'world-8': 2500,
  'world-9': 3000,
  'world-10': 4000,
  'world-11': 5000,
  'world-12': 6000,
  'world-13': 7000,
  'world-14': 8000,
  'world-15': 9000,
};

export const LEVEL_UNLOCK_COST = 100;

export async function unlockWorld(worldNum: number): Promise<void> {
  const worldId = `world-${worldNum}`;
  const st = await readWorld(worldId);

  const newState: WorldState = {
    purchased: true,
    levels: st?.levels || [{ unlocked: true, completed: false, stars: 0 }]
  };

  if (newState.levels.length === 0) {
    newState.levels = [{ unlocked: true, completed: false, stars: 0 }];
  } else {
    newState.levels[0].unlocked = true;
  }

  await writeWorld(worldId, newState);
}

export async function getUnlockedWorlds(): Promise<number[]> {
  const unlocked: number[] = [];

  for (let i = 1; i <= 15; i++) {
    const worldId = `world-${i}`;
    if (await isWorldPurchased(worldId)) {
      unlocked.push(i);
    }
  }

  return unlocked;
}
