import { useState, useEffect } from 'react';
import { X, Lock } from 'lucide-react';
import { getWorldState } from '../lib/worldProgress';

interface DuelInvitePanelProps {
  onClose: () => void;
  onCreateRoom: (worldId: number, levelNumber: number) => void;
  onJoinRoom: (roomCode: string) => void;
}

export const DuelInvitePanel = ({ onClose, onCreateRoom, onJoinRoom }: DuelInvitePanelProps) => {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [selectedWorld, setSelectedWorld] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState<boolean[]>([]);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (mode === 'create') {
      loadUnlockedLevels();
    }
  }, [mode, selectedWorld]);

  const loadUnlockedLevels = async () => {
    const worldId = `world-${selectedWorld}`;
    const state = await getWorldState(worldId);
    const unlocked = state.levels.map(l => l.unlocked);
    setUnlockedLevels(unlocked);

    const firstUnlocked = unlocked.findIndex(u => u);
    if (firstUnlocked !== -1 && !unlocked[selectedLevel - 1]) {
      setSelectedLevel(firstUnlocked + 1);
    }
  };

  const handleCreateRoom = () => {
    onCreateRoom(selectedWorld, selectedLevel);
    onClose();
  };

  const handleJoinRoom = () => {
    if (joinCode.trim().length === 6) {
      onJoinRoom(joinCode.toUpperCase());
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      style={{ fontFamily: 'system-ui' }}
    >
      <div className="bg-gray-900 text-white rounded-2xl p-6 w-full max-w-lg">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold m-0">
            {mode === 'menu' && '🎮 Duelo'}
            {mode === 'create' && '🎯 Crear Sala'}
            {mode === 'join' && '🔑 Unirse a Sala'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {mode === 'menu' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
            >
              🎯 Crear Sala
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
            >
              🔑 Unirse con Código
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Selecciona el Mundo:</label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((world) => (
                  <button
                    key={world}
                    onClick={() => {
                      setSelectedWorld(world);
                      setSelectedLevel(1);
                    }}
                    className={`py-3 rounded-lg font-bold transition-all ${
                      selectedWorld === world
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white scale-110'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {world}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Selecciona el Nivel:</label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((level) => {
                  const isUnlocked = unlockedLevels[level - 1];
                  return (
                    <button
                      key={level}
                      onClick={() => isUnlocked && setSelectedLevel(level)}
                      disabled={!isUnlocked}
                      className={`py-3 rounded-lg font-bold transition-all relative ${
                        selectedLevel === level && isUnlocked
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-110'
                          : isUnlocked
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {isUnlocked ? level : <Lock size={16} className="mx-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-3 text-sm">
              <p className="opacity-80">
                🎯 Mundo {selectedWorld} - Nivel {selectedLevel}
              </p>
              <p className="opacity-80">
                💰 Recompensa: <span className="font-bold text-yellow-400">{20 + (selectedWorld - 1) * 13} monedas</span>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMode('menu')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-all"
              >
                Atrás
              </button>
              <button
                onClick={handleCreateRoom}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Crear Sala
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Código de la Sala:</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ABC123"
                maxLength={6}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-gray-800 rounded-lg p-3 text-sm opacity-80">
              💡 Ingresa el código de 6 caracteres que te compartió tu rival
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMode('menu')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-all"
              >
                Atrás
              </button>
              <button
                onClick={handleJoinRoom}
                disabled={joinCode.length !== 6}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Unirse
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
