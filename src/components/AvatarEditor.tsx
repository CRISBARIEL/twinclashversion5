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

// Opciones de DiceBear Big Smile
const SKIN_COLORS = [
  { name: 'Clara', value: 'ffdbb4' },
  { name: 'Media', value: 'd4a574' },
  { name: 'Morena', value: 'ae7c56' },
  { name: 'Oscura', value: '8d5524' },
  { name: 'Muy Oscura', value: '5c4033' },
];

const HAIR_STYLES = [
  { name: 'Corto 1', value: 'short01' },
  { name: 'Corto 2', value: 'short02' },
  { name: 'Corto 3', value: 'short03' },
  { name: 'Corto 4', value: 'short04' },
  { name: 'Corto 5', value: 'short05' },
  { name: 'Rizado 1', value: 'curly01' },
  { name: 'Rizado 2', value: 'curly02' },
  { name: 'Rizado 3', value: 'curly03' },
  { name: 'Rizado 4', value: 'curly04' },
  { name: 'Largo 1', value: 'long01' },
  { name: 'Largo 2', value: 'long02' },
  { name: 'Largo 3', value: 'long03' },
  { name: 'Afro', value: 'afro' },
  { name: 'Mohawk', value: 'mohawk01' },
  { name: 'Rapado', value: 'shaved' },
  { name: 'Sin Pelo', value: 'bald' },
];

const HAIR_COLORS = [
  { name: 'Negro', value: '2c1b18' },
  { name: 'Castaño Oscuro', value: '4a312c' },
  { name: 'Castaño', value: '724133' },
  { name: 'Rubio Oscuro', value: 'b58143' },
  { name: 'Rubio', value: 'daa520' },
  { name: 'Rubio Claro', value: 'f5cd79' },
  { name: 'Rojo', value: 'a55728' },
  { name: 'Pelirojo', value: 'c93305' },
  { name: 'Gris', value: '8b8b8b' },
  { name: 'Blanco', value: 'e5e5e5' },
];

const EYES_STYLES = [
  { name: 'Normal', value: 'eyes01' },
  { name: 'Grandes', value: 'eyes02' },
  { name: 'Alegres', value: 'eyes03' },
  { name: 'Serios', value: 'eyes04' },
  { name: 'Sorprendidos', value: 'eyes05' },
  { name: 'Guiño', value: 'eyes06' },
  { name: 'Cerrados', value: 'eyes07' },
  { name: 'Pestañas', value: 'eyes08' },
  { name: 'Pícaros', value: 'eyes09' },
  { name: 'Almendra', value: 'eyes10' },
];

const MOUTH_STYLES = [
  { name: 'Sonrisa', value: 'happy01' },
  { name: 'Sonrisa Grande', value: 'happy02' },
  { name: 'Sonrisa Amplia', value: 'happy03' },
  { name: 'Risa', value: 'happy04' },
  { name: 'Neutral', value: 'serious01' },
  { name: 'Pensativo', value: 'serious02' },
  { name: 'Triste', value: 'sad01' },
  { name: 'Sorprendido', value: 'surprised01' },
  { name: 'Beso', value: 'kiss01' },
  { name: 'Lengua', value: 'tongue01' },
];

const FACIAL_HAIR = [
  { name: 'Sin Barba', value: '' },
  { name: 'Barba Completa', value: 'beardMustache' },
  { name: 'Perilla', value: 'goatee' },
  { name: 'Bigote', value: 'mustache01' },
  { name: 'Bigote Grueso', value: 'mustache02' },
  { name: 'Barba Ligera', value: 'stubble' },
];

const ACCESSORIES = [
  { name: 'Sin Accesorios', value: '' },
  { name: 'Lentes 1', value: 'glasses01' },
  { name: 'Lentes 2', value: 'glasses02' },
  { name: 'Lentes de Sol', value: 'sunglasses01' },
  { name: 'Lentes de Sol 2', value: 'sunglasses02' },
];

const CLOTHING_COLORS = [
  { name: 'Azul Oscuro', value: '3c4f5c' },
  { name: 'Negro', value: '1a1a1a' },
  { name: 'Gris', value: '6b7280' },
  { name: 'Azul', value: '3b82f6' },
  { name: 'Verde', value: '10b981' },
  { name: 'Rojo', value: 'ef4444' },
  { name: 'Morado', value: '8b5cf6' },
  { name: 'Rosa', value: 'ec4899' },
  { name: 'Amarillo', value: 'f59e0b' },
  { name: 'Blanco', value: 'ffffff' },
];

