import { AvatarConfig } from '../types';

interface AvatarViewProps {
  config: AvatarConfig | null;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const SIZE_MAP = {
  small: 32,
  medium: 64,
  large: 96,
};

const AVATAR_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😊', '😇', '🙂', '🙃', '😉',
  '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝',
  '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥳', '😏', '😒', '😞',
  '🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧',
  '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄',
];

const BG_COLORS = [
  'from-red-400 to-red-600',
  'from-orange-400 to-orange-600',
  'from-amber-400 to-amber-600',
  'from-yellow-400 to-yellow-600',
  'from-lime-400 to-lime-600',
  'from-green-400 to-green-600',
  'from-emerald-400 to-emerald-600',
  'from-teal-400 to-teal-600',
  'from-cyan-400 to-cyan-600',
  'from-sky-400 to-sky-600',
  'from-blue-400 to-blue-600',
  'from-indigo-400 to-indigo-600',
  'from-violet-400 to-violet-600',
  'from-purple-400 to-purple-600',
  'from-fuchsia-400 to-fuchsia-600',
  'from-pink-400 to-pink-600',
  'from-rose-400 to-rose-600',
];

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export const AvatarView = ({ config, size = 'medium', className = '' }: AvatarViewProps) => {
  const dimension = SIZE_MAP[size];

  let emoji = '😀';
  let bgColor = 'from-teal-400 to-cyan-600';

  if (config) {
    if (config.animalId) {
      emoji = config.animalId;
    } else if (config.seed) {
      const hash = hashString(config.seed);
      emoji = AVATAR_EMOJIS[hash % AVATAR_EMOJIS.length];
      bgColor = BG_COLORS[hash % BG_COLORS.length];
    }

    if (config.skinColor?.[0]) {
      const colorMap: Record<string, string> = {
        'Tanned': 'from-amber-400 to-amber-600',
        'Yellow': 'from-yellow-400 to-yellow-600',
        'Pale': 'from-orange-300 to-orange-500',
        'Light': 'from-orange-400 to-orange-600',
        'Brown': 'from-amber-600 to-amber-800',
        'DarkBrown': 'from-amber-700 to-amber-900',
        'Black': 'from-gray-700 to-gray-900',
      };
      bgColor = colorMap[config.skinColor[0]] || bgColor;
    }
  }

  return (
    <div
      className={`${className} flex items-center justify-center bg-gradient-to-br ${bgColor} rounded-full shadow-lg`}
      style={{
        width: dimension,
        height: dimension,
        fontSize: `${dimension * 0.6}px`,
      }}
    >
      <span className="select-none">{emoji}</span>
    </div>
  );
};
