import { useState } from 'react';
import { ArrowLeft, Sword, Copy, Check, ChevronDown } from 'lucide-react';
import { createDuelRoom, DuelRoom } from '../../lib/duelApi';
import { getLevelConfig } from '../../lib/levels';

interface DuelCreateProps {
  onBack: () => void;
  onRoomCreated: (room: DuelRoom) => void;
  clientId: string;
}

export const DuelCreate = ({ onBack, onRoomCreated, clientId }: DuelCreateProps) => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [expandedWorld, setExpandedWorld] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRoom, setCreatedRoom] = useState<DuelRoom | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateDuel = async () => {
    if (selectedLevel === null) return;

    setCreating(true);
    setError(null);

    try {
      const room = await createDuelRoom(clientId, selectedLevel);
      setCreatedRoom(room);
      onRoomCreated(room);
    } catch (err: any) {
      let errorMsg = 'Error al crear el duelo. Intenta de nuevo.';

      if (err.message === 'FAILED_TO_CREATE_ROOM') {
        errorMsg = 'Error al crear el duelo. Verifica tu conexión.';
      } else if (err.message === 'FAILED_TO_GENERATE_CODE') {
        errorMsg = 'No se pudo generar un código único. Intenta de nuevo.';
      } else if (err.message) {
        errorMsg = `Error: ${err.message}`;
      }

      setError(errorMsg);
      console.error('[DuelCreate] Error:', err.message || err);
    } finally {
      setCreating(false);
    }
  };

  const handleCopyCode = () => {
    if (createdRoom) {
      navigator.clipboard.writeText(createdRoom.room_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const levels = [
    { world: 1, levels: Array.from({ length: 20 }, (_, i) => i + 1) },
    { world: 2, levels: Array.from({ length: 20 }, (_, i) => i + 21) },
    { world: 3, levels: Array.from({ length: 20 }, (_, i) => i + 41) },
    { world: 4, levels: Array.from({ length: 20 }, (_, i) => i + 61) },
    { world: 5, levels: Array.from({ length: 20 }, (_, i) => i + 81) },
  ];

  if (createdRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-4">
                <Sword className="text-white" size={40} />
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">¡Sala Creada!</h2>
              <p className="text-gray-600">Comparte este código con tu rival</p>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Código del Duelo</p>
                <div className="text-5xl font-black text-purple-600 tracking-wider mb-4">
                  {createdRoom.room_code}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-xl font-bold text-purple-600 hover:bg-purple-50 transition-colors shadow-md"
                >
                  {copied ? (
                    <>
                      <Check size={20} />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy size={20} />
                      Copiar Código
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Nivel:</span>
                <span className="font-bold text-gray-800">Nivel {createdRoom.level}</span>
              </div>
            </div>

            <div className="text-center">
              <div className="animate-pulse text-purple-600 font-bold mb-2">
                Esperando rival...
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toggleWorld = (world: number) => {
    setExpandedWorld(expandedWorld === world ? null : world);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-white font-bold hover:text-purple-200 transition-colors"
        >
          <ArrowLeft size={24} />
          Volver
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-gray-800 mb-2">Crear Duelo</h2>
            <p className="text-gray-600">Selecciona un mundo y luego un nivel</p>
          </div>

          <div className="space-y-3 mb-6">
            {levels.map(({ world, levels: worldLevels }) => (
              <div key={world} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleWorld(world)}
                  className={`
                    w-full px-6 py-4 flex items-center justify-between font-bold text-lg transition-all
                    ${expandedWorld === world
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                    }
                  `}
                >
                  <span>Mundo {world}</span>
                  <ChevronDown
                    className={`transition-transform ${expandedWorld === world ? 'rotate-180' : ''}`}
                    size={24}
                  />
                </button>

                {expandedWorld === world && (
                  <div className="p-4 bg-gray-50">
                    <div className="grid grid-cols-5 gap-2">
                      {worldLevels.map((level) => (
                        <button
                          key={level}
                          onClick={() => setSelectedLevel(level)}
                          className={`
                            aspect-square rounded-xl font-bold text-lg transition-all
                            ${selectedLevel === level
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                              : 'bg-white text-gray-700 hover:bg-purple-50 border-2 border-gray-200'
                            }
                          `}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedLevel !== null && (
            <div className="mb-4 p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-1">Nivel Seleccionado</p>
              <p className="text-3xl font-black text-purple-600">{selectedLevel}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-xl">
              <p className="text-red-600 font-bold text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleCreateDuel}
            disabled={selectedLevel === null || creating}
            className={`
              w-full py-5 rounded-xl font-bold text-xl transition-all
              ${selectedLevel !== null && !creating
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {creating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Creando Sala...
              </span>
            ) : selectedLevel !== null ? (
              `🎮 Crear Duelo - Nivel ${selectedLevel}`
            ) : (
              'Selecciona un Mundo y Nivel'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
