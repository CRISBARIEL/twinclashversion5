import { useState, useEffect } from 'react';
import { Swords } from 'lucide-react';
import { loadFromSupabase, getCurrentLevel } from '../lib/progression';
import { SoundGear } from './SoundGear';
import { soundManager } from '../lib/sound';

interface SimpleInitialScreenProps {
  onStartLevel1: () => void;
  onContinueLevel: (level: number) => void;
  onStartDuel: () => void;
}

export const SimpleInitialScreen = ({ onStartLevel1, onContinueLevel, onStartDuel }: SimpleInitialScreenProps) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromSupabase().then(() => {
      const level = getCurrentLevel();
      setCurrentLevel(level);
      setLoading(false);
      soundManager.playStartMusic();
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-bold">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50 bg-white rounded-full shadow-lg">
        <SoundGear />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-visible z-0">
        <div className="absolute top-4 left-4 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform rotate-12">
          <span className="text-7xl">🍃</span>
        </div>
        <div className="absolute top-16 left-20 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform -rotate-6">
          <span className="text-7xl">🍃</span>
        </div>

        <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform -rotate-12">
          <span className="text-7xl">🐱</span>
        </div>
        <div className="absolute top-16 right-20 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform rotate-6">
          <span className="text-7xl">🐱</span>
        </div>

        <div className="absolute bottom-4 right-4 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform rotate-12">
          <span className="text-7xl">🚀</span>
        </div>
        <div className="absolute bottom-16 right-20 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform -rotate-6">
          <span className="text-7xl">🚀</span>
        </div>

        <div className="absolute bottom-4 left-4 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform -rotate-12">
          <span className="text-7xl">🐬</span>
        </div>
        <div className="absolute bottom-16 left-20 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform rotate-6">
          <span className="text-7xl">🐬</span>
        </div>

        <div className="absolute top-1/3 left-2 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform rotate-12">
          <span className="text-7xl">🍕</span>
        </div>
        <div className="absolute top-1/2 left-10 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform -rotate-6">
          <span className="text-7xl">🍕</span>
        </div>

        <div className="absolute top-1/3 right-2 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform rotate-6">
          <span className="text-7xl">🎵</span>
        </div>
        <div className="absolute top-1/2 right-10 bg-white/15 backdrop-blur-sm rounded-xl p-6 shadow-xl transform -rotate-12">
          <span className="text-7xl">🎵</span>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10">
        <div className="flex justify-center mb-6">
          <img
            src="/chatgpt_image_15_dic_2025,_11_02_21.png"
            alt="Twin Clash"
            style={{ width: '75%', maxWidth: '420px', margin: '0 auto', opacity: 0.5 }}
          />
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={onStartLevel1}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-5 rounded-xl font-bold text-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            JUGAR
          </button>

          {currentLevel > 1 && (
            <button
              type="button"
              onClick={() => onContinueLevel(currentLevel)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              NIVEL {currentLevel}
            </button>
          )}

          <button
            type="button"
            onClick={onStartDuel}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <Swords size={24} />
            <span>DUELO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
