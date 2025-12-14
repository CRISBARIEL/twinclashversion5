import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface DuelRoom {
  id: string;
  room_code: string;
  world_id: number;
  level_number: number;
  seed: string;
  host_client_id: string;
  guest_client_id: string | null;
  status: 'waiting' | 'playing' | 'finished' | 'cancelled';
  winner_client_id: string | null;
  host_finished_at: string | null;
  guest_finished_at: string | null;
  host_time: number | null;
  host_score: number | null;
  guest_time: number | null;
  guest_score: number | null;
  created_at: string;
  expires_at: string;
}

export interface DuelResult {
  win: boolean;
  timeMs: number;
  moves: number;
  pairsFound: number;
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createDuelRoom(clientId: string, levelNumber: number): Promise<DuelRoom> {
  const worldId = Math.ceil(levelNumber / 20);

  for (let attempt = 0; attempt < 10; attempt++) {
    const roomCode = generateRoomCode();
    const seed = `duel-${roomCode}-${Date.now()}`;

    try {
      const { data, error } = await supabase
        .from('duel_rooms')
        .insert({
          room_code: roomCode,
          world_id: worldId,
          level_number: levelNumber,
          seed,
          host_client_id: clientId,
          status: 'waiting',
        })
        .select()
        .maybeSingle();

      if (!error && data) {
        console.log('[createDuelRoom] Sala creada:', roomCode);
        return data;
      }

      if (error && !error.message.includes('duplicate')) {
        console.error('[createDuelRoom] Error:', error.message);
        throw new Error('FAILED_TO_CREATE_ROOM');
      }
    } catch (err: any) {
      console.error('[createDuelRoom] Exception:', err);
      if (attempt === 9) {
        throw new Error('FAILED_TO_CREATE_ROOM');
      }
    }
  }

  throw new Error('FAILED_TO_GENERATE_CODE');
}

export async function joinDuelRoom(clientId: string, roomCode: string): Promise<DuelRoom> {
  try {
    const normalizedCode = roomCode.toUpperCase().trim();

    const { data: room, error: fetchError } = await supabase
      .from('duel_rooms')
      .select('*')
      .eq('room_code', normalizedCode)
      .maybeSingle();

    if (fetchError) {
      console.error('[joinDuelRoom] Fetch error:', fetchError.message);
      throw new Error('ROOM_NOT_FOUND');
    }

    if (!room) {
      console.error('[joinDuelRoom] Sala no encontrada:', normalizedCode);
      throw new Error('ROOM_NOT_FOUND');
    }

    if (room.host_client_id === clientId) {
      console.log('[joinDuelRoom] Host reconnecting to own room');
      return room;
    }

    if (room.status !== 'waiting') {
      console.error('[joinDuelRoom] Sala no está esperando:', room.status);
      throw new Error('ROOM_NOT_WAITING');
    }

    if (room.guest_client_id) {
      console.error('[joinDuelRoom] Sala llena');
      throw new Error('ROOM_FULL');
    }

    const { data, error } = await supabase
      .from('duel_rooms')
      .update({
        guest_client_id: clientId,
        status: 'playing',
      })
      .eq('id', room.id)
      .eq('status', 'waiting')
      .is('guest_client_id', null)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[joinDuelRoom] Update error:', error.message);
      throw new Error('ROOM_NO_LONGER_AVAILABLE');
    }

    if (!data) {
      console.error('[joinDuelRoom] No data after update');
      throw new Error('ROOM_NO_LONGER_AVAILABLE');
    }

    console.log('[joinDuelRoom] Guest joined successfully');
    return data;
  } catch (err: any) {
    console.error('[joinDuelRoom] Exception:', err.message || err);
    throw err;
  }
}

export async function getDuelRoom(roomCode: string): Promise<DuelRoom | null> {
  const { data, error } = await supabase
    .from('duel_rooms')
    .select('*')
    .eq('room_code', roomCode)
    .maybeSingle();

  if (error) {
    console.error('[getDuelRoom] Error:', error);
    return null;
  }

  return data;
}

