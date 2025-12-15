import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface DuelRoom {
  id: string;
  room_code: string;
  status: 'waiting' | 'started' | 'finished';
  level: number;
  seed: string;
  host_client_id: string;
  guest_client_id: string | null;

  created_at: string;
  started_at: string | null;
  finished_at: string | null;

  host_result: DuelResult | null;
  guest_result: DuelResult | null;
}

export interface DuelResult {
  win: boolean;
  timeMs: number;
  moves: number;
  pairsFound: number;
  submittedAt?: string;
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

export async function createDuelRoom(clientId: string, levelNumber: number): Promise<DuelRoom> {
  if (!clientId || clientId.trim() === '') throw new Error('INVALID_CLIENT_ID');
  if (!levelNumber || levelNumber < 1) throw new Error('INVALID_LEVEL');

  const seedBase = Date.now();

  for (let attempt = 0; attempt < 3; attempt++) {
    const roomCode = generateRoomCode();
    const seed = `duel-${roomCode}-${seedBase}`;

    const { data, error } = await supabase
      .from('duel_rooms')
      .insert([{
        room_code: roomCode,
        level: levelNumber,
        seed,
        host_client_id: clientId,
        status: 'waiting',
      }])
      .select('*')
      .maybeSingle();

    if (!error && data) return data as DuelRoom;

    if (error && (error.code === '23505' || error.message?.toLowerCase().includes('duplicate'))) {
      continue;
    }

    throw new Error(`DB_ERROR: ${error?.message ?? 'Unknown error'}`);
  }

  throw new Error('FAILED_TO_CREATE_ROOM');
}

export async function joinDuelRoom(clientId: string, roomCode: string): Promise<DuelRoom> {
  if (!roomCode || roomCode.trim() === '') throw new Error('INVALID_ROOM_CODE');
  if (!clientId || clientId.trim() === '') throw new Error('INVALID_CLIENT_ID');

  const normalizedCode = roomCode.toUpperCase().trim();

  const { data: room, error: fetchError } = await supabase
    .from('duel_rooms')
    .select('*')
    .eq('room_code', normalizedCode)
    .maybeSingle();

  if (fetchError || !room) throw new Error('ROOM_NOT_FOUND');

  if (room.host_client_id === clientId) return room as DuelRoom;

  if (room.status !== 'waiting') throw new Error('ROOM_NOT_WAITING');
  if (room.guest_client_id) throw new Error('ROOM_FULL');

  const { data, error } = await supabase
    .from('duel_rooms')
    .update({
      guest_client_id: clientId,
      status: 'started',
      started_at: new Date().toISOString(),
    })
    .eq('id', room.id)
    .eq('status', 'waiting')
    .is('guest_client_id', null)
    .select('*')
    .maybeSingle();

  if (error || !data) throw new Error('ROOM_NO_LONGER_AVAILABLE');
  return data as DuelRoom;
}

export async function getDuelRoom(roomCode: string): Promise<DuelRoom | null> {
  if (!roomCode || roomCode.trim() === '') return null;

  const normalizedCode = roomCode.toUpperCase().trim();
  const { data, error } = await supabase
    .from('duel_rooms')
    .select('*')
    .eq('room_code', normalizedCode)
    .maybeSingle();

  if (error) return null;
  return (data as DuelRoom) ?? null;
}

export async function submitDuelResult(
  roomCode: string,
  role: 'host' | 'guest',
  result: DuelResult
): Promise<void> {
  if (!roomCode || roomCode.trim() === '') throw new Error('INVALID_ROOM_CODE');
  if (role !== 'host' && role !== 'guest') throw new Error('INVALID_ROLE');

  const normalizedCode = roomCode.toUpperCase().trim();

  const { data: room, error: fetchError } = await supabase
    .from('duel_rooms')
    .select('*')
    .eq('room_code', normalizedCode)
    .maybeSingle();

  if (fetchError || !room) throw new Error('ROOM_NOT_FOUND');

  const resultField = role === 'host' ? 'host_result' : 'guest_result';

  const updates: any = {
    [resultField]: {
      ...result,
      submittedAt: new Date().toISOString(),
    },
  };

  const otherField = role === 'host' ? 'guest_result' : 'host_result';
  const otherResultExists = !!(room as any)[otherField];

  if (otherResultExists) {
    updates.status = 'finished';
    updates.finished_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from('duel_rooms')
    .update(updates)
    .eq('id', room.id);

  if (updateError) throw new Error('FAILED_TO_SUBMIT_RESULT');
}

export async function cancelDuelRoom(roomId: string): Promise<void> {
  if (!roomId || roomId.trim() === '') return;

  await supabase
    .from('duel_rooms')
    .update({
      status: 'finished',
      finished_at: new Date().toISOString()
    })
    .eq('id', roomId);
}

export function subscribeToDuelRoom(
  roomCode: string,
  callback: (room: DuelRoom | null) => void
): () => void {
  if (!roomCode || roomCode.trim() === '') {
    callback(null);
    return () => {};
  }

  const normalizedCode = roomCode.toUpperCase().trim();
  let channel: RealtimeChannel | null = null;

  const fetchInitialRoom = async () => {
    console.log(`[subscribeToDuelRoom] Fetching initial room for code: ${normalizedCode}`);
    const { data, error } = await supabase
      .from('duel_rooms')
      .select('*')
      .eq('room_code', normalizedCode)
      .maybeSingle();

    if (error) {
      console.error('[subscribeToDuelRoom] Error fetching initial room:', error);
      return callback(null);
    }
    console.log('[subscribeToDuelRoom] Initial room fetched:', data);
    callback((data as DuelRoom) ?? null);
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
        console.log('[subscribeToDuelRoom] Realtime update received:', payload);
        if (payload.eventType === 'DELETE') {
          console.log('[subscribeToDuelRoom] Room deleted');
          callback(null);
        } else {
          console.log('[subscribeToDuelRoom] Room updated:', payload.new);
          callback((payload.new as DuelRoom) ?? null);
        }
      }
    )
    .subscribe((status) => {
      console.log(`[subscribeToDuelRoom] Subscription status: ${status}`);
    });

  return () => {
    console.log(`[subscribeToDuelRoom] Unsubscribing from room ${normalizedCode}`);
    if (channel) supabase.removeChannel(channel);
    channel = null;
  };
}

export async function finishDuel(
  roomId: string,
  clientId: string,
  timeElapsed: number,
  score: number
): Promise<void> {
  if (!roomId || !clientId) return;

  const { data: room, error } = await supabase
    .from('duel_rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();

  if (error || !room) return;

  const role: 'host' | 'guest' = (room as any).host_client_id === clientId ? 'host' : 'guest';

  const result: DuelResult = {
    win: true,
    timeMs: timeElapsed * 1000,
    moves: 0,
    pairsFound: score,
  };

  if ((room as any).room_code) {
    await submitDuelResult((room as any).room_code, role, result);
  }
}

export function determineWinner(room: DuelRoom): 'host' | 'guest' | 'tie' | null {
  if (!room.host_result || !room.guest_result) return null;

  const hostScore = room.host_result.pairsFound ?? 0;
  const guestScore = room.guest_result.pairsFound ?? 0;
  const hostTime = Math.floor((room.host_result.timeMs ?? 999999999) / 1000);
  const guestTime = Math.floor((room.guest_result.timeMs ?? 999999999) / 1000);

  if (hostScore !== guestScore) return hostScore > guestScore ? 'host' : 'guest';
  if (hostTime !== guestTime) return hostTime < guestTime ? 'host' : 'guest';
  return 'tie';
}
