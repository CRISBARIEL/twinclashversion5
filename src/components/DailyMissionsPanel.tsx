import { useState, useEffect } from 'react';
import { Target, X, CheckCircle2, Circle } from 'lucide-react';
import { getDailyMissions, claimMission, DailyMission } from '../lib/progressionService';
import { getOrCreateClientId } from '../lib/supabase';

interface DailyMissionsPanelProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const DailyMissionsPanel = ({ forceOpen = false, onClose }: DailyMissionsPanelProps = {}) => {
  const [showModal, setShowModal] = useState(false);
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showModal || forceOpen) {
      loadMissions();
    }
  }, [showModal, forceOpen]);

  const loadMissions = async () => {
    setLoading(true);
    const clientId = getOrCreateClientId();

    const dailyMissions = await getDailyMissions(clientId);
    setMissions(dailyMissions);
    setLoading(false);
  };

  const handleClaim = async (missionId: string) => {
    const result = await claimMission(missionId);
    if (result.coins > 0 || result.boosts > 0) {
      await loadMissions();
    }
  };

  const completedCount = missions.filter(m => m.claimed).length;
  const canClaimCount = missions.filter(m => !m.claimed && m.progress >= m.target).length;

  const getMissionTitle = (type: string) => {
    switch (type) {
      case 'complete_levels':
        return 'Completar niveles';
      case 'earn_stars':
        return 'Ganar estrellas';
      case 'perfect_levels':
        return 'Niveles perfectos';
      default:
        return type;
    }
  };

  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'complete_levels':
        return '🎯';
      case 'earn_stars':
        return '⭐';
      case 'perfect_levels':
        return '🏆';
      default:
        return '📋';
    }
  };

  const handleClose = () => {
    setShowModal(false);
    if (onClose) onClose();
  };

  if (!showModal && !forceOpen) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className="fixed top-20 right-4 z-40 bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <Target size={24} />
        {canClaimCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {canClaimCount}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className={forceOpen ? '' : 'fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50'}>
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-3xl font-black text-blue-800 mb-2">
            Misiones Diarias
          </h2>
          <p className="text-gray-600">
            Completadas: {completedCount}/3
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-gray-600">Cargando misiones...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {missions.map((mission) => {
              const isComplete = mission.progress >= mission.target;
              const isClaimed = mission.claimed;
              const progressPercent = Math.min((mission.progress / mission.target) * 100, 100);

              return (
                <div
                  key={mission.id}
                  className={`
                    bg-white rounded-xl p-4 shadow-md transition-all
                    ${isClaimed ? 'opacity-60' : ''}
                    ${isComplete && !isClaimed ? 'ring-2 ring-green-500' : ''}
                  `}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{getMissionIcon(mission.missionType)}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">
                        {getMissionTitle(mission.missionType)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {isClaimed ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 size={16} />
                            Completada
                          </span>
                        ) : (
                          <span>
                            {mission.progress}/{mission.target}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isClaimed && (
                    <div className="bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-sm">
                      {mission.rewardCoins > 0 && (
                        <span className="text-yellow-600 font-semibold">
                          💰 {mission.rewardCoins}
                        </span>
                      )}
                      {mission.rewardBoosts > 0 && (
                        <span className="text-blue-600 font-semibold">
                          🚀 {mission.rewardBoosts}
                        </span>
                      )}
                    </div>

                    {isComplete && !isClaimed && (
                      <button
                        onClick={() => handleClaim(mission.id)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all"
                      >
                        Reclamar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          Las misiones se renuevan cada día
        </div>
      </div>
    </div>
  );
};
