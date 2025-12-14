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
  if (!clientId || clientId.trim() === '') {
    console.error('[createDuelRoom] clientId inválido');
    throw new Error('INVALID_CLIENT_ID');
  }

  if (!levelNumber || levelNumber < 1) {
    console.error('[createDuelRoom] levelNumber inválido');
    throw new Error('INVALID_LEVEL');
  }

  console.log('[createDuelRoom] Creating room:', { clientId, levelNumber });
  const worldId = Math.ceil(levelNumber / 20);

  for (let attempt = 0; attempt < 3; attempt++) {
    const roomCode = generateRoomCode();
    const seed = `duel-${roomCode}-${Date.now()}`;

    try {
      console.log('[createDuelRoom] Attempt', attempt + 1, 'with code:', roomCode);
      console.log('[createDuelRoom] Data to insert:', {
        room_code: roomCode,
        world_id: worldId,
        level_number: levelNumber,
        seed,
        host_client_id: clientId,
        status: 'waiting',
      });

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
        .select();

      if (error) {
        console.error('[createDuelRoom] ❌ Supabase error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        if (error.message.toLowerCase().includes('duplicate') || error.code === '23505') {
          console.log('[createDuelRoom] Duplicate code, retrying...');
          continue;
        }

        throw new Error(`DB_ERROR: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.error('[createDuelRoom] ❌ No data returned');
        throw new Error('NO_DATA_RETURNED');
      }

      console.log('[createDuelRoom] ✅ Sala creada exitosamente:', roomCode);
      return data[0];
    } catch (err: any) {
      console.error('[createDuelRoom] ❌ Exception:', err);

      if (err.message?.startsWith('DB_ERROR:') || err.message === 'NO_DATA_RETURNED') {
        throw err;
      }

      if (attempt === 2) {
        throw new Error('FAILED_TO_CREATE_ROOM');
      }
    }
  }

  throw new Error('FAILED_TO_GENERATE_CODE');
}

export async function joinDuelRoom(clientId: string, roomCode: string): Promise<DuelRoom> {
  if (!roomCode || roomCode.trim() === '') {
    console.error('[joinDuelRoom] roomCode inválido');
    throw new Error('INVALID_ROOM_CODE');
  }

  if (!clientId || clientId.trim() === '') {
    console.error('[joinDuelRoom] clientId inválido');
    throw new Error('INVALID_CLIENT_ID');
  }

  try {
    const normalizedCode = roomCode.toUpperCase().trim();
    console.log('[joinDuelRoom] Joining room:', { clientId, roomCode: normalizedCode });

    const { data: room, error: fetchError } = await supabase
      .from('duel_rooms')
      .select('*')
      .eq('room_code', normalizedCode)
      .maybeSingle();

    if (fetchError) {
      console.error('[joinDuelRoom] ❌ Fetch error:', fetchError);
      throw new Error('ROOM_NOT_FOUND');
    }

    if (!room) {
      console.error('[joinDuelRoom] ❌ Sala no encontrada:', normalizedCode);
      throw new Error('ROOM_NOT_FOUND');
    }

    console.log('[joinDuelRoom] Room found:', room);

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
  if (!roomCode || roomCode.trim() === '') {
    console.error('[getDuelRoom] roomCode inválido');
    return null;
  }

  const normalizedCode = roomCode.toUpperCase().trim();

  const { data, error } = await supabase
    .from('duel_rooms')
    .select('*')
    .eq('room_code', normalizedCode)
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
  if (!roomCode || roomCode.trim() === '') {
    console.error('[submitDuelResult] roomCode inválido');
    throw new Error('INVALID_ROOM_CODE');
  }

  if (!role || (role !== 'host' && role !== 'guest')) {
    console.error('[submitDuelResult] role inválido');
    throw new Error('INVALID_ROLE');
  }

  try {
    const normalizedCode = roomCode.toUpperCase().trim();

    const { data: room, error: fetchError } = await supabase
      .from('duel_rooms')
      .select('*')
      .eq('room_code', normalizedCode)
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
  if (!roomId || roomId.trim() === '') {
    console.error('[cancelDuelRoom] roomId inválido');
    return;
  }

  await supabase
    .from('duel_rooms')
    .update({ status: 'cancelled' })
    .eq('id', roomId);
}

export function subscribeToDuelRoom(
  roomCode: string,
  callback: (room: DuelRoom | null) => void
): () => void {
  if (!roomCode || roomCode.trim() === '') {
    console.error('[subscribeToDuelRoom] roomCode inválido');
    callback(null);
    return () => {};
  }

  const normalizedCode = roomCode.toUpperCase().trim();
  let channel: RealtimeChannel | null = null;

  const fetchInitialRoom = async () => {
    try {
      const { data, error } = await supabase
        .from('duel_rooms')
        .select('*')
        .eq('room_code', normalizedCode)
        .maybeSingle();

      if (error) {
        console.error('[subscribeToDuelRoom] Initial fetch error:', error);
        callback(null);
        return;
      }

      callback(data);
    } catch (err) {
      console.error('[subscribeToDuelRoom] Initial fetch exception:', err);
      callback(null);
    }
  };

  fetchInitialRoom();

  channel = supabase
    .channel(`duel-room-${normalizedCode}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'duel_rooms',
        filter: `room_code=eq.${normalizedCode}`,
      },
      (payload) => {
        console.log('[subscribeToDuelRoom] Realtime update:', payload);

        if (payload.eventType === 'DELETE') {
          callback(null);
        } else if (payload.new) {
          callback(payload.new as DuelRoom);
        }
      }
    )
    .subscribe((status) => {
      console.log('[subscribeToDuelRoom] Subscription status:', status);
    });

  return () => {
    console.log('[subscribeToDuelRoom] Unsubscribing from room:', normalizedCode);
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  };
}

export async function finishDuel(
  roomId: string,
  clientId: string,
  timeElapsed: number,
  score: number
): Promise<void> {
  if (!roomId || !clientId) {
    console.error('[finishDuel] Parámetros inválidos');
    return;
  }

  try {
    const { data: room, error } = await supabase
      .from('duel_rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle();

    if (error || !room) {
      console.error('[finishDuel] Room not found:', error?.message);
      return;
    }

    const isHost = room.host_client_id === clientId;
    const role = isHost ? 'host' : 'guest';

    const result: DuelResult = {
      win: true,
      timeMs: timeElapsed * 1000,
      moves: 0,
      pairsFound: score,
    };

    const { data: roomData } = await supabase
      .from('duel_rooms')
      .select('room_code')
      .eq('id', roomId)
      .maybeSingle();

    if (roomData?.room_code) {
      await submitDuelResult(roomData.room_code, role, result);
    }
  } catch (err) {
    console.error('[finishDuel] Exception:', err);
  }
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
