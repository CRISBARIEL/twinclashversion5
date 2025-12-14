import { useState } from 'react';
import { ArrowLeft, Sword } from 'lucide-react';
import { joinDuelRoom, DuelRoom } from '../../lib/duelApi';

interface DuelJoinProps {
  onBack: () => void;
  onRoomJoined: (room: DuelRoom) => void;
  clientId: string;
}

export const DuelJoin = ({ onBack, onRoomJoined, clientId }: DuelJoinProps) => {
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinDuel = async () => {
    const normalizedCode = code.toUpperCase().trim();

    if (normalizedCode.length !== 6) {
      setError('El código debe tener 6 caracteres');
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const room = await joinDuelRoom(clientId, normalizedCode);
      onRoomJoined(room);
    } catch (err: any) {
      let errorMsg = 'Error al unirse al duelo. Intenta de nuevo.';

      if (err.message === 'ROOM_NOT_FOUND') {
        errorMsg = 'Sala no encontrada. Verifica el código.';
      } else if (err.message === 'ROOM_NOT_WAITING') {
        errorMsg = 'Esta sala ya no está disponible.';
      } else if (err.message === 'ROOM_FULL') {
        errorMsg = 'Esta sala ya está llena.';
      } else if (err.message) {
        errorMsg = `Error: ${err.message}`;
      }

      setError(errorMsg);
      console.error('[DuelJoin] Error:', err);
    } finally {
      setJoining(false);
    }
  };

  const handleCodeChange = (value: string) => {
    const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (upperValue.length <= 6) {
      setCode(upperValue);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-4">
      <div className="max-w-md mx-auto pt-8">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-white font-bold hover:text-purple-200 transition-colors"
        >
          <ArrowLeft size={24} />
          Volver
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mb-4">
              <Sword className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">Unirse a Duelo</h2>
            <p className="text-gray-600">Introduce el código de 6 caracteres</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Código del Duelo
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="ABC123"
              maxLength={6}
              className="w-full px-6 py-4 text-center text-3xl font-black tracking-wider border-4 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors uppercase"
              disabled={joining}
            />
            <p className="text-sm text-gray-500 text-center mt-2">
              {code.length}/6 caracteres
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-xl">
              <p className="text-red-600 font-bold text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleJoinDuel}
            disabled={code.length !== 6 || joining}
            className={`
              w-full py-4 rounded-xl font-bold text-lg transition-all
              ${code.length === 6 && !joining
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {joining ? 'Uniéndose...' : 'Unirse al Duelo'}
          </button>

          <div className="mt-6 p-4 bg-purple-50 rounded-xl">
            <p className="text-sm text-gray-600 text-center">
              💡 Pide el código a tu rival para comenzar la batalla
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
