import { supabase } from './supabase';

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

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createDuelRoom(clientId: string, worldId: number, levelNumber: number): Promise<DuelRoom | null> {
  const roomCode = generateRoomCode();
  const seed = `duel-${Date.now()}-${Math.random().toString(36).substring(7)}`;

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

  if (error) {
    console.error('[createDuelRoom] Error:', error);
    return null;
  }

  return data;
}

export async function joinDuelRoom(clientId: string, roomCode: string): Promise<DuelRoom | null> {
  const { data: room, error: fetchError } = await supabase
    .from('duel_rooms')
    .select('*')
    .eq('room_code', roomCode)
    .maybeSingle();

  if (fetchError || !room) {
    console.error('[joinDuelRoom] Room not found or error:', fetchError);
    return null;
  }

  if (room.host_client_id === clientId) {
    return room;
  }

  if (room.status !== 'waiting') {
    console.error('[joinDuelRoom] Room is not available:', room.status);
    return null;
  }

  if (room.guest_client_id && room.guest_client_id !== clientId) {
    console.error('[joinDuelRoom] Room already has a guest');
    return null;
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

  if (error || !data) {
    console.error('[joinDuelRoom] Error updating room or room no longer available:', error);
    return null;
  }

  return data;
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

export async function finishDuel(roomId: string, clientId: string, time: number, score: number): Promise<void> {
  const { data: room } = await supabase
    .from('duel_rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();

  if (!room) return;

  const isHost = room.host_client_id === clientId;
  const timeField = isHost ? 'host_time' : 'guest_time';
  const scoreField = isHost ? 'host_score' : 'guest_score';
  const finishedAtField = isHost ? 'host_finished_at' : 'guest_finished_at';

  const updates: any = {
    [timeField]: time,
    [scoreField]: score,
    [finishedAtField]: new Date().toISOString(),
  };

  const otherTimeField = isHost ? 'guest_time' : 'host_time';
  const otherTime = room[otherTimeField];

  if (otherTime !== null && otherTime !== undefined) {
    updates.winner_client_id = time < otherTime ? clientId : (isHost ? room.guest_client_id : room.host_client_id);
    updates.status = 'finished';
  } else {
    updates.winner_client_id = clientId;
    updates.status = 'finished';
  }

  await supabase
    .from('duel_rooms')
    .update(updates)
    .eq('id', roomId);
}

export async function cancelDuelRoom(roomId: string): Promise<void> {
  await supabase
    .from('duel_rooms')
    .update({ status: 'cancelled' })
    .eq('id', roomId);
}
