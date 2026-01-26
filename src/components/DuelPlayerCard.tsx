import { AvatarView } from './AvatarView';
import { AvatarConfig } from '../types';
import { Crown, Swords } from 'lucide-react';

interface DuelPlayerCardProps {
  displayName: string;
  avatarConfig: AvatarConfig | null;
  isHost?: boolean;
  isCurrentPlayer?: boolean;
  score?: number;
  status?: 'waiting' | 'playing' | 'finished';
}

export const DuelPlayerCard = ({
  displayName,
  avatarConfig,
  isHost = false,
  isCurrentPlayer = false,
  score,
  status = 'waiting',
}: DuelPlayerCardProps) => {
  return (
    <div
      className={`relative bg-gradient-to-br rounded-2xl p-6 shadow-2xl transform transition-all duration-300 ${
        isCurrentPlayer
          ? 'from-yellow-500 via-orange-500 to-red-500 scale-105'
          : 'from-blue-500 via-purple-500 to-pink-500'
      } ${status === 'playing' ? 'animate-pulse' : ''}`}
    >
      {isHost && (
        <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full p-2 shadow-lg">
          <Crown size={20} className="text-yellow-900" />
        </div>
      )}

      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <div className="bg-white rounded-full p-3 shadow-xl">
            <AvatarView config={avatarConfig} size="large" />
          </div>
          {status === 'playing' && (
            <div className="absolute -bottom-2 -right-2 bg-green-400 rounded-full p-2 animate-bounce">
              <Swords size={16} className="text-white" />
            </div>
          )}
        </div>

        <h3 className="text-2xl font-bold text-white text-center mb-2 drop-shadow-lg">
          {displayName}
        </h3>

        {isCurrentPlayer && (
          <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full mb-2">
            <span className="text-white text-sm font-semibold">TÚ</span>
          </div>
        )}

        {score !== undefined && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 mt-2">
            <div className="text-white/80 text-xs text-center mb-1">Puntuación</div>
            <div className="text-white text-2xl font-bold text-center">
              {score.toLocaleString()}
            </div>
          </div>
        )}

        {status === 'waiting' && (
          <div className="mt-3 text-white/70 text-sm text-center">
            Esperando...
          </div>
        )}
      </div>
    </div>
  );
};
