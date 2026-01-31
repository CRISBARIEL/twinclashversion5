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

const FACE_EMOJIS = [
  { id: '😀', name: 'Feliz' },
  { id: '😃', name: 'Sonriente' },
  { id: '😄', name: 'Alegre' },
  { id: '😁', name: 'Radiante' },
  { id: '😆', name: 'Riendo' },
  { id: '😊', name: 'Tímido' },
  { id: '😇', name: 'Angelical' },
  { id: '🙂', name: 'Contento' },
  { id: '🙃', name: 'Al revés' },
  { id: '😉', name: 'Guiño' },
  { id: '😌', name: 'Relajado' },
  { id: '😍', name: 'Enamorado' },
  { id: '🥰', name: 'Cariñoso' },
  { id: '😘', name: 'Beso' },
  { id: '😗', name: 'Besitos' },
  { id: '😙', name: 'Beso feliz' },
  { id: '😚', name: 'Beso cerrado' },
  { id: '😋', name: 'Sabroso' },
  { id: '😛', name: 'Lengua' },
  { id: '😝', name: 'Loco' },
  { id: '😜', name: 'Guiño loco' },
  { id: '🤪', name: 'Zany' },
  { id: '🤨', name: 'Escéptico' },
  { id: '🧐', name: 'Monocle' },
  { id: '🤓', name: 'Nerd' },
  { id: '😎', name: 'Cool' },
  { id: '🥳', name: 'Fiesta' },
  { id: '😏', name: 'Pícaro' },
  { id: '😒', name: 'Aburrido' },
  { id: '😞', name: 'Decepcionado' },
];

const ANIMAL_EMOJIS = [
  { id: '🐱', name: 'Gatito' },
  { id: '🐶', name: 'Perrito' },
  { id: '🐭', name: 'Ratoncito' },
  { id: '🐹', name: 'Hámster' },
  { id: '🐰', name: 'Conejito' },
  { id: '🦊', name: 'Zorrito' },
  { id: '🐻', name: 'Osito' },
  { id: '🐼', name: 'Panda' },
  { id: '🐨', name: 'Koala' },
  { id: '🐯', name: 'Tigre' },
  { id: '🦁', name: 'León' },
  { id: '🐮', name: 'Vaca' },
  { id: '🐷', name: 'Cerdito' },
  { id: '🐸', name: 'Ranita' },
  { id: '🐵', name: 'Monito' },
  { id: '🙈', name: 'No ver' },
  { id: '🙉', name: 'No oír' },
  { id: '🙊', name: 'No hablar' },
  { id: '🐔', name: 'Pollito' },
  { id: '🐧', name: 'Pingüino' },
  { id: '🐦', name: 'Pajarito' },
  { id: '🐤', name: 'Pollito bebé' },
  { id: '🦆', name: 'Pato' },
  { id: '🦅', name: 'Águila' },
  { id: '🦉', name: 'Búho' },
  { id: '🦇', name: 'Murciélago' },
  { id: '🐺', name: 'Lobo' },
  { id: '🐗', name: 'Jabalí' },
  { id: '🐴', name: 'Caballo' },
  { id: '🦄', name: 'Unicornio' },
];

const BG_COLORS = [
  { name: 'Rojo', value: 'Tanned', gradient: 'from-red-400 to-red-600' },
  { name: 'Naranja', value: 'Yellow', gradient: 'from-orange-400 to-orange-600' },
  { name: 'Amarillo', value: 'Pale', gradient: 'from-yellow-400 to-yellow-600' },
  { name: 'Lima', value: 'Light', gradient: 'from-lime-400 to-lime-600' },
  { name: 'Verde', value: 'Brown', gradient: 'from-green-400 to-green-600' },
  { name: 'Esmeralda', value: 'DarkBrown', gradient: 'from-emerald-400 to-emerald-600' },
  { name: 'Teal', value: 'Black', gradient: 'from-teal-400 to-teal-600' },
  { name: 'Cian', value: 'Auburn', gradient: 'from-cyan-400 to-cyan-600' },
  { name: 'Azul', value: 'Blonde', gradient: 'from-blue-400 to-blue-600' },
  { name: 'Índigo', value: 'BlondeGolden', gradient: 'from-indigo-400 to-indigo-600' },
  { name: 'Violeta', value: 'Platinum', gradient: 'from-violet-400 to-violet-600' },
  { name: 'Morado', value: 'Red', gradient: 'from-purple-400 to-purple-600' },
  { name: 'Fucsia', value: 'SilverGray', gradient: 'from-fuchsia-400 to-fuchsia-600' },
  { name: 'Rosa', value: 'PastelPink', gradient: 'from-pink-400 to-pink-600' },
];

