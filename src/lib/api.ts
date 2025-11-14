import { supabase, getOrCreateClientId } from './supabase';
import { addCoins } from './progression';

export interface ScoreEntry {
  id: string;
  seed: string;
  time_ms: number;
  moves: number;
  client_id: string;
  created_at: string;
  crew_id?: string | null;
  is_bot?: boolean;
  display_name?: string | null;
}

export interface SubmitScoreParams {
  seed: string;
  timeMs: number;
  moves: number;
  crewId?: string | null;
  displayName?: string | null;
  levelId?: number | null;
}

export interface GetTopParams {
  seed: string;
  limit?: number;
}

export interface GetCrewTopParams {
  seed: string;
  crewId: string;
  limit?: number;
}

export function getCrewIdFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('crew');
}

export function setCrewIdInURL(crewId: string): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('crew', crewId);
  window.history.replaceState({}, '', url.toString());
}

export async function checkIfPioneer(seed: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('id', { count: 'exact', head: true })
      .eq('seed', seed)
      .eq('is_bot', false);

    if (error) {
      console.error('[checkIfPioneer] Error:', error);
      return false;
    }

    return (data?.length ?? 0) === 0;
  } catch (err) {
    console.error('[checkIfPioneer] Exception:', err);
    return false;
  }
}

export async function seedBotsIfEmpty(seed: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('id', { count: 'exact', head: true })
      .eq('seed', seed)
      .eq('is_bot', false);

    if (error) {
      console.error('[seedBotsIfEmpty] Error checking:', error);
      return;
    }

    if ((data?.length ?? 0) > 0) return;

    const botTimes = [23000, 27000, 31000, 35000, 40000];
    const bots = botTimes.map((timeMs, i) => ({
      seed,
      time_ms: timeMs,
      moves: 10 + i,
      client_id: `bot-${seed}-${i}`,
      display_name: `CPU Kiwi #${i + 1}`,
      is_bot: true,
    }));

    const { error: insertError } = await supabase.from('scores').insert(bots);

    if (insertError) {
      console.error('[seedBotsIfEmpty] Error inserting bots:', insertError);
    }
  } catch (err) {
    console.error('[seedBotsIfEmpty] Exception:', err);
  }
}

export async function submitScoreAndReward({
  seed,
  timeMs,
  moves,
  crewId = null,
  displayName = null,
  levelId = null
}: SubmitScoreParams): Promise<{ success: boolean; isPioneer: boolean }> {
  try {
    const wasPioneer = await checkIfPioneer(seed);
    const clientId = getOrCreateClientId();

    const score = Math.floor(10000 / (timeMs / 1000 + moves));

    const { error } = await supabase
      .from('scores')
      .insert({
        seed,
        time_ms: timeMs,
        moves,
        client_id: clientId,
        crew_id: crewId,
        display_name: displayName,
        is_bot: false,
        level_id: levelId,
        score: score,
      });

    if (error) {
      console.error('[submitScoreAndReward] Error:', error);
      return { success: false, isPioneer: false };
    }

    if (wasPioneer) {
      addCoins(20);
    }

    return { success: true, isPioneer: wasPioneer };
  } catch (err) {
    console.error('[submitScoreAndReward] Exception:', err);
    return { success: false, isPioneer: false };
  }
}

export async function submitScore({ seed, timeMs, moves, crewId = null, displayName = null }: SubmitScoreParams): Promise<boolean> {
  const result = await submitScoreAndReward({ seed, timeMs, moves, crewId, displayName });
  return result.success;
}

export async function getTop({ seed, limit = 20 }: GetTopParams): Promise<ScoreEntry[]> {
  try {
    await seedBotsIfEmpty(seed);

    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('seed', seed)
      .order('time_ms', { ascending: true })
      .order('moves', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('[getTop] Error:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[getTop] Exception:', err);
    return [];
  }
}

export async function getCrewTop({ seed, crewId, limit = 20 }: GetCrewTopParams): Promise<ScoreEntry[]> {
  try {
    if (!crewId) return [];

    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('seed', seed)
      .eq('crew_id', crewId)
      .eq('is_bot', false)
      .order('time_ms', { ascending: true })
      .order('moves', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('[getCrewTop] Error:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[getCrewTop] Exception:', err);
    return [];
  }
}
