import { supabase } from './supabase';

export interface DuelRoom {
  id: string;
  room_code: string;
  world_id: number;
  seed: string;
  host_client_id: string;
  guest_client_id: string | null;
  status: 'waiting' | 'playing' | 'finished' | 'cancelled';
  winner_client_id: string | null;
  host_finished_at: string | null;
  guest_finished_at: string | null;
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

export async function createDuelRoom(clientId: string, worldId: number): Promise<DuelRoom | null> {
  const roomCode = generateRoomCode();
  const seed = `duel-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const { data, error } = await supabase
    .from('duel_rooms')
    .insert({
      room_code: roomCode,
      world_id: worldId,
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
    .eq('status', 'waiting')
    .maybeSingle();

  if (fetchError || !room) {
    console.error('[joinDuelRoom] Room not found or error:', fetchError);
    return null;
  }

  if (room.host_client_id === clientId) {
    return room;
  }

  const { data, error } = await supabase
    .from('duel_rooms')
    .update({
      guest_client_id: clientId,
      status: 'playing',
    })
    .eq('id', room.id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('[joinDuelRoom] Error updating room:', error);
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

export async function finishDuel(roomId: string, clientId: string): Promise<void> {
  const { data: room } = await supabase
    .from('duel_rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();

  if (!room) return;

  const isHost = room.host_client_id === clientId;
  const updateField = isHost ? 'host_finished_at' : 'guest_finished_at';

  const updates: any = {
    [updateField]: new Date().toISOString(),
  };

  const otherFinishedField = isHost ? 'guest_finished_at' : 'host_finished_at';
  const otherFinished = room[otherFinishedField];

  if (otherFinished) {
    const myTime = new Date().toISOString();
    const otherTime = otherFinished;

    updates.winner_client_id = myTime < otherTime ? clientId : (isHost ? room.guest_client_id : room.host_client_id);
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
