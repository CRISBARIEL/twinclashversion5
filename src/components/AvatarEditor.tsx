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

const COLOR_PALETTES = [
  {
    name: 'Oceano',
    colors: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
    gradient: 'from-[#264653] via-[#2a9d8f] to-[#e9c46a]'
  },
  {
    name: 'Bosque',
    colors: ['#606c38', '#283618', '#fefae0', '#dda15e', '#bc6c25'],
    gradient: 'from-[#606c38] via-[#283618] to-[#dda15e]'
  },
  {
    name: 'Amanecer',
    colors: ['#780000', '#c1121f', '#fdf0d5', '#003049', '#669bbc'],
    gradient: 'from-[#780000] via-[#c1121f] to-[#fdf0d5]'
  },
  {
    name: 'Crepúsculo',
    colors: ['#001219', '#005f73', '#0a9396', '#94d2bd', '#e9d8a6'],
    gradient: 'from-[#001219] via-[#005f73] to-[#94d2bd]'
  },
  {
    name: 'Fuego',
    colors: ['#d00000', '#dc2f02', '#e85d04', '#f48c06', '#faa307'],
    gradient: 'from-[#d00000] via-[#dc2f02] to-[#f48c06]'
  },
  {
    name: 'Lavanda',
    colors: ['#240046', '#3c096c', '#5a189a', '#7209b7', '#9d4edd'],
    gradient: 'from-[#240046] via-[#5a189a] to-[#9d4edd]'
  },
  {
    name: 'Tropical',
    colors: ['#fb6900', '#f63700', '#004853', '#007e80', '#00b9bd'],
    gradient: 'from-[#fb6900] via-[#004853] to-[#00b9bd]'
  },
  {
    name: 'Caramelo',
    colors: ['#ffcdb2', '#ffb4a2', '#e5989b', '#b5838d', '#6d6875'],
    gradient: 'from-[#ffcdb2] via-[#e5989b] to-[#6d6875]'
  },
  {
    name: 'Montaña',
    colors: ['#006466', '#065a60', '#0b525b', '#144552', '#1b3a4b'],
    gradient: 'from-[#006466] via-[#0b525b] to-[#1b3a4b]'
  },
  {
    name: 'Pastel',
    colors: ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557'],
    gradient: 'from-[#e63946] via-[#a8dadc] to-[#1d3557]'
  },
  {
    name: 'Neón',
    colors: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff'],
    gradient: 'from-[#ff006e] via-[#ffbe0b] to-[#3a86ff]'
  },
  {
    name: 'Terra',
    colors: ['#582f0e', '#7f4f24', '#936639', '#a68a64', '#b6ad90'],
    gradient: 'from-[#582f0e] via-[#936639] to-[#b6ad90]'
  },
];

const DEFAULT_CONFIG: AvatarConfig = {
  style: 'adventurer',
  seed: Math.random().toString(36).substring(7),
  colors: ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90'],
};

export const AvatarEditor = ({ onBack }: AvatarEditorProps) => {
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState('');
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialName, setInitialName] = useState('');
  const [initialAvatarConfig, setInitialAvatarConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);

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
  };

  const handleRandomize = () => {
    const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
    const randomPalette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    const randomSeed = Math.random().toString(36).substring(2, 10);

    setAvatarConfig({
      style: randomStyle.id,
      seed: randomSeed,
      colors: randomPalette.colors,
    });
  };

  const hasChanges = () => {
    if (displayName.trim() !== initialName) return true;
    return JSON.stringify(avatarConfig) !== JSON.stringify(initialAvatarConfig);
  };

  const handleStyleSelect = (style: string) => {
    setAvatarConfig({ ...avatarConfig, style });
  };

  const handlePaletteSelect = (colors: string[]) => {
    setAvatarConfig({ ...avatarConfig, colors });
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

            <div>
              <label className="block text-white font-semibold mb-3 text-lg text-center">
                Paleta de Colores
              </label>
              <div className="grid grid-cols-2 gap-3">
                {COLOR_PALETTES.map((palette) => (
                  <button
                    key={palette.name}
                    onClick={() => handlePaletteSelect(palette.colors)}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                      JSON.stringify(avatarConfig.colors) === JSON.stringify(palette.colors)
                        ? 'border-white shadow-lg scale-105 ring-4 ring-white/30'
                        : 'border-white/30 hover:border-white/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className={`h-12 rounded-lg bg-gradient-to-r ${palette.gradient} shadow-md`}></div>
                      <div className="flex gap-1 justify-center">
                        {palette.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full border-2 border-white/50 shadow-sm"
                            style={{ backgroundColor: color }}
                          ></div>
                        ))}
                      </div>
                      <div className="text-white text-sm font-medium text-center">{palette.name}</div>
                    </div>
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
