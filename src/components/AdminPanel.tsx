import { useState, useEffect } from 'react';
import { X, Lock, Unlock, Send, Bell } from 'lucide-react';
import { supabase, getOrCreateClientId } from '../lib/supabase';
import { unlockWorld, getUnlockedWorlds } from '../lib/worldProgress';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unlockedWorlds, setUnlockedWorlds] = useState<number[]>([]);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState<'worlds' | 'push'>('worlds');

  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushUrl, setPushUrl] = useState('https://twinclash.org/');
  const [pushAdminKey, setPushAdminKey] = useState('');
  const [pushLoading, setPushLoading] = useState(false);
  const [pushResult, setPushResult] = useState<any>(null);
  const [pushError, setPushError] = useState<string | null>(null);

  const ADMIN_PASSWORD = 'admin2024';

  useEffect(() => {
    const savedKey = localStorage.getItem('push_admin_key');
    if (savedKey) {
      setPushAdminKey(savedKey);
    }
  }, []);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const clientId = getOrCreateClientId();
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('client_id', clientId)
        .maybeSingle();

      if (!error && data?.is_admin) {
        setIsAdmin(true);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnlockedWorlds = async () => {
    const worlds = await getUnlockedWorlds();
    setUnlockedWorlds(worlds);
  };

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setShowPasswordPrompt(false);
      loadUnlockedWorlds();
      setPasswordError('');
    } else {
      setPasswordError('Contraseña incorrecta');
      setPassword('');
    }
  };

  const handleToggleWorld = async (worldId: number) => {
    const isUnlocked = unlockedWorlds.includes(worldId);

    if (isUnlocked) {
      await lockWorld(worldId);
    } else {
      await unlockWorld(worldId);
    }

    await loadUnlockedWorlds();
  };

  const lockWorld = async (worldNum: number) => {
    const clientId = getOrCreateClientId();
    await supabase
      .from('world_progress')
      .delete()
      .eq('client_id', clientId)
      .eq('world_id', `world-${worldNum}`);
  };

  const handleUnlockAll = async () => {
    for (let i = 1; i <= 10; i++) {
      await unlockWorld(i);
    }
    await loadUnlockedWorlds();
  };

  const handleLockAll = async () => {
    const clientId = getOrCreateClientId();
    await supabase
      .from('world_progress')
      .delete()
      .eq('client_id', clientId);

    await unlockWorld(1);
    await loadUnlockedWorlds();
  };

  const handleSendPush = async () => {
    if (!pushTitle.trim() || !pushBody.trim() || !pushAdminKey.trim()) {
      setPushError('Title, body, and admin key are required');
      return;
    }

    setPushLoading(true);
    setPushError(null);
    setPushResult(null);

    try {
      localStorage.setItem('push_admin_key', pushAdminKey);

      const response = await fetch('/.netlify/functions/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': pushAdminKey
        },
        body: JSON.stringify({ title: pushTitle, body: pushBody, url: pushUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send notifications');
      }

      setPushResult(data);
      setPushTitle('');
      setPushBody('');
      setPushUrl('https://twinclash.org/');
    } catch (err: any) {
      setPushError(err.message || 'Failed to send notifications');
    } finally {
      setPushLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
          <div className="text-center">Verificando permisos...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Acceso Denegado</h3>
            <p className="text-sm text-gray-600 mb-4">
              No tienes permisos de administrador
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showPasswordPrompt) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Contraseña Admin</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-sm text-yellow-800">
              🔐 Ingresa la contraseña de administrador para acceder al panel
            </p>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            placeholder="Contraseña"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            autoFocus
          />

          {passwordError && (
            <p className="text-sm text-red-600 mb-4">{passwordError}</p>
          )}

          <button
            onClick={handlePasswordSubmit}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Acceder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Panel Admin</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('worlds')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'worlds'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Mundos
          </button>
          <button
            onClick={() => setActiveTab('push')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'push'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Bell size={16} />
            Push
          </button>
        </div>

        {activeTab === 'worlds' && (
          <>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-4">
              <div className="text-sm font-semibold text-purple-800 mb-2">
                Gestionar Mundos
              </div>
              <p className="text-xs text-purple-600">
                Toca un mundo para bloquearlo/desbloquearlo
              </p>
            </div>

            <div className="space-y-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((worldId) => {
                const isUnlocked = unlockedWorlds.includes(worldId);
                return (
                  <button
                    key={worldId}
                    onClick={() => handleToggleWorld(worldId)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl font-semibold transition-all ${
                      isUnlocked
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    <span>Mundo {worldId}</span>
                    {isUnlocked ? (
                      <Unlock size={18} className="text-green-600" />
                    ) : (
                      <Lock size={18} className="text-red-600" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleUnlockAll}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Desbloquear Todos
              </button>
              <button
                onClick={handleLockAll}
                className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Bloquear Todos
              </button>
            </div>
          </>
        )}

        {activeTab === 'push' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-4">
              <div className="text-sm font-semibold text-blue-800 mb-2">
                Enviar Notificaciones Push
              </div>
              <p className="text-xs text-blue-600">
                Envía notificaciones a todos los usuarios registrados
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Key
              </label>
              <input
                type="password"
                value={pushAdminKey}
                onChange={(e) => setPushAdminKey(e.target.value)}
                placeholder="Enter admin key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                value={pushTitle}
                onChange={(e) => setPushTitle(e.target.value)}
                placeholder="Notification title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <textarea
                value={pushBody}
                onChange={(e) => setPushBody(e.target.value)}
                placeholder="Notification message"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                value={pushUrl}
                onChange={(e) => setPushUrl(e.target.value)}
                placeholder="https://twinclash.org/"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSendPush}
              disabled={pushLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg"
            >
              <Send className="w-4 h-4" />
              {pushLoading ? 'Enviando...' : 'Enviar a Todos'}
            </button>

            {pushError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                {pushError}
              </div>
            )}

            {pushResult && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800">
                <div className="font-semibold mb-1">¡Enviado Exitosamente!</div>
                <div>Enviados: {pushResult.sent}</div>
                <div>Fallidos: {pushResult.failed}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
