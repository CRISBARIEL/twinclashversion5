import { useState, useEffect } from 'react';
import { ArrowLeft, Save, RotateCcw, User, Shuffle } from 'lucide-react';
import { AvatarView } from './AvatarView';
import { AvatarConfig } from '../types';
import { supabase, getOrCreateClientId } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useLanguage } from '../hooks/useLanguage';

interface AvatarEditorProps {
  onBack: () => void;
}

const AVATAR_STYLES = [
  { id: 'adventurer', name: 'Aventurero', description: 'Caras expresivas' },
  { id: 'adventurer-neutral', name: 'Aventurero Pro', description: 'Estilo profesional' },
  { id: 'avataaars', name: 'Avataaars', description: 'Estilo clásico' },
  { id: 'big-ears', name: 'Orejas', description: 'Caras divertidas' },
  { id: 'lorelei', name: 'Lorelei', description: 'Estilo elegante' },
  { id: 'micah', name: 'Micah', description: 'Minimalista' },
  { id: 'personas', name: 'Personas', description: 'Muy realista' },
];


const DEFAULT_CONFIG: AvatarConfig = {
  style: 'adventurer',
  seed: Math.random().toString(36).substring(7),
};

export const AvatarEditor = ({ onBack }: AvatarEditorProps) => {
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState('');
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialName, setInitialName] = useState('');
  const [initialAvatarConfig, setInitialAvatarConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
  const [showingVariations, setShowingVariations] = useState(false);
  const [variationSeeds, setVariationSeeds] = useState<string[]>([]);

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
          const fullConfig = { ...DEFAULT_CONFIG, ...config };
          setAvatarConfig(fullConfig);
          setInitialAvatarConfig(fullConfig);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error(t.avatar.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (displayName.trim().length < 3) {
      toast.error(t.avatar.nameMinLength);
      return;
    }
    if (displayName.trim().length > 16) {
      toast.error(t.avatar.nameMaxLength);
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
      setInitialAvatarConfig(avatarConfig);
      toast.success(t.avatar.profileSaved);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(t.avatar.errorSaving);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setAvatarConfig(initialAvatarConfig);
    setDisplayName(initialName);
    setShowingVariations(false);
  };

  const handleRandomize = () => {
    const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
    const randomSeed = Math.random().toString(36).substring(2, 10);

    setAvatarConfig({
      style: randomStyle.id,
      seed: randomSeed,
    });
    setShowingVariations(false);
  };

  const hasChanges = () => {
    if (displayName.trim() !== initialName) return true;
    return JSON.stringify(avatarConfig) !== JSON.stringify(initialAvatarConfig);
  };

  const handleStyleSelect = (style: string) => {
    setAvatarConfig({ ...avatarConfig, style });
    generateVariations();
    setShowingVariations(true);
  };

  const generateVariations = () => {
    const seeds: string[] = [];
    for (let i = 0; i < 8; i++) {
      seeds.push(Math.random().toString(36).substring(2, 10));
    }
    setVariationSeeds(seeds);
  };

  const handleVariationSelect = (seed: string) => {
    setAvatarConfig({ ...avatarConfig, seed });
    setShowingVariations(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">{t.avatar.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 p-4 overflow-y-auto">
      <div className="max-w-3xl mx-auto pb-6">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-gradient-to-r from-teal-700/90 to-cyan-700/90 backdrop-blur-md p-4 rounded-xl z-10 shadow-lg">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-teal-200 transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="text-lg font-semibold">{t.avatar.back}</span>
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User size={28} />
            {t.avatar.title}
          </h1>
          <button
            onClick={handleRandomize}
            className="flex items-center gap-2 text-white hover:text-teal-200 transition-colors bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20"
            title="Avatar Aleatorio"
          >
            <Shuffle size={20} />
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-gradient-to-br from-white to-gray-100 rounded-full p-3 mb-4 shadow-2xl ring-4 ring-white/30">
              <AvatarView config={avatarConfig} size="large" />
            </div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t.avatar.namePlaceholder}
              maxLength={16}
              className="text-center text-2xl font-bold bg-white/20 text-white placeholder-white/50 border-2 border-white/30 rounded-lg px-4 py-2 focus:outline-none focus:border-white/60 transition-colors"
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-3 text-lg text-center">
                Estilo de Avatar
              </label>
              <div className="grid grid-cols-3 gap-3">
                {AVATAR_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleStyleSelect(style.id)}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 bg-white/10 backdrop-blur ${
                      avatarConfig.style === style.id
                        ? 'border-white shadow-lg scale-105 ring-4 ring-white/30'
                        : 'border-white/30 hover:border-white/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-white rounded-full p-1">
                        <AvatarView
                          config={{
                            ...avatarConfig,
                            style: style.id,
                            seed: displayName || 'Preview'
                          }}
                          size="small"
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold text-sm">{style.name}</div>
                        <div className="text-white/70 text-xs">{style.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {showingVariations && (
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border-2 border-white/40">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white font-semibold text-lg">
                    Elige una variación
                  </label>
                  <button
                    onClick={() => generateVariations()}
                    className="text-white/80 hover:text-white text-sm flex items-center gap-1"
                  >
                    <Shuffle size={16} />
                    Más opciones
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {variationSeeds.map((seed, index) => (
                    <button
                      key={seed}
                      onClick={() => handleVariationSelect(seed)}
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-110 bg-white/10 ${
                        avatarConfig.seed === seed
                          ? 'border-white shadow-lg scale-105 ring-2 ring-white/50'
                          : 'border-white/30 hover:border-white/50'
                      }`}
                    >
                      <div className="bg-white rounded-full p-1">
                        <AvatarView
                          config={{
                            style: avatarConfig.style,
                            seed: seed,
                          }}
                          size="small"
                        />
                      </div>
                      <div className="text-white text-xs text-center mt-1">#{index + 1}</div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowingVariations(false)}
                  className="w-full mt-3 bg-white/10 hover:bg-white/20 text-white text-sm py-2 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleReset}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              {t.avatar.reset}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || displayName.trim().length < 3 || !hasChanges()}
              className={`flex-1 font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                !hasChanges() && displayName.trim().length >= 3
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-default'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Save size={20} />
              {saving ? t.avatar.saving : (!hasChanges() && displayName.trim().length >= 3 ? 'Guardado' : t.avatar.save)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