const DEFAULT_CONFIG: AvatarConfig = {
  style: 'emoji',
  seed: Math.random().toString(36).substring(7),
  skinColor: ['Tanned'],
};

export const AvatarEditor = ({ onBack }: AvatarEditorProps) => {
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState('');
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialName, setInitialName] = useState('');
  const [initialAvatarConfig, setInitialAvatarConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
  const [avatarType, setAvatarType] = useState<'face' | 'animal'>('face');

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

          if (fullConfig.animalId && ANIMAL_EMOJIS.some(a => a.id === fullConfig.animalId)) {
            setAvatarType('animal');
          }
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
    const randomFace = FACE_EMOJIS[Math.floor(Math.random() * FACE_EMOJIS.length)];
    const randomColor = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)];

    setAvatarConfig({
      style: 'emoji',
      seed: randomFace.id,
      skinColor: [randomColor.value],
      animalId: undefined,
    });
    setAvatarType('face');
  };

  const hasChanges = () => {
    if (displayName.trim() !== initialName) return true;
    return JSON.stringify(avatarConfig) !== JSON.stringify(initialAvatarConfig);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (avatarType === 'animal') {
      setAvatarConfig({ ...avatarConfig, animalId: emoji, seed: emoji });
    } else {
      setAvatarConfig({ ...avatarConfig, seed: emoji, animalId: undefined });
    }
  };

  const handleColorSelect = (colorValue: string) => {
    setAvatarConfig({ ...avatarConfig, skinColor: [colorValue] });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">{t.avatar.loading}</div>
      </div>
    );
  }

  const currentEmojis = avatarType === 'animal' ? ANIMAL_EMOJIS : FACE_EMOJIS;
  const selectedEmoji = avatarType === 'animal' ? avatarConfig.animalId : avatarConfig.seed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 p-4 overflow-y-auto">
      <div className="max-w-2xl mx-auto pb-6">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-gradient-to-r from-teal-700/90 to-cyan-700/90 backdrop-blur-md p-4 rounded-xl z-10">
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
            className="flex items-center gap-2 text-white hover:text-teal-200 transition-colors bg-white/10 px-3 py-2 rounded-lg"
            title="Avatar Aleatorio"
          >
            <Shuffle size={20} />
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-gradient-to-br from-white to-gray-100 rounded-full p-2 mb-4 shadow-2xl ring-4 ring-white/30">
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
                Tipo de Avatar
              </label>
              <div className="flex gap-3 justify-center mb-4">
                <button
                  onClick={() => {
                    setAvatarType('face');
                    if (avatarConfig.animalId) {
                      setAvatarConfig({ ...avatarConfig, animalId: undefined, seed: FACE_EMOJIS[0].id });
                    }
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    avatarType === 'face'
                      ? 'bg-white text-teal-600 shadow-lg scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Caras
                </button>
                <button
                  onClick={() => {
                    setAvatarType('animal');
                    setAvatarConfig({ ...avatarConfig, animalId: ANIMAL_EMOJIS[0].id, seed: ANIMAL_EMOJIS[0].id });
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    avatarType === 'animal'
                      ? 'bg-white text-teal-600 shadow-lg scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Animales
                </button>
              </div>

              <div className="grid grid-cols-5 gap-3 max-h-96 overflow-y-auto p-3 bg-white/5 rounded-lg">
                {currentEmojis.map((emoji) => (
                  <button
                    key={emoji.id}
                    onClick={() => handleEmojiSelect(emoji.id)}
                    className={`p-4 rounded-xl border-3 bg-white/20 backdrop-blur text-4xl transition-all hover:scale-110 ${
                      selectedEmoji === emoji.id
                        ? 'border-white shadow-lg scale-105 ring-4 ring-white/30'
                        : 'border-white/30'
                    }`}
                    title={emoji.name}
                  >
                    {emoji.id}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-3 text-base text-center">
                Color de Fondo
              </label>
              <div className="grid grid-cols-4 gap-3">
                {BG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorSelect(color.value)}
                    className={`p-4 rounded-xl border-3 transition-all hover:scale-105 ${
                      avatarConfig.skinColor?.[0] === color.value
                        ? 'border-white shadow-lg scale-105 ring-4 ring-white/30'
                        : 'border-white/30'
                    }`}
                  >
                    <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${color.gradient}`}></div>
                    <div className="text-white text-xs mt-2 text-center font-medium">{color.name}</div>
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
