import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Star, Medal } from 'lucide-react';
import { AvatarView } from './AvatarView';
import { LeaderboardEntry, AvatarConfig } from '../types';
import { supabase, getOrCreateClientId } from '../lib/supabase';

interface DailyLeaderboardProps {
  onBack: () => void;
}

const DEFAULT_AVATAR: AvatarConfig = {
  faceColor: '#FFD1A0',
  eyesId: 0,
  mouthId: 0,
  hairId: 0,
  accessoryId: null,
};

export const DailyLeaderboard = ({ onBack }: DailyLeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlayerId, setCurrentPlayerId] = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const clientId = getOrCreateClientId();
      setCurrentPlayerId(clientId);

      const { data: scoresData, error: scoresError } = await supabase
        .from('scores')
        .select('client_id, score, level_id')
        .order('score', { ascending: false });

      if (scoresError) throw scoresError;

      const playerStats: Record<string, { totalScore: number; levelsCompleted: number }> = {};

      scoresData?.forEach((record) => {
        if (!playerStats[record.client_id]) {
          playerStats[record.client_id] = { totalScore: 0, levelsCompleted: 0 };
        }
        playerStats[record.client_id].totalScore += record.score || 0;
        playerStats[record.client_id].levelsCompleted += 1;
      });

      const clientIds = Object.keys(playerStats);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('client_id, display_name, avatar_config')
        .in('client_id', clientIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(
        profilesData?.map((p) => [p.client_id, p]) || []
      );

      const leaderboardEntries: LeaderboardEntry[] = clientIds.map((id) => {
        const stats = playerStats[id];
        const profile = profilesMap.get(id);

        return {
          clientId: id,
          displayName: profile?.display_name || `Jugador ${id.slice(0, 6)}`,
          avatarConfig: profile?.avatar_config || DEFAULT_AVATAR,
          score: stats.totalScore,
          levelsCompleted: stats.levelsCompleted,
          rank: 0,
          isCurrentPlayer: id === clientId,
        };
      });

      leaderboardEntries.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.levelsCompleted - a.levelsCompleted;
      });

      leaderboardEntries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      setEntries(leaderboardEntries.slice(0, 50));
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="text-yellow-400" size={24} />;
    if (rank === 2) return <Medal className="text-gray-300" size={24} />;
    if (rank === 3) return <Medal className="text-orange-400" size={24} />;
    return <span className="text-white font-bold text-lg">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    return 'bg-gradient-to-r from-blue-500 to-blue-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando clasificación...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="text-lg font-semibold">Volver</span>
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Trophy size={32} className="text-yellow-400" />
            Clasificación
          </h1>
          <div className="w-24"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
          {entries.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy size={64} className="mx-auto text-white/30 mb-4" />
              <p className="text-white/70 text-lg">
                Aún no hay jugadores en la clasificación
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {entries.map((entry) => (
                <div
                  key={entry.clientId}
                  className={`p-4 flex items-center gap-4 transition-all ${
                    entry.isCurrentPlayer
                      ? 'bg-yellow-500/20 border-l-4 border-yellow-400'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full ${getRankBadgeColor(entry.rank)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    {getRankIcon(entry.rank)}
                  </div>

                  <div className="bg-white rounded-full p-1 flex-shrink-0 shadow-md">
                    <AvatarView config={entry.avatarConfig} size="medium" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold truncate ${
                        entry.isCurrentPlayer ? 'text-yellow-300 text-lg' : 'text-white'
                      }`}>
                        {entry.displayName}
                      </h3>
                      {entry.isCurrentPlayer && (
                        <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full font-semibold">
                          TÚ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 text-yellow-300">
                        <Star size={14} fill="currentColor" />
                        <span className="font-semibold">{entry.score.toLocaleString()}</span>
                      </div>
                      <div className="text-white/60">
                        {entry.levelsCompleted} niveles
                      </div>
                    </div>

                    <div className="mt-2 bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((entry.levelsCompleted / 25) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-white">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/50">puntos</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-white/60 text-sm">
          Mejora tu puntuación completando más niveles del Reto Diario
        </div>
      </div>
    </div>
  );
};
