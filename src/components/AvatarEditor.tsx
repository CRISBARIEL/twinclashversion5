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

const SKIN_COLORS = [
  { name: 'Tanned', value: 'Tanned' },
  { name: 'Yellow', value: 'Yellow' },
  { name: 'Pale', value: 'Pale' },
  { name: 'Light', value: 'Light' },
  { name: 'Brown', value: 'Brown' },
  { name: 'DarkBrown', value: 'DarkBrown' },
  { name: 'Black', value: 'Black' },
];

const HAIR_STYLES = [
  { name: 'Sin Pelo', value: 'NoHair' },
  { name: 'Gorro', value: 'Eyepatch' },
  { name: 'Sombrero', value: 'Hat' },
  { name: 'Hijab', value: 'Hijab' },
  { name: 'Turbante', value: 'Turban' },
  { name: 'Gorro Invierno', value: 'WinterHat1' },
  { name: 'Gorro 2', value: 'WinterHat2' },
  { name: 'Gorro 3', value: 'WinterHat3' },
  { name: 'Gorro 4', value: 'WinterHat4' },
  { name: 'Pelo Largo', value: 'LongHairBigHair' },
  { name: 'Pelo Bob', value: 'LongHairBob' },
  { name: 'Pelo Ondulado', value: 'LongHairBun' },
  { name: 'Pelo Rizado', value: 'LongHairCurly' },
  { name: 'Pelo Curvo', value: 'LongHairCurvy' },
  { name: 'Pelo Dread', value: 'LongHairDreads' },
  { name: 'Pelo Afro', value: 'LongHairFrida' },
  { name: 'Pelo Fro', value: 'LongHairFro' },
  { name: 'Pelo Banda', value: 'LongHairFroBand' },
  { name: 'Pelo Lacio', value: 'LongHairNotTooLong' },
  { name: 'Pelo Trenzas', value: 'LongHairShavedSides' },
  { name: 'Pelo Liso', value: 'LongHairMiaWallace' },
  { name: 'Pelo Medio', value: 'LongHairStraight' },
  { name: 'Pelo Recto', value: 'LongHairStraight2' },
  { name: 'Pelo Strands', value: 'LongHairStraightStrand' },
  { name: 'Pelo Corto 1', value: 'ShortHairDreads01' },
  { name: 'Pelo Corto 2', value: 'ShortHairDreads02' },
  { name: 'Pelo Afro Corto', value: 'ShortHairFrizzle' },
  { name: 'Pelo Corto Lacio', value: 'ShortHairShaggyMullet' },
  { name: 'Pelo Corto Flat', value: 'ShortHairShortFlat' },
  { name: 'Pelo Corto Rizado', value: 'ShortHairShortCurly' },
  { name: 'Pelo Corto Round', value: 'ShortHairShortRound' },
  { name: 'Pelo Corto Waved', value: 'ShortHairShortWaved' },
  { name: 'Pelo Rapado', value: 'ShortHairSides' },
  { name: 'Pelo Caesar', value: 'ShortHairTheCaesar' },
  { name: 'Pelo Frontal', value: 'ShortHairTheCaesarSidePart' },
];

const HAIR_COLORS = [
  { name: 'Auburn', value: 'Auburn' },
  { name: 'Black', value: 'Black' },
  { name: 'Blonde', value: 'Blonde' },
  { name: 'BlondeGolden', value: 'BlondeGolden' },
  { name: 'Brown', value: 'Brown' },
  { name: 'BrownDark', value: 'BrownDark' },
  { name: 'PastelPink', value: 'PastelPink' },
  { name: 'Platinum', value: 'Platinum' },
  { name: 'Red', value: 'Red' },
  { name: 'SilverGray', value: 'SilverGray' },
];

const EYES_STYLES = [
  { name: 'Cerrado', value: 'Close' },
  { name: 'Lloroso', value: 'Cry' },
  { name: 'Por Defecto', value: 'Default' },
  { name: 'Mareado', value: 'Dizzy' },
  { name: 'Emoji Ojos', value: 'EyeRoll' },
  { name: 'Feliz', value: 'Happy' },
  { name: 'Corazones', value: 'Hearts' },
  { name: 'Lateral', value: 'Side' },
  { name: 'Entrecerrado', value: 'Squint' },
  { name: 'Sorprendido', value: 'Surprised' },
  { name: 'Guiño', value: 'Wink' },
  { name: 'Guiño Malicioso', value: 'WinkWacky' },
];

const MOUTH_STYLES = [
  { name: 'Preocupado', value: 'Concerned' },
  { name: 'Por Defecto', value: 'Default' },
  { name: 'Disgusto', value: 'Disbelief' },
  { name: 'Comiendo', value: 'Eating' },
  { name: 'Mueca', value: 'Grimace' },
  { name: 'Triste', value: 'Sad' },
  { name: 'Gritando', value: 'ScreamOpen' },
  { name: 'Serio', value: 'Serious' },
  { name: 'Sonrisa', value: 'Smile' },
  { name: 'Lengua', value: 'Tongue' },
  { name: 'Ajustado', value: 'Twinkle' },
  { name: 'Vomitando', value: 'Vomit' },
];

