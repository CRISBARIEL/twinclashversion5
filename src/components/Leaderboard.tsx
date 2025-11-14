import { useState, useEffect } from 'react';
import { X, Trophy, Clock, Move, Users, Sparkles } from 'lucide-react';
import { getTop, getCrewTop, ScoreEntry, getCrewIdFromURL } from '../lib/api';
import { getOrCreateClientId } from '../lib/supabase';

interface LeaderboardProps {
  seed: string;
  onClose: () => void;
  onPlayNow?: () => void;
}

export const Leaderboard = ({ seed, onClose, onPlayNow }: LeaderboardProps) => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [crewScores, setCrewScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCrew, setShowCrew] = useState(false);
  const clientId = getOrCreateClientId();
  const crewId = getCrewIdFromURL();

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      const data = await getTop({ seed, limit: 20 });
      setScores(data);

      if (crewId) {
        const crewData = await getCrewTop({ seed, crewId, limit: 20 });
        setCrewScores(crewData);
      }

      setLoading(false);
    };

    fetchScores();
  }, [seed, crewId]);

  const displayScores = showCrew && crewId ? crewScores : scores;
  const hasHumanScores = scores.some((s) => !s.is_bot);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={28} />
            {showCrew ? 'Top Amigos' : 'Top Diario'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="text-xs text-gray-500 mb-4">
          Reto: {seed}
        </div>

        {crewId && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowCrew(false)}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
                !showCrew
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Trophy size={16} className="inline mr-1" />
              Global
            </button>
            <button
              onClick={() => setShowCrew(true)}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
                showCrew
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users size={16} className="inline mr-1" />
              Amigos
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500">Cargando...</div>
          </div>
        ) : displayScores.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-6">
              <Trophy size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {showCrew ? 'Sin marcas de amigos' : `Sin marcas para hoy`}
              </h3>
              <p className="text-gray-600 mb-4">
                {showCrew
                  ? 'Comparte el enlace con tu crew para competir juntos'
                  : '¡Sé el primero y desbloquea la medalla Pionero! (+20 monedas)'}
              </p>
              {onPlayNow && !showCrew && (
                <button
                  onClick={() => {
                    onClose();
                    onPlayNow();
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Jugar ahora
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {!hasHumanScores && !showCrew && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-sm">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <Sparkles size={16} />
                  <span className="font-semibold">Marcas de prueba</span>
                </div>
                <p className="text-blue-600 text-xs">
                  ¡Sé el primero en jugar hoy y gana +20 monedas con la medalla Pionero!
                </p>
              </div>
            )}

            <div className="space-y-2">
              {displayScores.map((score, index) => {
                const isCurrentUser = score.client_id === clientId;
                const isBot = score.is_bot;
                const position = index + 1;
                const medalColor =
                  position === 1
                    ? 'text-yellow-500'
                    : position === 2
                    ? 'text-gray-400'
                    : position === 3
                    ? 'text-amber-600'
                    : 'text-gray-400';

                return (
                  <div
                    key={score.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      isCurrentUser
                        ? 'bg-blue-50 border-2 border-blue-300'
                        : isBot
                        ? 'bg-gray-50 opacity-75'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className={`text-2xl font-bold ${medalColor} w-8 text-center`}>
                      {position <= 3 ? (
                        <Trophy size={24} className="inline" />
                      ) : (
                        position
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm mb-1">
                        {isBot && <span className="text-xs">🧪</span>}
                        {score.display_name && (
                          <span className="text-xs text-gray-600 font-medium">
                            {score.display_name}
                          </span>
                        )}
                        {isBot && (
                          <span className="text-xs text-gray-500">(Prueba)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-blue-500" />
                          <span className="font-semibold">{(score.time_ms / 1000).toFixed(1)}s</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Move size={14} className="text-purple-500" />
                          <span className="font-semibold">{score.moves}</span>
                        </div>
                      </div>
                      {isCurrentUser && (
                        <div className="text-xs text-blue-600 font-semibold mt-1">
                          ¡Tú!
                        </div>
                      )}
                    </div>

                    {!isBot && (
                      <div className="text-xs text-gray-400">
                        {new Date(score.created_at).toLocaleTimeString('es', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
