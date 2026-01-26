import { AvatarConfig } from '../types';

interface AvatarViewProps {
  config: AvatarConfig | null;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

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
};

const EYES_VARIANTS = [
  { path: 'M38 45 A4 4 0 1 1 38 45.01 M72 45 A4 4 0 1 1 72 45.01', fill: true },
  { path: 'M35 45 A6 6 0 1 1 35 45.01 M75 45 A6 6 0 1 1 75 45.01', fill: true },
  { path: 'M38 45 A3 6 0 1 1 38 45.01 M72 45 A3 6 0 1 1 72 45.01', fill: true },
  { path: 'M40 43 L40 47 M38 45 L42 45 M70 43 L70 47 M68 45 L72 45', fill: false, stroke: 2.5 },
  { path: 'M35 42 Q40 48 45 42 M65 42 Q70 48 75 42', fill: false, stroke: 2.5 },
];

const MOUTH_VARIANTS = [
  { path: 'M40 72 Q55 82 70 72', stroke: 2.5, painted: false },
  { path: 'M40 72 Q55 77 70 72', stroke: 2.5, painted: false },
  { path: 'M42 75 L68 75', stroke: 2.5, painted: false },
  { path: 'M45 72 A10 8 0 0 0 65 72', stroke: 2.5, painted: false },
  { path: 'M40 75 Q55 70 70 75', stroke: 2.5, painted: false },
  { path: 'M40 72 Q55 82 70 72 Z', stroke: 1.5, painted: true, fill: '#DC143C' },
  { path: 'M40 72 Q55 77 70 72 Z', stroke: 1.5, painted: true, fill: '#C71585' },
  { path: 'M38 74 Q42 70 46 72 Q50 74 55 74 Q60 74 64 72 Q68 70 72 74 Q68 78 64 76 Q60 75 55 75 Q50 75 46 76 Q42 78 38 74 Z', stroke: 1, painted: true, fill: '#FF1493' },
  { path: 'M40 73 Q45 69 50 71 Q55 73 60 71 Q65 69 70 73 Q65 77 60 75 Q55 76 50 75 Q45 77 40 73 Z', stroke: 1, painted: true, fill: '#FF69B4' },
];

const HAIR_VARIANTS = [
  { d: 'M15 45 Q15 8 55 5 Q95 8 95 45 L90 40 Q90 20 55 15 Q20 20 20 40 Z' },
  { d: 'M18 42 Q18 12 55 8 Q92 12 92 42 L88 38 L84 42 L80 38 L76 42 L72 38 L68 42 L64 38 L60 42 L56 38 L52 42 L48 38 L44 42 L40 38 L36 42 L32 38 L28 42 L24 38 L22 42 Z' },
  { d: 'M20 40 Q20 15 55 10 Q90 15 90 40 M25 25 Q30 20 35 25 M45 20 Q50 15 55 20 M65 20 Q70 15 75 20 M75 25 Q80 20 85 25' },
  { d: 'M18 48 Q18 10 55 6 Q92 10 92 48 Q88 45 85 48 Q82 45 78 48 Q74 45 70 48 Q66 45 62 48 Q58 45 54 48 Q50 45 46 48 Q42 45 38 48 Q34 45 30 48 Q26 45 22 48' },
  { d: 'M20 45 L25 20 L28 45 L33 18 L36 45 L41 15 L44 45 L49 12 L52 45 L57 15 L60 45 L65 18 L68 45 L73 20 L76 45 L81 22 L84 45 L88 25 L90 45' },
  { d: 'M18 35 Q18 8 55 5 Q92 8 92 35 M17 35 Q17 40 18 50 L18 70 Q18 80 22 88 M92 35 Q92 40 91 50 L91 70 Q91 80 88 88' },
  { d: 'M16 33 Q16 8 55 5 Q94 8 94 33 M15 33 Q15 38 15 48 L15 68 Q15 78 18 86 L20 92 M94 33 Q94 38 94 48 L94 68 Q94 78 91 86 L89 92' },
  { d: 'M18 32 Q18 6 55 4 Q92 6 92 32 M17 32 L17 50 Q17 65 18 75 L19 85 Q20 90 23 94 M92 32 L92 50 Q92 65 91 75 L90 85 Q89 90 86 94' },
  { d: 'M17 34 Q17 7 55 4 Q93 7 93 34 M16 34 Q16 42 16 52 L16 72 Q16 82 19 90 L21 95 M93 34 Q93 42 93 52 L93 72 Q93 82 90 90 L88 95' },
  { d: 'M15 36 Q15 6 55 3 Q95 6 95 36 M14 36 Q14 44 14 54 L14 74 Q14 84 17 92 L19 98 M95 36 Q95 44 95 54 L95 74 Q95 84 92 92 L90 98' },
];