const FACIAL_HAIR = [
  { name: 'Sin Vello', value: '' },
  { name: 'Barba Media', value: 'BeardMedium' },
  { name: 'Barba Ligera', value: 'BeardLight' },
  { name: 'Barba Majestuosa', value: 'BeardMajestic' },
  { name: 'Bigote Delgado', value: 'MoustacheFancy' },
  { name: 'Bigote Elegante', value: 'MoustacheMagnum' },
];

const ACCESSORIES = [
  { name: 'Sin Accesorios', value: '' },
  { name: 'Gafas Kurt', value: 'Kurt' },
  { name: 'Prescripción 01', value: 'Prescription01' },
  { name: 'Prescripción 02', value: 'Prescription02' },
  { name: 'Gafas Redondas', value: 'Round' },
  { name: 'Gafas de Sol', value: 'Sunglasses' },
  { name: 'Gafas Wayfarers', value: 'Wayfarers' },
];

const CLOTHING_COLORS = [
  { name: 'Negro', value: 'Black' },
  { name: 'Azul 01', value: 'Blue01' },
  { name: 'Azul 02', value: 'Blue02' },
  { name: 'Azul 03', value: 'Blue03' },
  { name: 'Gris 01', value: 'Gray01' },
  { name: 'Gris 02', value: 'Gray02' },
  { name: 'Heather', value: 'Heather' },
  { name: 'PastelBlue', value: 'PastelBlue' },
  { name: 'PastelGreen', value: 'PastelGreen' },
  { name: 'PastelOrange', value: 'PastelOrange' },
  { name: 'PastelRed', value: 'PastelRed' },
  { name: 'PastelYellow', value: 'PastelYellow' },
  { name: 'Rosa', value: 'Pink' },
  { name: 'Rojo', value: 'Red' },
  { name: 'Blanco', value: 'White' },
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
  skinColor: ['Tanned'],
  hairStyle: ['ShortHairShortFlat'],
  hairColor: ['Brown'],
  eyesStyle: ['Default'],
  mouthStyle: ['Smile'],
  accessoriesType: [],
  facialHairType: [],
  clothingColor: ['Blue02'],
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
      accessoriesType: Math.random() > 0.6 ? [ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)].value] : [],
      facialHairType: Math.random() > 0.7 ? [FACIAL_HAIR[Math.floor(Math.random() * FACIAL_HAIR.length)].value] : [],
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
                <div>
                  <label className="block text-white font-semibold mb-3 text-base">Tono de Piel</label>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {SKIN_COLORS.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setAvatarConfig({ ...avatarConfig, skinColor: [item.value] })}
                        className={`px-4 py-2 rounded-lg border-2 bg-white/20 backdrop-blur text-white text-xs font-medium transition-all hover:scale-105 ${
                          avatarConfig.skinColor?.[0] === item.value
                            ? 'border-white shadow-lg scale-105 bg-white/40'
                            : 'border-white/30'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-3 text-base">Estilo de Cabello</label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-white/5 rounded-lg">
                    {HAIR_STYLES.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setAvatarConfig({ ...avatarConfig, hairStyle: [item.value] })}
                        className={`p-2 rounded-lg border-2 bg-white/20 backdrop-blur text-white text-xs font-medium transition-all hover:scale-105 ${
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

                <div>
                  <label className="block text-white font-semibold mb-3 text-base">Color de Cabello</label>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {HAIR_COLORS.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setAvatarConfig({ ...avatarConfig, hairColor: [item.value] })}
                        className={`px-3 py-2 rounded-lg border-2 bg-white/20 backdrop-blur text-white text-xs font-medium transition-all hover:scale-105 ${
                          avatarConfig.hairColor?.[0] === item.value
                            ? 'border-white shadow-lg scale-105 bg-white/40'
                            : 'border-white/30'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-3 text-base">Estilo de Ojos</label>
                  <div className="grid grid-cols-4 gap-2">
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

                <div>
                  <label className="block text-white font-semibold mb-3 text-base">Estilo de Boca</label>
                  <div className="grid grid-cols-4 gap-2">
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

                <div>
                  <label className="block text-white font-semibold mb-3 text-base">Color de Ropa</label>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {CLOTHING_COLORS.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setAvatarConfig({ ...avatarConfig, clothingColor: [item.value] })}
                        className={`px-3 py-2 rounded-lg border-2 bg-white/20 backdrop-blur text-white text-xs font-medium transition-all hover:scale-105 ${
                          avatarConfig.clothingColor?.[0] === item.value
                            ? 'border-white shadow-lg scale-105 bg-white/40'
                            : 'border-white/30'
                        }`}
                      >
                        {item.name}
                      </button>
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