export async function submitDuelResult(
  roomCode: string,
  role: 'host' | 'guest',
  result: DuelResult
): Promise<void> {
  try {
    const { data: room, error: fetchError } = await supabase
      .from('duel_rooms')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .maybeSingle();

    if (fetchError || !room) {
      console.error('[submitDuelResult] Room not found:', fetchError?.message);
      throw new Error('ROOM_NOT_FOUND');
    }

  const timeInSeconds = Math.floor(result.timeMs / 1000);
  const isHost = role === 'host';
  const timeField = isHost ? 'host_time' : 'guest_time';
  const scoreField = isHost ? 'host_score' : 'guest_score';
  const finishedAtField = isHost ? 'host_finished_at' : 'guest_finished_at';

  const updates: any = {
    [timeField]: timeInSeconds,
    [scoreField]: result.pairsFound,
    [finishedAtField]: new Date().toISOString(),
  };

  const hostScore = isHost ? result.pairsFound : (room.host_score ?? 0);
  const guestScore = !isHost ? result.pairsFound : (room.guest_score ?? 0);
  const hostTime = isHost ? timeInSeconds : (room.host_time ?? 999999);
  const guestTime = !isHost ? timeInSeconds : (room.guest_time ?? 999999);
  const hostWin = isHost ? result.win : true;
  const guestWin = !isHost ? result.win : true;

  if (room.host_finished_at || room.guest_finished_at) {
    if (hostWin && !guestWin) {
      updates.winner_client_id = room.host_client_id;
    } else if (guestWin && !hostWin) {
      updates.winner_client_id = room.guest_client_id;
    } else if (hostWin && guestWin) {
      if (hostTime !== guestTime) {
        updates.winner_client_id = hostTime < guestTime ? room.host_client_id : room.guest_client_id;
      } else if (hostScore !== guestScore) {
        updates.winner_client_id = hostScore > guestScore ? room.host_client_id : room.guest_client_id;
      }
    } else {
      if (hostScore !== guestScore) {
        updates.winner_client_id = hostScore > guestScore ? room.host_client_id : room.guest_client_id;
      } else if (hostTime !== guestTime) {
        updates.winner_client_id = hostTime < guestTime ? room.host_client_id : room.guest_client_id;
      }
    }
    updates.status = 'finished';
  }

    const { error: updateError } = await supabase
      .from('duel_rooms')
      .update(updates)
      .eq('id', room.id);

    if (updateError) {
      console.error('[submitDuelResult] Update error:', updateError.message);
      throw new Error('FAILED_TO_SUBMIT_RESULT');
    }

    console.log('[submitDuelResult] Result submitted successfully');
  } catch (err: any) {
    console.error('[submitDuelResult] Exception:', err.message || err);
    throw err;
  }
}

export async function cancelDuelRoom(roomId: string): Promise<void> {
  await supabase
    .from('duel_rooms')
    .update({ status: 'cancelled' })
    .eq('id', roomId);
}

export function subscribeToDuelRoom(
  roomCode: string,
  callback: (room: DuelRoom | null) => void
): () => void {
  let alive = true;
  let intervalId: number | null = null;

  const pollRoom = async () => {
    if (!alive) return;

    try {
      const { data, error } = await supabase
        .from('duel_rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .maybeSingle();

      if (!alive) return;

      if (error) {
        console.error('[subscribeToDuelRoom] Error:', error);
        callback(null);
        return;
      }

      callback(data);
    } catch (err) {
      console.error('[subscribeToDuelRoom] Exception:', err);
      if (alive) {
        callback(null);
      }
    }
  };

  pollRoom();
  intervalId = window.setInterval(pollRoom, 1200);

  return () => {
    alive = false;
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

export function determineWinner(room: DuelRoom): 'host' | 'guest' | 'tie' | null {
  if (!room.host_finished_at || !room.guest_finished_at) {
    return null;
  }

  const hostScore = room.host_score ?? 0;
  const guestScore = room.guest_score ?? 0;
  const hostTime = room.host_time ?? 999999;
  const guestTime = room.guest_time ?? 999999;

  if (hostScore !== guestScore) {
    return hostScore > guestScore ? 'host' : 'guest';
  }

  if (hostTime !== guestTime) {
    return hostTime < guestTime ? 'host' : 'guest';
  }

  return 'tie';
}
