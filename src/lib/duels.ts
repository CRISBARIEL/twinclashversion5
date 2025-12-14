import { getFirestore } from './firebase';

export interface DuelResult {
  win: boolean;
  timeMs: number;
  moves: number;
  pairsFound: number;
  finishedAtMs: number;
}

export interface DuelRoom {
  code: string;
  status: 'waiting' | 'started' | 'finished';
  level: number;
  seed: string;
  host: string;
  guest?: string;
  createdAt: number;
  startAt?: number;
  results?: {
    host?: DuelResult;
    guest?: DuelResult;
  };
}

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createDuel(level: number, hostId: string): Promise<DuelRoom> {
  const db = getFirestore();
  if (!db) {
    throw new Error('Firestore no está inicializado');
  }

  const code = generateCode();
  const seed = `duel-${code}-${Date.now()}`;

  const duelRoom: DuelRoom = {
    code,
    status: 'waiting',
    level,
    seed,
    host: hostId,
    createdAt: Date.now(),
  };

  await db.collection('duels').doc(code).set(duelRoom);
  console.log('[Duels] Sala creada:', code);

  return duelRoom;
}

export async function joinDuel(code: string, guestId: string): Promise<DuelRoom | null> {
  const db = getFirestore();
  if (!db) {
    throw new Error('Firestore no está inicializado');
  }

  const docRef = db.collection('duels').doc(code);
  const doc = await docRef.get();

  if (!doc.exists) {
    console.warn('[Duels] Sala no encontrada:', code);
    return null;
  }

  const room = doc.data() as DuelRoom;

  if (room.status !== 'waiting') {
    console.warn('[Duels] La sala ya no está esperando:', code);
    return null;
  }

  if (room.guest) {
    console.warn('[Duels] La sala ya tiene un invitado:', code);
    return null;
  }

  await docRef.update({
    guest: guestId,
    status: 'started',
    startAt: Date.now(),
  });

  console.log('[Duels] Unido a sala:', code);

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as DuelRoom;
}

export function listenDuel(code: string, callback: (room: DuelRoom | null) => void): () => void {
  const db = getFirestore();
  if (!db) {
    console.error('Firestore no está inicializado');
    callback(null);
    return () => {};
  }

  const docRef = db.collection('duels').doc(code);

  const unsubscribe = docRef.onSnapshot((doc: any) => {
    if (!doc.exists) {
      callback(null);
      return;
    }

    const room = doc.data() as DuelRoom;
    callback(room);
  });

  return unsubscribe;
}

export async function submitDuelResult(
  code: string,
  role: 'host' | 'guest',
  result: Omit<DuelResult, 'finishedAtMs'>
): Promise<void> {
  const db = getFirestore();
  if (!db) {
    throw new Error('Firestore no está inicializado');
  }

  const docRef = db.collection('duels').doc(code);

  const fullResult: DuelResult = {
    ...result,
    finishedAtMs: Date.now(),
  };

  await docRef.update({
    [`results.${role}`]: fullResult,
  });

  console.log('[Duels] Resultado enviado:', { code, role, result: fullResult });

  const doc = await docRef.get();
  const room = doc.data() as DuelRoom;

  if (room.results?.host && room.results?.guest) {
    await docRef.update({ status: 'finished' });
    console.log('[Duels] Duelo finalizado:', code);
  }
}

export function determineWinner(room: DuelRoom): 'host' | 'guest' | 'tie' | null {
  if (!room.results?.host || !room.results?.guest) {
    return null;
  }

  const hostResult = room.results.host;
  const guestResult = room.results.guest;

  if (hostResult.win && !guestResult.win) return 'host';
  if (!hostResult.win && guestResult.win) return 'guest';

  if (hostResult.win && guestResult.win) {
    if (hostResult.timeMs < guestResult.timeMs) return 'host';
    if (guestResult.timeMs < hostResult.timeMs) return 'guest';

    if (hostResult.moves < guestResult.moves) return 'host';
    if (guestResult.moves < hostResult.moves) return 'guest';

    return 'tie';
  }

  if (!hostResult.win && !guestResult.win) {
    if (hostResult.pairsFound > guestResult.pairsFound) return 'host';
    if (guestResult.pairsFound > hostResult.pairsFound) return 'guest';

    if (hostResult.timeMs < guestResult.timeMs) return 'host';
    if (guestResult.timeMs < hostResult.timeMs) return 'guest';

    if (hostResult.moves < guestResult.moves) return 'host';
    if (guestResult.moves < hostResult.moves) return 'guest';

    return 'tie';
  }

  return 'tie';
}
