import { AvatarConfig } from '../types';

interface AvatarViewProps {
  config: AvatarConfig | null;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const DEFAULT_CONFIG: AvatarConfig = {
  faceColor: '#FFD1A0',
  eyesId: 0,
  mouthId: 0,
  hairId: 0,
  accessoryId: null,
};

const EYES_VARIANTS = [
  { path: 'M35 45 L45 45 M65 45 L75 45', stroke: 3 },
  { path: 'M40 40 A5 5 0 1 1 40 50 A5 5 0 1 1 40 40 M70 40 A5 5 0 1 1 70 50 A5 5 0 1 1 70 40', stroke: 2 },
  { path: 'M35 42 Q40 48 45 42 M65 42 Q70 48 75 42', stroke: 2.5 },
  { path: 'M38 45 L42 45 M68 45 L72 45', stroke: 4 },
  { path: 'M35 45 Q40 40 45 45 M65 45 Q70 40 75 45', stroke: 2.5 },
];

const MOUTH_VARIANTS = [
  { path: 'M40 70 Q55 80 70 70', stroke: 2.5 },
  { path: 'M40 70 Q55 75 70 70', stroke: 2.5 },
  { path: 'M40 75 L70 75', stroke: 2.5 },
  { path: 'M45 70 A10 10 0 0 0 65 70', stroke: 2.5 },
  { path: 'M40 75 Q55 70 70 75', stroke: 2.5 },
];

const HAIR_VARIANTS = [
  { d: 'M20 40 Q20 10 55 10 Q90 10 90 40', fill: '#2C1810' },
  { d: 'M25 35 Q25 15 55 10 Q85 15 85 35 L80 30 L75 35 L70 30 L65 35 L60 30 L55 35 L50 30 L45 35 L40 30 L35 35 L30 30 Z', fill: '#8B4513' },
  { d: 'M30 40 Q30 20 55 15 Q80 20 80 40 M35 25 L40 35 M50 20 L52 32 M65 25 L70 35', fill: '#FFD700' },
  { d: 'M20 45 Q20 15 55 10 Q90 15 90 45 L85 40 Q85 35 80 35 L75 45 Q70 40 65 40 L60 45 Q55 40 50 40 L45 45 Q40 40 35 40 L30 45', fill: '#FF6347' },
  { d: 'M25 40 L30 20 L35 40 L40 18 L45 40 L50 15 L55 40 L60 18 L65 40 L70 20 L75 40 L80 25 L85 40', fill: '#4169E1' },
];

const ACCESSORY_VARIANTS = [
  null,
  { d: 'M30 48 L25 45 L25 52 L30 49 M80 48 L85 45 L85 52 L80 49', fill: '#333', name: 'glasses' },
  { d: 'M45 62 Q55 58 65 62 L64 64 Q55 61 46 64 Z', fill: '#2C1810', name: 'mustache' },
  { d: 'M40 35 Q45 30 50 35 M60 35 Q65 30 70 35', fill: 'none', stroke: '#2C1810', name: 'eyebrows' },
];

const SIZE_MAP = {
  small: 32,
  medium: 64,
  large: 96,
};

export const AvatarView = ({ config, size = 'medium', className = '' }: AvatarViewProps) => {
  const avatarConfig = config || DEFAULT_CONFIG;
  const dimension = SIZE_MAP[size];

  const eyes = EYES_VARIANTS[avatarConfig.eyesId] || EYES_VARIANTS[0];
  const mouth = MOUTH_VARIANTS[avatarConfig.mouthId] || MOUTH_VARIANTS[0];
  const hair = HAIR_VARIANTS[avatarConfig.hairId] || HAIR_VARIANTS[0];
  const accessory = avatarConfig.accessoryId !== null && avatarConfig.accessoryId >= 0
    ? ACCESSORY_VARIANTS[avatarConfig.accessoryId + 1]
    : null;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 110 110"
      className={className}
      style={{ display: 'block' }}
    >
      <circle cx="55" cy="55" r="50" fill={avatarConfig.faceColor} />

      {hair.d && (
        <path d={hair.d} fill={hair.fill} />
      )}

      <g>
        <path
          d={eyes.path}
          fill="none"
          stroke="#2C1810"
          strokeWidth={eyes.stroke}
          strokeLinecap="round"
        />
      </g>

      <g>
        <path
          d={mouth.path}
          fill="none"
          stroke="#2C1810"
          strokeWidth={mouth.stroke}
          strokeLinecap="round"
        />
      </g>

      {accessory && (
        <g>
          {accessory.d && (
            <path
              d={accessory.d}
              fill={accessory.fill || 'none'}
              stroke={accessory.stroke || 'none'}
              strokeWidth={2}
            />
          )}
        </g>
      )}
    </svg>
  );
};