const BEARD_VARIANTS = [
  null,
  { d: 'M32 72 Q35 85 45 88 Q55 90 65 88 Q75 85 78 72 L76 75 Q73 82 65 84 Q55 86 45 84 Q37 82 34 75 Z' },
  { d: 'M30 75 Q32 88 42 92 Q55 95 68 92 Q78 88 80 75 Q78 78 75 85 L72 90 L68 88 L65 90 L62 88 L59 90 L56 88 L53 90 L50 88 L47 90 L44 88 L41 90 L38 88 L35 85 Q32 78 30 75' },
  { d: 'M28 70 Q30 82 40 88 Q55 92 70 88 Q80 82 82 70 L80 75 Q78 83 70 87 Q55 90 40 87 Q32 83 30 75 Z M35 82 L37 85 M42 86 L43 89 M50 87 L51 90 M58 86 L59 89 M65 82 L67 85' },
  { d: 'M33 70 Q35 80 42 86 Q50 90 55 90 Q60 90 68 86 Q75 80 77 70 Q75 75 72 82 Q68 88 60 89 Q55 90 50 89 Q42 88 38 82 Q35 75 33 70 M40 85 Q45 87 50 87 Q55 87 60 85' },
  { d: 'M30 72 Q32 85 45 90 Q55 92 65 90 Q78 85 80 72 L78 76 Q75 84 68 88 L65 86 L62 88 L59 86 L56 88 L53 86 L50 88 L47 86 L44 88 L41 86 Q34 84 32 76 Z' },
];

const MUSTACHE_VARIANTS = [
  null,
  { d: 'M40 65 Q45 62 50 63 L52 63 L53 63 L55 63 L57 63 L58 63 L60 63 Q65 62 70 65 L69 67 Q65 65 60 65 L58 65 L55 66 L52 65 L50 65 Q45 65 41 67 Z' },
  { d: 'M38 64 Q42 60 47 61 Q50 62 52 62 L55 62 L58 62 Q60 62 63 61 Q68 60 72 64 Q70 66 67 65 Q64 64 60 64 L58 64 L55 65 L52 64 L50 64 Q46 64 43 65 Q40 66 38 64' },
  { d: 'M35 66 Q40 63 45 64 Q48 64 50 65 L52 65 L55 65 L58 65 L60 65 Q62 64 65 64 Q70 63 75 66 L73 68 Q68 66 63 66 L60 67 L55 68 L50 67 L47 66 Q42 66 37 68 Z M40 66 L42 68 M68 66 L70 68' },
  { d: 'M37 65 Q43 61 48 62 Q51 63 53 64 L55 64 L57 64 Q59 63 62 62 Q67 61 73 65 Q71 67 68 66 L65 65 L62 65 L60 66 L58 66 L55 67 L52 66 L50 66 L48 65 L45 65 L42 66 Q39 67 37 65' },
  { d: 'M38 63 Q44 60 50 61 Q52 61 54 62 L55 62 L56 62 Q58 61 60 61 Q66 60 72 63 L70 65 Q66 63 62 63 L60 64 L58 64 L55 65 L52 64 L50 64 L48 63 Q44 63 40 65 Z M42 63 Q45 61 48 63 M62 63 Q65 61 68 63' },
];

