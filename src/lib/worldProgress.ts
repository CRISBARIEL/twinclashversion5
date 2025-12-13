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

const WORLD_ORDER = ['world-1', 'world-2', 'world-3', 'world-4', 'world-5', 'world-6', 'world-7', 'world-8', 'world-9', 'world-10', 'world-11', 'world-12', 'world-13', 'world-14', 'world-15', 'world-16', 'world-17', 'world-18', 'world-19', 'world-20', 'world-21', 'world-22', 'world-23', 'world-24', 'world-25', 'world-26', 'world-27', 'world-28'];

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
  console.log('[ensureWorld] ====================================');
  console.log('[ensureWorld] START', { worldId, totalLevels });

  const existing = await readWorld(worldId);
  console.log('[ensureWorld] Existing state from DB:', JSON.stringify(existing, null, 2));

  if (existing && existing.levels?.length >= totalLevels) {
    console.log('[ensureWorld] ✅ World already has', existing.levels.length, 'levels (need', totalLevels, '), skipping');
    console.log('[ensureWorld] Current levels state:', existing.levels.map((l, i) => `L${i+1}: ${l.unlocked ? '🔓' : '🔒'} ${l.completed ? '✅' : '⬜'}`).join(' | '));
    console.log('[ensureWorld] ====================================');
    return;
  }

  const isPurchased = existing?.purchased ?? (worldId === 'world-1');

  if (existing && existing.levels && existing.levels.length > 0) {
    console.log('[ensureWorld] 🔧 Extending existing levels from', existing.levels.length, 'to', totalLevels);
    console.log('[ensureWorld] ⚠️ PRESERVING existing progress!');
    while (existing.levels.length < totalLevels) {
      existing.levels.push({
        unlocked: false,
        completed: false,
        stars: 0,
      });
    }
    console.log('[ensureWorld] Extended state:', JSON.stringify(existing, null, 2));
    await writeWorld(worldId, existing);
    console.log('[ensureWorld] ✅ COMPLETE (extended)');
    console.log('[ensureWorld] ====================================');
    return;
  }

  console.log('[ensureWorld] 🆕 Creating new world state (no existing data)');
  const levels: LevelState[] = Array.from({ length: totalLevels }, (_, i) => ({
    unlocked: isPurchased && i === 0,
    completed: false,
    stars: 0,
  }));

  const state: WorldState = {
    purchased: isPurchased,
    levels
  };

  console.log('[ensureWorld] New state:', JSON.stringify(state, null, 2));
  await writeWorld(worldId, state);
  console.log('[ensureWorld] ✅ COMPLETE (new)');
  console.log('[ensureWorld] ====================================');
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
  console.log('[completeWorldLevel] ====================================');
  console.log('[completeWorldLevel] START', { worldId, level, stars });

  const st = await readWorld(worldId);
  console.log('[completeWorldLevel] Current state from DB:', JSON.stringify(st, null, 2));

  if (!st) {
    console.error('[completeWorldLevel] ❌ World not found!', worldId);
    throw new Error('World not found');
  }

  const idx = level - 1;
  const lv = st.levels[idx];

  if (!lv) {
    console.error('[completeWorldLevel] ❌ Level not found!', { worldId, level, idx, levelsLength: st.levels.length });
    throw new Error('Level not found');
  }

  console.log('[completeWorldLevel] 📍 Target Level:', level, '(array index:', idx, ')');
  console.log('[completeWorldLevel] 📊 Before update:', { completed: lv.completed, unlocked: lv.unlocked, stars: lv.stars });

  lv.completed = true;
  lv.stars = Math.max(lv.stars, Math.max(0, Math.min(3, stars)));

  console.log('[completeWorldLevel] ✅ Marked level', level, 'as completed');

  const next = st.levels[idx + 1];
  if (next && !next.unlocked) {
    console.log('[completeWorldLevel] 🔓 Unlocking next level:', idx + 2);
    next.unlocked = true;
  } else if (!next) {
    console.log('[completeWorldLevel] ℹ️ No next level (end of world)');
  } else {
    console.log('[completeWorldLevel] ℹ️ Next level already unlocked');
  }

  console.log('[completeWorldLevel] 💾 Writing state to DB...');
  console.log('[completeWorldLevel] State to write:', JSON.stringify(st, null, 2));
  await writeWorld(worldId, st);
  console.log('[completeWorldLevel] ✅ COMPLETE');
  console.log('[completeWorldLevel] ====================================');
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
  'world-16': 10000,
  'world-17': 11000,
  'world-18': 12000,
  'world-19': 13000,
  'world-20': 14000,
  'world-21': 15000,
  'world-22': 16000,
  'world-23': 17000,
  'world-24': 18000,
  'world-25': 19000,
  'world-26': 20000,
  'world-27': 21000,
  'world-28': 22000,
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

  for (let i = 1; i <= 28; i++) {
    const worldId = `world-${i}`;
    if (await isWorldPurchased(worldId)) {
      unlocked.push(i);
    }
  }

  return unlocked;
}