const ANIMAL_OPTIONS = [
  { id: '🐱', name: 'Gatito' },
  { id: '🐶', name: 'Perrito' },
  { id: '🐰', name: 'Conejito' },
  { id: '🦊', name: 'Zorrito' },
  { id: '🐼', name: 'Panda' },
  { id: '🐨', name: 'Koala' },
  { id: '🦁', name: 'León' },
  { id: '🐘', name: 'Elefante' },
  { id: '🦒', name: 'Jirafa' },
  { id: '🐧', name: 'Pingüino' },
];

const DEFAULT_CONFIG: AvatarConfig = {
  style: 'dicebear',
  seed: Math.random().toString(36).substring(7),
  skinColor: ['ffdbb4'],
  hairStyle: ['short01'],
  hairColor: ['2c1b18'],
  eyesStyle: ['eyes01'],
  mouthStyle: ['happy01'],
  accessoriesType: [],
  facialHairType: [],
  clothingColor: ['3c4f5c'],
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
    setAvatarConfig({
      style: 'dicebear',
      seed: Math.random().toString(36).substring(7),
      skinColor: [SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)].value],
      hairStyle: [HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)].value],
      hairColor: [HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].value],
      eyesStyle: [EYES_STYLES[Math.floor(Math.random() * EYES_STYLES.length)].value],
      mouthStyle: [MOUTH_STYLES[Math.floor(Math.random() * MOUTH_STYLES.length)].value],
      accessoriesType: Math.random() > 0.5 ? [ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)].value] : [],
      facialHairType: Math.random() > 0.6 ? [FACIAL_HAIR[Math.floor(Math.random() * FACIAL_HAIR.length)].value] : [],
      clothingColor: [CLOTHING_COLORS[Math.floor(Math.random() * CLOTHING_COLORS.length)].value],
    });
  };

  const hasChanges = () => {
    if (displayName.trim() !== initialName) return true;
    return JSON.stringify(avatarConfig) !== JSON.stringify(initialAvatarConfig);
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
            {/* Avatar Type Selector */}
            <div>
              <label className="block text-white font-semibold mb-3 text-lg text-center">
                Tipo de Avatar
              </label>
              <div className="flex gap-3 justify-center mb-4">
                <button
                  onClick={() => setAvatarConfig({ ...avatarConfig, animalId: null, style: 'dicebear' })}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    !avatarConfig.animalId
                      ? 'bg-white text-teal-600 shadow-lg scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Personalizado
                </button>
                <button
                  onClick={() => setAvatarConfig({ ...avatarConfig, animalId: '🐱', style: 'animal' })}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    avatarConfig.animalId
                      ? 'bg-white text-teal-600 shadow-lg scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Animal
                </button>
              </div>

              {avatarConfig.animalId && (
                <div className="flex gap-2 justify-center flex-wrap">
                  {ANIMAL_OPTIONS.map((animal) => (
                    <button
                      key={animal.id}
                      onClick={() => setAvatarConfig({ ...avatarConfig, animalId: animal.id })}
                      className={`w-16 h-16 rounded-xl border-4 bg-white/20 backdrop-blur flex items-center justify-center transition-all transform hover:scale-105 ${
                        avatarConfig.animalId === animal.id
                          ? 'border-white shadow-lg scale-105 ring-4 ring-white/30'
                          : 'border-white/30'
                      }`}
                      title={animal.name}
                    >
                      <span className="text-3xl">{animal.id}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!avatarConfig.animalId && (
              <>
                {/* Skin Color */}
                <div>
                  <label className="block text-white font-semibold mb-3 text-base">Tono de Piel</label>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {SKIN_COLORS.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setAvatarConfig({ ...avatarConfig, skinColor: [item.value] })}
                        className={`w-14 h-14 rounded-full border-4 transition-all transform hover:scale-110 shadow-lg ${
                          avatarConfig.skinColor?.[0] === item.value
                            ? 'border-white scale-110 ring-4 ring-white/50'
                            : 'border-white/30'
                        }`}
                        style={{ backgroundColor: `#${item.value}` }}
                        title={item.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Hair Style */}
                <div>
                  <label className="block text-white font-semibold mb-3 text-base">Estilo de Pelo</label>
                  <div className="grid grid-cols-4 gap-2">
                    {HAIR_STYLES.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setAvatarConfig({ ...avatarConfig, hairStyle: [item.value] })}
                        className={`p-3 rounded-lg border-2 bg-white/20 backdrop-blur text-white text-xs font-medium transition-all hover:scale-105 ${
                          avatarConfig.hairStyle?.[0] === item.value
                            ? 'border-white shadow-lg scale-105 bg-white/40'
                            : 'border-white/30'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair Color */}
                <div>
                  <label className="block text-white font-semibold mb-3 text-base">Color de Pelo</label>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {HAIR_COLORS.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setAvatarConfig({ ...avatarConfig, hairColor: [item.value] })}
                        className={`w-12 h-12 rounded-full border-4 transition-all transform hover:scale-110 shadow-lg ${
                          avatarConfig.hairColor?.[0] === item.value
                            ? 'border-white scale-110 ring-4 ring-white/50'
                            : 'border-white/30'
                        }`}
                        style={{ backgroundColor: `#${item.value}` }}
                        title={item.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Eyes Style */}
                <div>
                  <label className="block text-white font-semibold mb-3 text-base">Estilo de Ojos</label>
                  <div className="grid grid-cols-5 gap-2">
                    {EYES_STYLES.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setAvatarConfig({ ...avatarConfig, eyesStyle: [item.value] })}
                        className={`p-2 rounded-lg border-2 bg-white/20 backdrop-blur text-white text-xs font-medium transition-all hover:scale-105 ${
                          avatarConfig.eyesStyle?.[0] === item.value
                            ? 'border-white shadow-lg scale-105 bg-white/40'
                            : 'border-white/30'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mouth Style */}
                <div>
                  <label className="block text-white font-semibold mb-3 text-base">Estilo de Boca</label>
                  <div className="grid grid-cols-5 gap-2">
                    {MOUTH_STYLES.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setAvatarConfig({ ...avatarConfig, mouthStyle: [item.value] })}
                        className={`p-2 rounded-lg border-2 bg-white/20 backdrop-blur text-white text-xs font-medium transition-all hover:scale-105 ${
                          avatarConfig.mouthStyle?.[0] === item.value
                            ? 'border-white shadow-lg scale-105 bg-white/40'
                            : 'border-white/30'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Facial Hair */}
                <div>
                  <label className="block text-white font-semibold mb-3 text-base">Vello Facial</label>
                  <div className="grid grid-cols-3 gap-2">
                    {FACIAL_HAIR.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setAvatarConfig({ ...avatarConfig, facialHairType: item.value ? [item.value] : [] })}
                        className={`p-3 rounded-lg border-2 bg-white/20 backdrop-blur text-white text-xs font-medium transition-all hover:scale-105 ${
                          (avatarConfig.facialHairType?.[0] === item.value) || (!avatarConfig.facialHairType?.length && !item.value)
                            ? 'border-white shadow-lg scale-105 bg-white/40'
                            : 'border-white/30'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accessories */}
                <div>
                  <label className="block text-white font-semibold mb-3 text-base">Accesorios</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ACCESSORIES.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setAvatarConfig({ ...avatarConfig, accessoriesType: item.value ? [item.value] : [] })}
                        className={`p-3 rounded-lg border-2 bg-white/20 backdrop-blur text-white text-xs font-medium transition-all hover:scale-105 ${
                          (avatarConfig.accessoriesType?.[0] === item.value) || (!avatarConfig.accessoriesType?.length && !item.value)
                            ? 'border-white shadow-lg scale-105 bg-white/40'
                            : 'border-white/30'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clothing Color */}
                <div>
                  <label className="block text-white font-semibold mb-3 text-base">Color de Ropa</label>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {CLOTHING_COLORS.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setAvatarConfig({ ...avatarConfig, clothingColor: [item.value] })}
                        className={`w-12 h-12 rounded-full border-4 transition-all transform hover:scale-110 shadow-lg ${
                          avatarConfig.clothingColor?.[0] === item.value
                            ? 'border-white scale-110 ring-4 ring-white/50'
                            : 'border-white/30'
                        }`}
                        style={{ backgroundColor: `#${item.value}` }}
                        title={item.name}
                      />
                    ))}
                  </div>
                </div>
              </>
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