const GLASSES_VARIANTS = [
  null,
  { d: 'M25 45 L30 42 L45 42 L50 45 L50 52 L45 55 L30 55 L25 52 Z M60 45 L65 42 L80 42 L85 45 L85 52 L80 55 L65 55 L60 52 Z M50 45 L60 45', stroke: '#333', strokeWidth: 2.5, fill: 'rgba(200,230,255,0.3)' },
  { d: 'M28 48 A8 8 0 1 1 28 48.01 M82 48 A8 8 0 1 1 82 48.01 M44 48 L66 48', stroke: '#1a1a1a', strokeWidth: 2.8, fill: 'rgba(100,100,100,0.15)' },
  { d: 'M24 42 L48 42 L52 46 L52 52 L48 56 L24 56 L20 52 L20 46 Z M58 42 L82 42 L86 46 L86 52 L82 56 L58 56 L54 52 L54 46 Z M52 48 L54 48', stroke: '#000', strokeWidth: 2.2, fill: 'rgba(50,50,50,0.1)' },
  { d: 'M26 44 Q26 40 36 40 Q46 40 46 44 Q46 52 36 52 Q26 52 26 44 M64 44 Q64 40 74 40 Q84 40 84 44 Q84 52 74 52 Q64 52 64 44 M46 46 L64 46', stroke: '#4a4a4a', strokeWidth: 2.5, fill: 'rgba(255,200,100,0.2)' },
  { d: 'M22 46 L26 42 L46 42 L50 46 L50 52 L46 56 L26 56 L22 52 Z M60 46 L64 42 L84 42 L88 46 L88 52 L84 56 L64 56 L60 52 Z M50 48 L60 48', stroke: '#2a2a2a', strokeWidth: 3, fill: 'rgba(0,0,0,0.2)' },
];

const HEADPHONES_VARIANTS = [
  null,
  { d: 'M20 35 Q20 15 55 10 Q90 15 90 35 M18 35 L18 50 Q18 54 22 56 L28 56 Q32 54 32 50 L32 35 M78 35 L78 50 Q78 54 82 56 L88 56 Q92 54 92 50 L92 35', stroke: '#2C3E50', strokeWidth: 3, fill: 'none', accent: '#E74C3C' },
  { d: 'M22 38 Q22 18 55 12 Q88 18 88 38 M20 38 L20 52 Q20 56 24 58 L30 58 Q34 56 34 52 L34 38 M76 38 L76 52 Q76 56 80 58 L86 58 Q90 56 90 52 L90 38', stroke: '#34495E', strokeWidth: 2.8, fill: 'none', accent: '#3498DB' },
  { d: 'M24 36 Q24 16 55 11 Q86 16 86 36 M22 36 L22 50 Q22 54 26 56 L32 56 Q36 54 36 50 L36 36 M74 36 L74 50 Q74 56 78 56 L84 56 Q88 54 88 50 L88 36', stroke: '#1ABC9C', strokeWidth: 2.5, fill: 'none', accent: '#16A085' },
  { d: 'M21 37 Q21 17 55 11 Q89 17 89 37 M19 37 L19 51 Q19 55 23 57 L29 57 Q33 55 33 51 L33 37 M77 37 L77 51 Q77 55 81 57 L87 57 Q91 55 91 51 L91 37', stroke: '#9B59B6', strokeWidth: 2.6, fill: 'none', accent: '#8E44AD' },
  { d: 'M23 36 Q23 16 55 10 Q87 16 87 36 M21 36 L21 50 Q21 54 25 56 L31 56 Q35 54 35 50 L35 36 M75 36 L75 50 Q75 54 79 56 L85 56 Q89 54 89 50 L89 36', stroke: '#E67E22', strokeWidth: 2.7, fill: 'none', accent: '#D35400' },
];

