import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Star, RotateCcw } from 'lucide-react';
import { GameCore } from './GameCore';
import { supabase, getOrCreateClientId } from '../lib/supabase';
import { soundManager } from '../lib/sound';

interface ChallengeSceneProps {
  onBackToMenu: () => void;
}

const ALL_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

function getRandomLevels(count: number): number[] {
  const shuffled = [...ALL_LEVELS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const ChallengeScene = ({ onBackToMenu }: ChallengeSceneProps) => {
  const [challengeLevels, setChallengeLevels] = useState<number[]>(() => getRandomLevels(5));
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    soundManager.stopStartMusic();
    loadChallengeProgress();
  }, [challengeLevels]);

  const loadChallengeProgress = async () => {
    try {
      const clientId = getOrCreateClientId();

      const { data, error } = await supabase
        .from('scores')
        .select('level_id, score')
        .eq('client_id', clientId)
        .in('level_id', challengeLevels);

      if (!error && data) {
        const completed = new Set<number>();
        const scoreMap: Record<number, number> = {};

        data.forEach(record => {
          if (record.level_id) {
            completed.add(record.level_id);
            scoreMap[record.level_id] = record.score || 0;
          }
        });

        setCompletedChallenges(completed);
        setScores(scoreMap);
      }
    } catch (err) {
      console.error('Error loading challenge progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChallenge = (index: number) => {
    setCurrentChallengeIndex(index);
    setIsPlaying(true);
  };

  const handleChallengeComplete = async () => {
    await loadChallengeProgress();
    setIsPlaying(false);
  };

  const handleBackFromChallenge = async () => {
    await loadChallengeProgress();
    setIsPlaying(false);
  };

  const handleResetChallenges = () => {
    const newLevels = getRandomLevels(5);
    setChallengeLevels(newLevels);
    setCompletedChallenges(new Set());
    setScores({});
    setLoading(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Cargando desafíos...</div>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <GameCore
        key={`challenge-${challengeLevels[currentChallengeIndex]}-${Date.now()}`}
        level={challengeLevels[currentChallengeIndex]}
        isDailyChallenge={true}
        onComplete={handleChallengeComplete}
        onBackToMenu={handleBackFromChallenge}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Desafíos Diarios</h2>
              <p className="text-sm text-gray-600">5 desafíos aleatorios</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleResetChallenges}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                <RotateCcw size={18} />
                Nuevos
              </button>
              <button
                onClick={onBackToMenu}
                className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft size={18} />
                Volver
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-600" size={32} />
              <div>
                <div className="text-lg font-bold text-gray-800">
                  {completedChallenges.size} / {challengeLevels.length}
                </div>
                <div className="text-xs text-gray-600">Desafíos completados</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {challengeLevels.map((levelId, index) => {
            const isCompleted = completedChallenges.has(levelId);
            const score = scores[levelId] || 0;
            const isLocked = index > 0 && !completedChallenges.has(challengeLevels[index - 1]);

            return (
              <div
                key={`${levelId}-${index}`}
                className={`bg-white rounded-2xl shadow-lg p-6 transition-all ${
                  isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl cursor-pointer'
                }`}
                onClick={() => !isLocked && handleSelectChallenge(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                      isCompleted
                        ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                        : isLocked
                        ? 'bg-gray-300 text-gray-500'
                        : 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                    }`}>
                      {isLocked ? '🔒' : isCompleted ? '✓' : index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Desafío {index + 1} - Nivel {levelId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {isLocked ? 'Completa el desafío anterior' : isCompleted ? `Puntuación: ${score}` : 'Sin completar'}
                      </p>
                    </div>
                  </div>
                  {isCompleted && (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="text-yellow-500 fill-yellow-500" size={16} />
                        <Star className="text-yellow-500 fill-yellow-500" size={16} />
                        <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectChallenge(index);
                        }}
                        className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Volver a jugar
                      </button>
                    </div>
                  )}
                  {!isLocked && !isCompleted && (
                    <button className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition-all">
                      Jugar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
