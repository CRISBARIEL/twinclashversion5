import { useState, useEffect } from 'react';
import { ArrowLeft, Save, RotateCcw, User } from 'lucide-react';
import { AvatarView } from './AvatarView';
import { AvatarConfig } from '../types';
import { supabase, getOrCreateClientId } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AvatarEditorProps {
  onBack: () => void;
}

const FACE_COLORS = [
  { name: 'Light', color: '#FFD1A0' },
  { name: 'Medium', color: '#D4A574' },
  { name: 'Tan', color: '#C68642' },
  { name: 'Brown', color: '#8D5524' },
  { name: 'Dark', color: '#5C4033' },
];

const DEFAULT_CONFIG: AvatarConfig = {
  faceColor: '#FFD1A0',
  eyesId: 0,
  mouthId: 0,
  hairId: 0,
  accessoryId: null,
};

export const AvatarEditor = ({ onBack }: AvatarEditorProps) => {
  const [displayName, setDisplayName] = useState('');
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialName, setInitialName] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const clientId = getOrCreateClientId();
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_config')
        .eq('client_id', clientId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDisplayName(data.display_name || '');
        setInitialName(data.display_name || '');
        if (data.avatar_config) {
          setAvatarConfig(data.avatar_config as AvatarConfig);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (displayName.trim().length < 3) {
      toast.error('El nombre debe tener al menos 3 caracteres');
      return;
    }
    if (displayName.trim().length > 16) {
      toast.error('El nombre debe tener máximo 16 caracteres');
      return;
    }

    setSaving(true);
    try {
      const clientId = getOrCreateClientId();

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('client_id')
        .eq('client_id', clientId)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: displayName.trim(),
            avatar_config: avatarConfig,
            updated_at: new Date().toISOString(),
          })
          .eq('client_id', clientId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert({
            client_id: clientId,
            display_name: displayName.trim(),
            avatar_config: avatarConfig,
            coins: 0,
            owned_skins: [],
          });

        if (error) throw error;
      }

      setInitialName(displayName.trim());
      toast.success('Perfil guardado exitosamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setAvatarConfig(DEFAULT_CONFIG);
    setDisplayName(initialName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="text-lg font-semibold">Volver</span>
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <User size={32} />
            Mi Avatar
          </h1>
          <div className="w-24"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white rounded-full p-4 mb-4 shadow-lg">
              <AvatarView config={avatarConfig} size="large" />
            </div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tu nombre (3-16 caracteres)"
              maxLength={16}
              className="text-center text-2xl font-bold bg-white/20 text-white placeholder-white/50 border-2 border-white/30 rounded-lg px-4 py-2 focus:outline-none focus:border-white/60 transition-colors"
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-3 text-lg">
                Color de piel
              </label>
              <div className="flex gap-3 justify-center flex-wrap">
                {FACE_COLORS.map((item) => (
                  <button
                    key={item.color}
                    onClick={() => setAvatarConfig({ ...avatarConfig, faceColor: item.color })}
                    className={`w-14 h-14 rounded-full border-4 transition-all transform hover:scale-110 ${
                      avatarConfig.faceColor === item.color
                        ? 'border-white shadow-lg scale-110'
                        : 'border-white/30'
                    }`}
                    style={{ backgroundColor: item.color }}
                    title={item.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-3 text-lg">
                Ojos
              </label>
              <div className="flex gap-3 justify-center flex-wrap">
                {[0, 1, 2, 3, 4].map((id) => (
                  <button
                    key={id}
                    onClick={() => setAvatarConfig({ ...avatarConfig, eyesId: id })}
                    className={`w-16 h-16 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
                      avatarConfig.eyesId === id
                        ? 'border-white shadow-lg scale-110 bg-white/30'
                        : 'border-white/30'
                    }`}
                  >
                    <AvatarView
                      config={{ ...DEFAULT_CONFIG, eyesId: id }}
                      size="small"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-3 text-lg">
                Boca
              </label>
              <div className="flex gap-3 justify-center flex-wrap">
                {[0, 1, 2, 3, 4].map((id) => (
                  <button
                    key={id}
                    onClick={() => setAvatarConfig({ ...avatarConfig, mouthId: id })}
                    className={`w-16 h-16 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
                      avatarConfig.mouthId === id
                        ? 'border-white shadow-lg scale-110 bg-white/30'
                        : 'border-white/30'
                    }`}
                  >
                    <AvatarView
                      config={{ ...DEFAULT_CONFIG, mouthId: id }}
                      size="small"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-3 text-lg">
                Cabello
              </label>
              <div className="flex gap-3 justify-center flex-wrap">
                {[0, 1, 2, 3, 4].map((id) => (
                  <button
                    key={id}
                    onClick={() => setAvatarConfig({ ...avatarConfig, hairId: id })}
                    className={`w-16 h-16 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
                      avatarConfig.hairId === id
                        ? 'border-white shadow-lg scale-110 bg-white/30'
                        : 'border-white/30'
                    }`}
                  >
                    <AvatarView
                      config={{ ...DEFAULT_CONFIG, hairId: id }}
                      size="small"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-3 text-lg">
                Accesorio
              </label>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => setAvatarConfig({ ...avatarConfig, accessoryId: null })}
                  className={`w-16 h-16 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
                    avatarConfig.accessoryId === null
                      ? 'border-white shadow-lg scale-110 bg-white/30'
                      : 'border-white/30'
                  }`}
                >
                  <span className="text-white text-xs">Ninguno</span>
                </button>
                {[0, 1, 2].map((id) => (
                  <button
                    key={id}
                    onClick={() => setAvatarConfig({ ...avatarConfig, accessoryId: id })}
                    className={`w-16 h-16 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
                      avatarConfig.accessoryId === id
                        ? 'border-white shadow-lg scale-110 bg-white/30'
                        : 'border-white/30'
                    }`}
                  >
                    <AvatarView
                      config={{ ...DEFAULT_CONFIG, accessoryId: id }}
                      size="small"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleReset}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              Restablecer
            </button>
            <button
              onClick={handleSave}
              disabled={saving || displayName.trim().length < 3}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
