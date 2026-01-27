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

const EYE_COLORS = [
  { name: 'Azul', color: '#2E86AB' },
  { name: 'Verde', color: '#06A77D' },
  { name: 'Café', color: '#8B4513' },
  { name: 'Gris', color: '#6C7A89' },
  { name: 'Miel', color: '#D4A574' },
  { name: 'Negro', color: '#2C1810' },
];

const HAIR_COLORS = [
  { name: 'Negro', color: '#2C1810' },
  { name: 'Castaño', color: '#8B4513' },
  { name: 'Rubio', color: '#FFD700' },
  { name: 'Rojo', color: '#FF6347' },
  { name: 'Azul', color: '#4169E1' },
  { name: 'Rosa', color: '#FF69B4' },
];

const DEFAULT_CONFIG: AvatarConfig = {
  faceColor: '#FFD1A0',
  eyeColor: '#2E86AB',
  eyesId: 0,
  mouthId: 0,
  hairId: 0,
  hairColor: '#2C1810',
  beardId: null,
  mustacheId: null,
  glassesId: null,
  headphonesId: null,
  faceShapeId: 0,
};

const FACE_SHAPE_NAMES = [
  'Ovalada',
  'Redonda',
  'Cuadrada',
  'Rectangular',
  'Triangular',
  'Triangular inv.',
  'Delgada',
  'Ancha',
  'Diamante',
  'Corazón',
  'Ovalada Fina',
  'Ovalada Suave',
  'Delicada',
  'Fina',
  'Corazón Delicado',
];

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
          const config = data.avatar_config as Partial<AvatarConfig>;
          setAvatarConfig({ ...DEFAULT_CONFIG, ...config });
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
      <div className="min-h-screen bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 p-4 overflow-y-auto">
      <div className="max-w-2xl mx-auto pb-6">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-gradient-to-r from-teal-700/90 to-cyan-700/90 backdrop-blur-md p-4 rounded-xl z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-teal-200 transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="text-lg font-semibold">Volver</span>
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User size={28} />
            Mi Avatar
          </h1>
          <div className="w-20"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
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

          <div className="space-y-5">
            <div>
              <label className="block text-white font-semibold mb-2 text-base">
                Color de piel
              </label>
              <div className="flex gap-2 justify-center flex-wrap">
                {FACE_COLORS.map((item) => (
                  <button
                    key={item.color}
                    onClick={() => setAvatarConfig({ ...avatarConfig, faceColor: item.color })}
                    className={`w-12 h-12 rounded-full border-4 transition-all transform hover:scale-110 ${
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
              <label className="block text-white font-semibold mb-2 text-base">
                Forma de cara
              </label>
              <div className="flex gap-2 justify-center flex-wrap">
                {FACE_SHAPE_NAMES.map((name, id) => (
                  <button
                    key={id}
                    onClick={() => setAvatarConfig({ ...avatarConfig, faceShapeId: id })}
                    className={`w-16 h-16 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-105 ${
                      avatarConfig.faceShapeId === id
                        ? 'border-white shadow-lg scale-105 bg-white/30'
                        : 'border-white/30'
                    }`}
                  >
                    <AvatarView
                      config={{ ...DEFAULT_CONFIG, faceShapeId: id, faceColor: avatarConfig.faceColor }}
                      size="small"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2 text-base">
                Color de ojos
              </label>
              <div className="flex gap-2 justify-center flex-wrap">
                {EYE_COLORS.map((item) => (
                  <button
                    key={item.color}
                    onClick={() => setAvatarConfig({ ...avatarConfig, eyeColor: item.color })}
                    className={`w-12 h-12 rounded-full border-4 transition-all transform hover:scale-110 ${
                      avatarConfig.eyeColor === item.color
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
              <label className="block text-white font-semibold mb-2 text-base">
                Ojos
              </label>
              <div className="flex gap-2 justify-center flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((id) => (
                  <button
                    key={id}
                    onClick={() => setAvatarConfig({ ...avatarConfig, eyesId: id })}
                    className={`w-14 h-14 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
                      avatarConfig.eyesId === id
                        ? 'border-white shadow-lg scale-110 bg-white/30'
                        : 'border-white/30'
                    }`}
                  >
                    <AvatarView
                      config={{ ...DEFAULT_CONFIG, eyesId: id, eyeColor: avatarConfig.eyeColor }}
                      size="small"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2 text-base">
                Boca
              </label>
              <div className="flex gap-2 justify-center flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((id) => (
                  <button
                    key={id}
                    onClick={() => setAvatarConfig({ ...avatarConfig, mouthId: id })}
                    className={`w-14 h-14 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
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
              <label className="block text-white font-semibold mb-2 text-base">
                Color de cabello
              </label>
              <div className="flex gap-2 justify-center flex-wrap">
                {HAIR_COLORS.map((item) => (
                  <button
                    key={item.color}
                    onClick={() => setAvatarConfig({ ...avatarConfig, hairColor: item.color })}
                    className={`w-12 h-12 rounded-full border-4 transition-all transform hover:scale-110 ${
                      avatarConfig.hairColor === item.color
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
              <label className="block text-white font-semibold mb-2 text-base">
                Cabello
              </label>
              <div className="flex gap-2 justify-center flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((id) => (
                  <button
                    key={id}
                    onClick={() => setAvatarConfig({ ...avatarConfig, hairId: id })}
                    className={`w-14 h-14 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
                      avatarConfig.hairId === id
                        ? 'border-white shadow-lg scale-110 bg-white/30'
                        : 'border-white/30'
                    }`}
                  >
                    <AvatarView
                      config={{ ...DEFAULT_CONFIG, hairId: id, hairColor: avatarConfig.hairColor }}
                      size="small"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2 text-base">
                Barba
              </label>
              <div className="flex gap-2 justify-center flex-wrap">
                <button
                  onClick={() => setAvatarConfig({ ...avatarConfig, beardId: null })}
                  className={`w-14 h-14 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
                    avatarConfig.beardId === null
                      ? 'border-white shadow-lg scale-110 bg-white/30'
                      : 'border-white/30'
                  }`}
                >
                  <span className="text-white text-xs">Sin</span>
                </button>
                {[0, 1, 2, 3, 4].map((id) => (
                  <button
                    key={id}
                    onClick={() => setAvatarConfig({ ...avatarConfig, beardId: id })}
                    className={`w-14 h-14 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
                      avatarConfig.beardId === id
                        ? 'border-white shadow-lg scale-110 bg-white/30'
                        : 'border-white/30'
                    }`}
                  >
                    <AvatarView
                      config={{ ...DEFAULT_CONFIG, beardId: id, hairColor: avatarConfig.hairColor }}
                      size="small"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2 text-base">
                Bigote
              </label>
              <div className="flex gap-2 justify-center flex-wrap">
                <button
                  onClick={() => setAvatarConfig({ ...avatarConfig, mustacheId: null })}
                  className={`w-14 h-14 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
                    avatarConfig.mustacheId === null
                      ? 'border-white shadow-lg scale-110 bg-white/30'
                      : 'border-white/30'
                  }`}
                >
                  <span className="text-white text-xs">Sin</span>
                </button>
                {[0, 1, 2, 3, 4].map((id) => (
                  <button
                    key={id}
                    onClick={() => setAvatarConfig({ ...avatarConfig, mustacheId: id })}
                    className={`w-14 h-14 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
                      avatarConfig.mustacheId === id
                        ? 'border-white shadow-lg scale-110 bg-white/30'
                        : 'border-white/30'
                    }`}
                  >
                    <AvatarView
                      config={{ ...DEFAULT_CONFIG, mustacheId: id, hairColor: avatarConfig.hairColor }}
                      size="small"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2 text-base">
                Gafas
              </label>
              <div className="flex gap-2 justify-center flex-wrap">
                <button
                  onClick={() => setAvatarConfig({ ...avatarConfig, glassesId: null })}
                  className={`w-14 h-14 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
                    avatarConfig.glassesId === null
                      ? 'border-white shadow-lg scale-110 bg-white/30'
                      : 'border-white/30'
                  }`}
                >
                  <span className="text-white text-xs">Sin</span>
                </button>
                {[0, 1, 2, 3, 4, 5].map((id) => (
                  <button
                    key={id}
                    onClick={() => setAvatarConfig({ ...avatarConfig, glassesId: id })}
                    className={`w-14 h-14 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
                      avatarConfig.glassesId === id
                        ? 'border-white shadow-lg scale-110 bg-white/30'
                        : 'border-white/30'
                    }`}
                  >
                    <AvatarView
                      config={{ ...DEFAULT_CONFIG, glassesId: id }}
                      size="small"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2 text-base">
                Cascos de Música
              </label>
              <div className="flex gap-2 justify-center flex-wrap">
                <button
                  onClick={() => setAvatarConfig({ ...avatarConfig, headphonesId: null })}
                  className={`w-14 h-14 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
                    avatarConfig.headphonesId === null
                      ? 'border-white shadow-lg scale-110 bg-white/30'
                      : 'border-white/30'
                  }`}
                >
                  <span className="text-white text-xs">Sin</span>
                </button>
                {[0, 1, 2, 3, 4].map((id) => (
                  <button
                    key={id}
                    onClick={() => setAvatarConfig({ ...avatarConfig, headphonesId: id })}
                    className={`w-14 h-14 rounded-lg border-3 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-110 ${
                      avatarConfig.headphonesId === id
                        ? 'border-white shadow-lg scale-110 bg-white/30'
                        : 'border-white/30'
                    }`}
                  >
                    <AvatarView
                      config={{ ...DEFAULT_CONFIG, headphonesId: id }}
                      size="small"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
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
