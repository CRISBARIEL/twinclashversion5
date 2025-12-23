import { useEffect } from 'react';
import { getDifficultyLabel, getDifficultyColor } from '../lib/levels';

interface DifficultyOverlayProps {
  difficulty?: 'very_easy' | 'easy' | 'hard' | 'very_hard' | 'expert';
  levelNumber: number;
  onComplete: () => void;
  duration?: number;
}

export const DifficultyOverlay = ({ difficulty, levelNumber, onComplete, duration = 2500 }: DifficultyOverlayProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  if (!difficulty) return null;

  const difficultyLabel = getDifficultyLabel(difficulty);
  const baseColorClass = getDifficultyColor(difficulty);

  const bgGradient = {
    very_easy: 'from-green-500 to-emerald-600',
    easy: 'from-blue-500 to-cyan-600',
    hard: 'from-yellow-500 to-orange-500',
    very_hard: 'from-orange-500 to-red-500',
    expert: 'from-red-600 to-rose-700'
  }[difficulty] || 'from-gray-500 to-gray-600';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in cursor-pointer"
      onClick={onComplete}
    >
      <div className="text-center animate-scale-pulse">
        <div className={`bg-gradient-to-br ${bgGradient} text-white rounded-3xl px-12 py-8 shadow-2xl`}>
          <div className="text-5xl font-black mb-4">
            Nivel {levelNumber}
          </div>
          <div className="text-3xl font-bold uppercase tracking-wider">
            {difficultyLabel}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-pulse {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-pulse {
          animation: scale-pulse 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};