const SIZE_MAP = {
  small: 32,
  medium: 64,
  large: 96,
};

export const AvatarView = ({ config, size = 'medium', className = '' }: AvatarViewProps) => {
  const avatarConfig = { ...DEFAULT_CONFIG, ...config };
  const dimension = SIZE_MAP[size];

  const eyes = EYES_VARIANTS[avatarConfig.eyesId] || EYES_VARIANTS[0];
  const mouth = MOUTH_VARIANTS[avatarConfig.mouthId] || MOUTH_VARIANTS[0];
  const hair = HAIR_VARIANTS[avatarConfig.hairId] || HAIR_VARIANTS[0];
  const beard = avatarConfig.beardId !== null && avatarConfig.beardId >= 0
    ? BEARD_VARIANTS[avatarConfig.beardId + 1]
    : null;
  const mustache = avatarConfig.mustacheId !== null && avatarConfig.mustacheId >= 0
    ? MUSTACHE_VARIANTS[avatarConfig.mustacheId + 1]
    : null;
  const glasses = avatarConfig.glassesId !== null && avatarConfig.glassesId >= 0
    ? GLASSES_VARIANTS[avatarConfig.glassesId + 1]
    : null;
  const headphones = avatarConfig.headphonesId !== null && avatarConfig.headphonesId >= 0
    ? HEADPHONES_VARIANTS[avatarConfig.headphonesId + 1]
    : null;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 110 110"
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={`faceGradient-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={avatarConfig.faceColor} stopOpacity="1" />
          <stop offset="100%" stopColor={avatarConfig.faceColor} stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <rect
        x="20"
        y="30"
        width="70"
        height="60"
        rx="18"
        ry="18"
        fill={`url(#faceGradient-${size})`}
        stroke="#d4a574"
        strokeWidth="1"
      />

      {hair.d && (
        <path
          d={hair.d}
          fill={avatarConfig.hairColor}
          stroke={avatarConfig.hairColor}
          strokeWidth="0.5"
          opacity="0.95"
        />
      )}

      {headphones && headphones.d && (
        <g>
          <path
            d={headphones.d}
            fill={headphones.fill || 'none'}
            stroke={headphones.stroke}
            strokeWidth={headphones.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="25" cy="48" r="8" fill={headphones.accent} opacity="0.9" />
          <circle cx="85" cy="48" r="8" fill={headphones.accent} opacity="0.9" />
        </g>
      )}

      {eyes.fill ? (
        <g>
          <path
            d={eyes.path}
            fill={avatarConfig.eyeColor}
            opacity="0.9"
          />
          <path
            d={eyes.path}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            opacity="0.6"
          />
        </g>
      ) : (
        <path
          d={eyes.path}
          fill="none"
          stroke="#2C1810"
          strokeWidth={eyes.stroke || 2}
          strokeLinecap="round"
        />
      )}

      {mustache && mustache.d && (
        <path
          d={mustache.d}
          fill={avatarConfig.hairColor}
          opacity="0.9"
        />
      )}

      {mouth.painted ? (
        <path
          d={mouth.path}
          fill={mouth.fill}
          stroke="#991144"
          strokeWidth={mouth.stroke}
          strokeLinecap="round"
          opacity="0.9"
        />
      ) : (
        <path
          d={mouth.path}
          fill="none"
          stroke="#2C1810"
          strokeWidth={mouth.stroke}
          strokeLinecap="round"
        />
      )}

      {beard && beard.d && (
        <path
          d={beard.d}
          fill={avatarConfig.hairColor}
          opacity="0.9"
        />
      )}

      {glasses && glasses.d && (
        <g>
          <path
            d={glasses.d}
            fill={glasses.fill || 'none'}
            stroke={glasses.stroke}
            strokeWidth={glasses.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  );
};
