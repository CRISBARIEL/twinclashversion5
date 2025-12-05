import { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Users, ArrowLeft, Copy, MessageCircle } from 'lucide-react';
import { GameCard } from './GameCard';
import { DuelInvitePanel } from './DuelInvitePanel';
import { PowerUpButtons } from './PowerUpButtons';
import { Card } from '../types';
import { getImagesForLevel } from '../utils/imageManager';
import { prng } from '../lib/seed';
import { getOrCreateClientId, supabase } from '../lib/supabase';
import { createConfetti } from '../utils/confetti';
import { addCoins } from '../lib/progression';
import { getLevelConfig, getGlobalLevelId } from '../lib/levels';
import { createDuelRoom, joinDuelRoom, getDuelRoom, finishDuel, cancelDuelRoom, DuelRoom } from '../lib/duelApi';
import { soundManager } from '../lib/sound';

interface DuelSceneProps {
  onBackToMenu: () => void;
}

export const DuelScene = ({ onBackToMenu }: DuelSceneProps) => {
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [room, setRoom] = useState<DuelRoom | null>(null);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'finished'>('lobby');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [winner, setWinner] = useState<'me' | 'opponent' | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPowerUpModalOpen, setIsPowerUpModalOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const clientId = getOrCreateClientId();
  const isCheckingRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const elapsedTimerRef = useRef<number | null>(null);
  const channelRef = useRef<any>(null);
  const isHost = room?.host_client_id === clientId;
  const opponentConnected = room?.guest_client_id != null;

  const generateCards = useCallback((gameSeed: string, worldId: number, levelNumber: number) => {
    const levelId = getGlobalLevelId(worldId, levelNumber);
    const levelConfig = getLevelConfig(levelId);
    const pairsCount = levelConfig?.pairs || 10;
    const levelImages = getImagesForLevel(levelId);

    const cardPairs = levelImages.slice(0, pairsCount).flatMap((img, idx) => [
      { id: idx * 2, imageIndex: idx, isFlipped: false, isMatched: false },
      { id: idx * 2 + 1, imageIndex: idx, isFlipped: false, isMatched: false },
    ]);

    const rng = prng(gameSeed);
    const shuffled = [...cardPairs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }, []);

  useEffect(() => {
    soundManager.stopStartMusic();

    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get('room');

    if (roomCode) {
      handleJoinRoom(roomCode);
    }
  }, []);

  useEffect(() => {
    if (!room) return;

    const channel = supabase.channel(`duel_room:${room.room_code}`);
    channelRef.current = channel;

    channel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'duel_rooms',
        filter: `room_code=eq.${room.room_code}`,
      }, (payload) => {
        console.log('[DuelScene] Room updated:', payload);
        const updatedRoom = payload.new as DuelRoom;
        setRoom(updatedRoom);

        if (updatedRoom.status === 'playing' && gameState === 'lobby') {
          startGame(updatedRoom);
        }

        if (updatedRoom.status === 'finished' && gameState === 'playing') {
          handleGameFinished(updatedRoom);
        }
      })
      .subscribe();

    if (room.status === 'playing' && gameState === 'lobby') {
      startGame(room);
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.room_code, room?.status]);

  const startGame = (currentRoom: DuelRoom) => {
    const levelId = getGlobalLevelId(currentRoom.world_id, currentRoom.level_number);
    const levelConfig = getLevelConfig(levelId);
    const generatedCards = generateCards(currentRoom.seed, currentRoom.world_id, currentRoom.level_number);

    setCards(generatedCards);
    setTimeLeft(levelConfig?.timeLimit || 60);
    setScore(0);
    setMatchedPairs(new Set());
    setFlippedCards([]);
    setGameState('playing');
    setElapsedTime(0);

    elapsedTimerRef.current = window.setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = async () => {
    if (!room) return;
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
    await finishDuel(room.id, clientId, elapsedTime, score);
  };

  const handleGameFinished = async (finishedRoom: DuelRoom) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }

    const myScoreField = isHost ? 'host_score' : 'guest_score';
    const myScore = finishedRoom[myScoreField];

    if (myScore === null || myScore === undefined) {
      await finishDuel(finishedRoom.id, clientId, elapsedTime, score);
      return;
    }

    setGameState('finished');

    const isWinner = finishedRoom.winner_client_id === clientId;
    setWinner(isWinner ? 'me' : 'opponent');

    if (isWinner) {
      const coinReward = 20 + (finishedRoom.world_id - 1) * 13;
      addCoins(coinReward);
      soundManager.playWin();
      createConfetti();
    } else {
      soundManager.playLose();
    }

    setShowResultModal(true);
  };

  const handleCreateRoom = async (worldId: number, levelNumber: number) => {
    const newRoom = await createDuelRoom(clientId, worldId, levelNumber);
    if (newRoom) {
      setRoom(newRoom);
      const url = new URL(window.location.href);
      url.searchParams.set('room', newRoom.room_code);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleJoinRoom = async (roomCode: string) => {
    const existingRoom = await getDuelRoom(roomCode);

    if (!existingRoom) {
      alert('❌ Código incorrecto. La sala no existe.');
      return;
    }

    if (existingRoom.host_client_id === clientId) {
      setRoom(existingRoom);
      const url = new URL(window.location.href);
      url.searchParams.set('room', existingRoom.room_code);
      window.history.replaceState({}, '', url.toString());
      return;
    }

    if (existingRoom.status !== 'waiting') {
      alert('⚠️ Esta sala ya no está disponible. El duelo ya comenzó o finalizó.');
      return;
    }

    if (existingRoom.guest_client_id && existingRoom.guest_client_id !== clientId) {
      alert('🚫 Sala llena. Ya hay otro jugador en esta sala.');
      return;
    }

    const joinedRoom = await joinDuelRoom(clientId, roomCode);
    if (joinedRoom) {
      setRoom(joinedRoom);
      const url = new URL(window.location.href);
      url.searchParams.set('room', joinedRoom.room_code);
      window.history.replaceState({}, '', url.toString());

      if (joinedRoom.status === 'playing') {
        startGame(joinedRoom);
      }
    } else {
      alert('⚠️ No se pudo unir a la sala. Intenta nuevamente.');
    }
  };

  const handleCardClick = useCallback(
    async (id: number) => {
      if (gameState !== 'playing' || isCheckingRef.current || flippedCards.length >= 2 || !room) return;

      const card = cards.find((c) => c.id === id);
      if (!card || matchedPairs.has(card.imageIndex) || flippedCards.includes(id)) return;

      const newFlipped = [...flippedCards, id];
      setFlippedCards(newFlipped);
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c)));

      if (newFlipped.length === 2) {
        isCheckingRef.current = true;

        const [firstId, secondId] = newFlipped;
        const firstCard = cards.find((c) => c.id === firstId);
        const secondCard = cards.find((c) => c.id === secondId);

        if (firstCard && secondCard && firstCard.imageIndex === secondCard.imageIndex) {
          soundManager.playMatch();
          setMatchedPairs((prev) => new Set(prev).add(firstCard.imageIndex));
          const newScore = score + 1;
          setScore(newScore);
          setFlippedCards([]);
          isCheckingRef.current = false;

          const levelId = getGlobalLevelId(room.world_id, room.level_number);
          const levelConfig = getLevelConfig(levelId);
          const totalPairs = levelConfig?.pairs || 10;

          if (newScore >= totalPairs) {
            if (timerRef.current) clearInterval(timerRef.current);
            if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
            await finishDuel(room.id, clientId, elapsedTime, newScore);
          }
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c))
            );
            setFlippedCards([]);
            isCheckingRef.current = false;
          }, 600);
        }
      }
    },
    [cards, flippedCards, gameState, matchedPairs, score, room, clientId]
  );

  const handleExit = async () => {
    if (gameState === 'playing') {
      const confirmExit = confirm('¿Seguro que quieres salir? Perderás la partida.');
      if (!confirmExit) return;
      if (room) await cancelDuelRoom(room.id);
    }
    onBackToMenu();
  };

  const copyRoomCode = async () => {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(room.room_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(`Código: ${room.room_code}`);
    }
  };

  const shareRoom = async () => {
    if (!room) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${room.room_code}`;
    const text = `🎮 ¡Únete a mi duelo en Twin Clash!\n🔑 Código: ${room.room_code}\n🌍 Mundo ${room.world_id}\n\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Twin Clash Duelo', text, url });
      } catch (err) {
        console.log('Share cancelled', err);
      }
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleRevealCards = useCallback((percentage: number) => {
    if (!room) return;

    const levelId = getGlobalLevelId(room.world_id, room.level_number);
    const levelConfig = getLevelConfig(levelId);
    const totalPairs = levelConfig?.pairs || 10;

    const unmatchedPairs = Array.from({ length: totalPairs }, (_, i) => i).filter(idx => !matchedPairs.has(idx));
    const numToReveal = Math.ceil(unmatchedPairs.length * (percentage / 100));

    const shuffled = [...unmatchedPairs].sort(() => Math.random() - 0.5);
    const toReveal = new Set(shuffled.slice(0, numToReveal));

    soundManager.playMatch();
    setMatchedPairs(prev => {
      const next = new Set(prev);
      toReveal.forEach(idx => next.add(idx));
      return next;
    });
    setScore(prev => prev + toReveal.size);

    const newScore = score + toReveal.size;
    if (newScore >= totalPairs) {
      setTimeout(async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
        await finishDuel(room.id, clientId, elapsedTime, newScore);
      }, 500);
    }
  }, [room, matchedPairs, score, clientId, elapsedTime]);

  const handleFreezeTime = useCallback((seconds: number) => {
    setTimeLeft(prev => prev + seconds);
  }, []);

  const levelImages = room ? getImagesForLevel(getGlobalLevelId(room.world_id, room.level_number)) : [];
  const levelConfig = room ? getLevelConfig(getGlobalLevelId(room.world_id, room.level_number)) : null;
  const currentTheme = levelConfig?.theme || 'nature';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-purple-600 flex flex-col p-4">
      <div className="bg-white rounded-2xl shadow-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Duelo 1v1</h2>
            {room && <p className="text-xs text-gray-500 capitalize">Mundo {room.world_id} - {currentTheme}</p>}
          </div>
          <button
            onClick={handleExit}
            className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Salir
          </button>
        </div>

        {gameState === 'lobby' && !room && (
          <div className="text-center py-8">
            <button
              onClick={() => setShowInvitePanel(true)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
            >
              🎮 Crear o Unirse a Duelo
            </button>
          </div>
        )}

        {gameState === 'lobby' && room && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Users size={16} className={opponentConnected ? 'text-green-500' : 'text-gray-400'} />
              <span className={opponentConnected ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                {opponentConnected ? '¡Oponente conectado!' : 'Esperando oponente...'}
              </span>
            </div>

            <div className="bg-gray-100 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Código de la sala:</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-gray-800 tracking-widest">{room.room_code}</div>
                <button
                  onClick={copyRoomCode}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={shareRoom}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  title="Compartir por WhatsApp"
                >
                  <MessageCircle size={16} />
                </button>
              </div>
              {copied && <div className="text-xs text-green-600 mt-1">✅ Copiado</div>}
            </div>

            {!opponentConnected && (
              <div className="text-sm text-gray-600 text-center bg-blue-50 p-3 rounded-lg">
                💡 Comparte el código con tu rival para que se una
              </div>
            )}
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div className="flex items-center justify-around text-center mb-3">
              <div>
                <div className="text-2xl font-bold text-blue-600">{score}</div>
                <div className="text-xs text-gray-600">Parejas</div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-red-500" />
                <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                  {timeLeft}s
                </div>
              </div>
            </div>
            <PowerUpButtons
              onPowerUpUsed={handleRevealCards}
              onFreezeTime={handleFreezeTime}
              disabled={isPowerUpModalOpen}
              onModalStateChange={setIsPowerUpModalOpen}
            />
          </>
        )}
      </div>

      {gameState === 'lobby' && room && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <Users size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">Sala: {room.room_code}</p>
            <p className="text-sm opacity-80">
              {opponentConnected ? 'El duelo comenzará automáticamente...' : 'Esperando oponente...'}
            </p>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-lg">
            <div className="grid grid-cols-4 gap-3">
              {cards.map((card) => {
                const cardWithMatch = { ...card, isMatched: matchedPairs.has(card.imageIndex) };
                return (
                  <GameCard
                    key={card.id}
                    card={cardWithMatch}
                    image={levelImages[card.imageIndex]}
                    onClick={handleCardClick}
                    disabled={isCheckingRef.current}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showResultModal && gameState === 'finished' && room && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">{winner === 'me' ? '🏆' : '😢'}</div>
            <h3 className={`text-3xl font-bold mb-2 ${winner === 'me' ? 'text-green-600' : 'text-gray-600'}`}>
              {winner === 'me' ? '¡Ganaste!' : 'Perdiste'}
            </h3>

            <div className="bg-gray-100 rounded-xl p-4 mb-4 text-left">
              <h4 className="text-sm font-bold text-gray-700 mb-3 text-center">Resultados</h4>

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Tu tiempo:</span>
                <span className={`font-bold ${winner === 'me' ? 'text-green-600' : 'text-gray-800'}`}>
                  {isHost ? room.host_time : room.guest_time}s
                </span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Tus parejas:</span>
                <span className="font-bold text-blue-600">
                  {isHost ? room.host_score : room.guest_score}
                </span>
              </div>

              <div className="border-t border-gray-300 my-2"></div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Tiempo rival:</span>
                <span className={`font-bold ${winner === 'opponent' ? 'text-green-600' : 'text-gray-800'}`}>
                  {isHost ? room.guest_time : room.host_time}s
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Parejas rival:</span>
                <span className="font-bold text-blue-600">
                  {isHost ? room.guest_score : room.host_score}
                </span>
              </div>
            </div>

            {winner === 'me' && (
              <p className="text-sm text-gray-600 mb-4">
                +{20 + (room.world_id - 1) * 13} monedas
              </p>
            )}
            <button
              onClick={onBackToMenu}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all"
            >
              Volver al Menú
            </button>
          </div>
        </div>
      )}

      {showInvitePanel && (
        <DuelInvitePanel
          onClose={() => setShowInvitePanel(false)}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}
    </div>
  );
};
