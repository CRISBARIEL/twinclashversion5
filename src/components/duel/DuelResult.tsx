import { Trophy, Flame, Timer, Target, ArrowLeft } from 'lucide-react';
import { DuelRoom, determineWinner } from '../../lib/duelApi';
import { useEffect } from 'react';
import { createConfetti } from '../../utils/confetti';

interface DuelResultProps {
  room: DuelRoom;
  role: 'host' | 'guest';
  onBack: () => void;
}

export const DuelResult = ({ room, role, onBack }: DuelResultProps) => {
  const winner = determineWinner(room);
  const isWinner = winner === role;
  const isTie = winner === 'tie';

  const isHost = role === 'host';
  const myTime = Math.floor(((isHost ? room.host_result?.timeMs : room.guest_result?.timeMs) ?? 0) / 1000);
  const myScore = (isHost ? room.host_result?.pairsFound : room.guest_result?.pairsFound) ?? 0;
  const rivalTime = Math.floor(((isHost ? room.guest_result?.timeMs : room.host_result?.timeMs) ?? 0) / 1000);
  const rivalScore = (isHost ? room.guest_result?.pairsFound : room.host_result?.pairsFound) ?? 0;

  const myWin = winner === role;
  const rivalWin = winner === (role === 'host' ? 'guest' : 'host');

  useEffect(() => {
    if (isWinner || isTie) {
      createConfetti();
    }
  }, [isWinner, isTie]);

  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                isWinner
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                  : isTie
                  ? 'bg-gradient-to-br from-blue-400 to-purple-500'
                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
              }`}
            >
              <Trophy className="text-white" size={48} />
            </div>

            <h2 className="text-4xl font-black text-gray-800 mb-2">
              {isWinner ? '¡Victoria! 🎉' : isTie ? '¡Empate! 🤝' : 'Derrota 😔'}
            </h2>

            <p className="text-lg text-gray-600">
              {isWinner
                ? '¡Has derrotado a tu rival!'
                : isTie
                ? '¡Ambos son igual de buenos!'
                : 'Tu rival fue más rápido esta vez'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div
              className={`rounded-xl p-6 ${
                isWinner
                  ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-4 border-green-400'
                  : 'bg-gray-50'
              }`}
            >
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">
                  {isWinner ? '👑' : '👤'}
                </div>
                <h3 className="text-xl font-black text-gray-800">Tú</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    {myWin ? (
                      <Trophy className="text-green-500" size={20} />
                    ) : (
                      <Flame className="text-red-500" size={20} />
                    )}
                    <span className="text-sm text-gray-600">Resultado:</span>
                  </div>
                  <span className={`font-bold ${myWin ? 'text-green-600' : 'text-red-600'}`}>
                    {myWin ? 'Ganó' : isTie ? 'Empate' : 'Perdió'}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Timer className="text-blue-500" size={20} />
                    <span className="text-sm text-gray-600">Tiempo:</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {formatTime(myTime)}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="text-orange-500" size={20} />
                    <span className="text-sm text-gray-600">Pares:</span>
                  </div>
                  <span className="font-bold text-gray-800">{myScore}</span>
                </div>
              </div>
            </div>

            <div
              className={`rounded-xl p-6 ${
                !isWinner && !isTie
                  ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-yellow-400'
                  : 'bg-gray-50'
              }`}
            >
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">
                  {!isWinner && !isTie ? '👑' : '👥'}
                </div>
                <h3 className="text-xl font-black text-gray-800">Rival</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    {rivalWin ? (
                      <Trophy className="text-green-500" size={20} />
                    ) : (
                      <Flame className="text-red-500" size={20} />
                    )}
                    <span className="text-sm text-gray-600">Resultado:</span>
                  </div>
                  <span className={`font-bold ${rivalWin ? 'text-green-600' : 'text-red-600'}`}>
                    {rivalWin ? 'Ganó' : isTie ? 'Empate' : 'Perdió'}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Timer className="text-blue-500" size={20} />
                    <span className="text-sm text-gray-600">Tiempo:</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {formatTime(rivalTime)}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="text-orange-500" size={20} />
                    <span className="text-sm text-gray-600">Pares:</span>
                  </div>
                  <span className="font-bold text-gray-800">{rivalScore}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={24} />
            Volver al Menú
          </button>
        </div>
      </div>
    </div>
  );
};
