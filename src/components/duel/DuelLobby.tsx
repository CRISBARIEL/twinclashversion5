import { useEffect, useState } from 'react';
import { ArrowLeft, Copy, Check, Trophy, AlertCircle } from 'lucide-react';
import { subscribeToDuelRoom, DuelRoom, submitDuelResult } from '../../lib/duelApi';
import { GameCore } from '../GameCore';
import { DuelResult } from './DuelResult';

interface DuelLobbyProps {
  room: DuelRoom;
  role: 'host' | 'guest';
  clientId: string;
  onBack: () => void;
}

export const DuelLobby = ({ room: initialRoom, role, clientId, onBack }: DuelLobbyProps) => {
  const [room, setRoom] = useState<DuelRoom | null>(initialRoom);
  const [gameStarted, setGameStarted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [myResultSubmitted, setMyResultSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialRoom) {
      setError('Sala no válida');
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToDuelRoom(initialRoom.room_code, (updatedRoom) => {
      setLoading(false);

      if (!updatedRoom) {
        console.error('[DuelLobby] Sala no encontrada o sin permisos');
        setError('Sala no encontrada o sin permisos de acceso');
        setRoom(null);
        return;
      }

      setRoom(updatedRoom);
      setError(null);

      if (updatedRoom.status === 'playing' && updatedRoom.guest_client_id && !gameStarted) {
        console.log('[DuelLobby] ¡El duelo ha comenzado!');
        setTimeout(() => {
          setGameStarted(true);
        }, 1000);
      }

      if (updatedRoom.status === 'finished' && updatedRoom.host_finished_at && updatedRoom.guest_finished_at) {
        setShowResults(true);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initialRoom?.room_code, gameStarted]);

  const handleDuelFinish = async (result: {
    win: boolean;
    timeMs: number;
    moves: number;
    pairsFound: number;
    level: number;
    duelCode: string;
    duelRole: 'host' | 'guest';
  }) => {
    if (myResultSubmitted) return;

    console.log('[DuelLobby] Enviando resultado:', result);

    try {
      await submitDuelResult(result.duelCode, result.duelRole, {
        win: result.win,
        timeMs: result.timeMs,
        moves: result.moves,
        pairsFound: result.pairsFound,
      });

      setMyResultSubmitted(true);
    } catch (err) {
      console.error('[DuelLobby] Error al enviar resultado:', err);
    }
  };

  const handleCopyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.room_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <AlertCircle className="text-red-600" size={40} />
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">
                {error || 'Sala no encontrada o sin permisos de acceso'}
              </p>
              <button
                onClick={onBack}
                className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl transition-all"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <DuelResult
        room={room}
        role={role}
        onBack={onBack}
      />
    );
  }

  if (gameStarted) {
    if (!room || !room.level_number) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-4">
          <div className="max-w-md mx-auto pt-8">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                  <AlertCircle className="text-red-600" size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Error</h2>
                <p className="text-gray-600 mb-6">Nivel inválido en sala</p>
                <button
                  onClick={onBack}
                  className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl transition-all"
                >
                  Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
        {myResultSubmitted && !showResults && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white rounded-2xl shadow-2xl px-8 py-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-purple-500 border-t-transparent"></div>
                <div>
                  <p className="font-black text-gray-800">Esperando rival...</p>
                  <p className="text-sm text-gray-600">Tu resultado ya fue enviado</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <GameCore
          level={room.level_number}
          duelLevel={room.level_number}
          duelCode={room.room_code}
          duelRole={role}
          duelSeed={room.seed}
          onDuelFinish={handleDuelFinish}
          onComplete={() => {}}
          onBackToMenu={onBack}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 font-bold">Cargando sala...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-4">
      <div className="max-w-md mx-auto pt-8">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-white font-bold hover:text-purple-200 transition-colors"
        >
          <ArrowLeft size={24} />
          Salir del Duelo
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mb-4">
              <Trophy className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Sala de Duelo</h2>
          </div>

          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Código</p>
              <div className="text-4xl font-black text-purple-600 tracking-wider mb-3">
                {room.room_code}
              </div>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg font-bold text-purple-600 hover:bg-purple-50 transition-colors text-sm"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Nivel:</span>
                <span className="font-bold text-gray-800">Nivel {room.level_number}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Host:</span>
                <span className="font-bold text-gray-800">{role === 'host' ? '👤 Tú' : '👥 Rival'}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Guest:</span>
                <span className="font-bold text-gray-800">
                  {room.guest_client_id ? (role === 'guest' ? '👤 Tú' : '👥 Rival') : '⏳ Esperando...'}
                </span>
              </div>
            </div>
          </div>

          {room.status === 'waiting' && (
            <div className="text-center">
              <div className="animate-pulse text-purple-600 font-bold mb-2">
                Esperando rival...
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}

          {room.status === 'playing' && !gameStarted && (
            <div className="text-center">
              <div className="text-2xl font-black text-green-600 mb-2">
                ¡Preparándose!
              </div>
              <p className="text-gray-600">El duelo comenzará en un momento...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
