import { useState } from 'react';
import { Sword, Plus, LogIn, ArrowLeft } from 'lucide-react';
import { DuelCreate } from './DuelCreate';
import { DuelJoin } from './DuelJoin';
import { DuelLobby } from './DuelLobby';
import { DuelRoom } from '../../lib/duelApi';

interface DuelMenuProps {
  onBack: () => void;
  clientId: string;
}

type DuelScreen = 'menu' | 'create' | 'join' | 'lobby';

export const DuelMenu = ({ onBack, clientId }: DuelMenuProps) => {
  const [screen, setScreen] = useState<DuelScreen>('menu');
  const [currentRoom, setCurrentRoom] = useState<DuelRoom | null>(null);
  const [role, setRole] = useState<'host' | 'guest'>('host');

  const handleRoomCreated = (room: DuelRoom) => {
    setCurrentRoom(room);
    setRole('host');
    setScreen('lobby');
  };

  const handleRoomJoined = (room: DuelRoom) => {
    setCurrentRoom(room);
    setRole('guest');
    setScreen('lobby');
  };

  const handleBackToMenu = () => {
    setScreen('menu');
    setCurrentRoom(null);
  };

  if (screen === 'lobby' && currentRoom) {
    return (
      <DuelLobby
        room={currentRoom}
        role={role}
        clientId={clientId}
        onBack={handleBackToMenu}
      />
    );
  }

  if (screen === 'create') {
    return (
      <DuelCreate
        onBack={handleBackToMenu}
        onRoomCreated={handleRoomCreated}
        clientId={clientId}
      />
    );
  }

  if (screen === 'join') {
    return (
      <DuelJoin
        onBack={handleBackToMenu}
        onRoomJoined={handleRoomJoined}
        clientId={clientId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-4">
      <div className="max-w-md mx-auto pt-8">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-white font-bold hover:text-purple-200 transition-colors"
        >
          <ArrowLeft size={24} />
          Volver al Menú Principal
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mb-4">
              <Sword className="text-white" size={48} />
            </div>
            <h1 className="text-4xl font-black text-gray-800 mb-2">Modo Duelo</h1>
            <p className="text-lg text-gray-600">
              Desafía a otros jugadores en tiempo real
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setScreen('create')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <Plus size={28} />
              Crear Duelo
            </button>

            <button
              onClick={() => setScreen('join')}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-6 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <LogIn size={28} />
              Unirse a Duelo
            </button>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <h3 className="font-black text-gray-800 mb-3">¿Cómo funciona?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">1.</span>
                <span>Crea una sala y comparte el código con tu rival</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">2.</span>
                <span>Ambos juegan el mismo nivel con las mismas cartas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">3.</span>
                <span>¡El más rápido en completar el nivel gana!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
