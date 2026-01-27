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
  faceShapeId: 0,
};

const FACE_SHAPES = [
  { path: 'M20 30 Q20 25 24 25 L86 25 Q90 25 90 30 L90 72 Q90 90 72 90 L38 90 Q20 90 20 72 Z', rx: 18, ry: 18, name: 'Ovalada' },
  { path: 'M25 35 Q25 25 35 25 L75 25 Q85 25 85 35 L85 75 Q85 85 75 85 L35 85 Q25 85 25 75 Z', rx: 25, ry: 25, name: 'Redonda' },
  { path: 'M25 28 L85 28 L85 88 L25 88 Z', rx: 8, ry: 8, name: 'Cuadrada' },
  { path: 'M30 25 L80 25 L80 92 L30 92 Z', rx: 10, ry: 15, name: 'Rectangular' },
  { path: 'M15 28 L95 28 L85 88 L25 88 Z', rx: 8, ry: 8, name: 'Triangular' },
  { path: 'M25 28 L85 28 L95 88 L15 88 Z', rx: 8, ry: 8, name: 'Triangular invertida' },
  { path: 'M32 28 L78 28 L78 88 L32 88 Z', rx: 12, ry: 18, name: 'Delgada' },
  { path: 'M18 32 L92 32 L92 85 L18 85 Z', rx: 15, ry: 12, name: 'Ancha' },
  { path: 'M55 25 L85 55 L55 90 L25 55 Z', rx: 10, ry: 10, name: 'Diamante' },
  { path: 'M20 40 Q20 25 30 25 L45 25 Q55 25 55 15 Q55 25 65 25 L80 25 Q90 25 90 40 L90 75 Q90 88 75 88 L35 88 Q20 88 20 75 Z', rx: 15, ry: 15, name: 'Corazón' },
  { path: 'M28 32 Q28 26 34 26 L76 26 Q82 26 82 32 L82 70 Q82 86 68 88 L42 88 Q28 86 28 70 Z', rx: 16, ry: 20, name: 'Ovalada Fina' },
  { path: 'M22 38 Q22 28 32 28 L78 28 Q88 28 88 38 L88 72 Q88 84 76 86 L34 86 Q22 84 22 72 Z', rx: 18, ry: 18, name: 'Ovalada Suave' },
  { path: 'M26 34 Q26 24 36 24 L74 24 Q84 24 84 34 L84 74 Q84 88 70 88 L40 88 Q26 88 26 74 Z', rx: 20, ry: 22, name: 'Delicada' },
  { path: 'M30 36 Q30 28 38 28 L72 28 Q80 28 80 36 L80 76 Q80 86 68 86 L42 86 Q30 86 30 76 Z', rx: 16, ry: 18, name: 'Fina' },
  { path: 'M24 42 Q24 26 32 26 L45 26 Q55 26 55 18 Q55 26 65 26 L78 26 Q86 26 86 42 L86 74 Q86 86 72 86 L38 86 Q24 86 24 74 Z', rx: 18, ry: 18, name: 'Corazón Delicado' },
];

const EYES_VARIANTS = [
  { path: 'M38 45 A4 4 0 1 1 38 45.01 M72 45 A4 4 0 1 1 72 45.01', fill: true },
  { path: 'M35 45 A6 6 0 1 1 35 45.01 M75 45 A6 6 0 1 1 75 45.01', fill: true },
  { path: 'M38 45 A3 6 0 1 1 38 45.01 M72 45 A3 6 0 1 1 72 45.01', fill: true },
  { path: 'M40 43 L40 47 M38 45 L42 45 M70 43 L70 47 M68 45 L72 45', fill: false, stroke: 2.5 },
  { path: 'M35 42 Q40 48 45 42 M65 42 Q70 48 75 42', fill: false, stroke: 2.5 },
  { path: 'M33 46 A7 7 0 1 1 33 46.01 M77 46 A7 7 0 1 1 77 46.01', fill: true, feminine: true, lashes: 'M30 42 L28 40 M33 41 L32 38 M36 41 L37 38 M74 42 L76 40 M77 41 L78 38 M80 41 L81 38' },
  { path: 'M35 45 A6 8 0 1 1 35 45.01 M75 45 A6 8 0 1 1 75 45.01', fill: true, feminine: true, lashes: 'M32 40 L30 38 M35 39 L35 36 M38 40 L40 38 M72 40 L70 38 M75 39 L75 36 M78 40 L80 38' },
  { path: 'M34 46 A6 6 0 1 1 34 46.01 M76 46 A6 6 0 1 1 76 46.01', fill: true, feminine: true, lashes: 'M31 42 L29 40 M34 41 L33 38 M37 42 L39 40 M73 42 L71 40 M76 41 L77 38 M79 42 L81 40' },
  { path: 'M36 44 A5 7 0 1 1 36 44.01 M74 44 A5 7 0 1 1 74 44.01', fill: true, feminine: true, lashes: 'M33 39 L31 37 M36 38 L36 35 M39 39 L41 37 M71 39 L69 37 M74 38 L74 35 M77 39 L79 37' },
  { path: 'M32 47 A8 6 0 1 1 32 47.01 M78 47 A8 6 0 1 1 78 47.01', fill: true, feminine: true, lashes: 'M29 43 L27 41 M32 42 L31 39 M35 42 L36 39 M38 43 L40 41 M75 43 L73 41 M78 42 L79 39 M81 42 L82 39 M84 43 L86 41' },
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
  { path: 'M44 74 Q55 78 66 74', stroke: 2, painted: false },
  { path: 'M43 73 Q55 76 67 73 Z', stroke: 1.2, painted: true, fill: '#FFB6C1' },
  { path: 'M42 74 Q48 71 52 72 Q55 73 58 72 Q62 71 68 74 Q62 77 58 76 Q55 77 52 76 Q48 77 42 74 Z', stroke: 1, painted: true, fill: '#FFC0CB' },
  { path: 'M45 73 Q55 77 65 73', stroke: 1.8, painted: false },
  { path: 'M44 74 Q49 71 53 72 Q55 73 57 72 Q61 71 66 74 Q61 76 57 75 Q55 76 53 75 Q49 76 44 74 Z', stroke: 0.8, painted: true, fill: '#FFD1DC' },
];

const HAIR_VARIANTS = [
  { d: 'M15 45 Q15 8 55 5 Q95 8 95 45 L90 40 Q90 20 55 15 Q20 20 20 40 Z' },
  { d: 'M18 42 Q18 12 55 8 Q92 12 92 42 L88 38 L84 42 L80 38 L76 42 L72 38 L68 42 L64 38 L60 42 L56 38 L52 42 L48 38 L44 42 L40 38 L36 42 L32 38 L28 42 L24 38 L22 42 Z' },
  { d: 'M20 40 Q20 15 55 10 Q90 15 90 40 M25 25 Q30 20 35 25 M45 20 Q50 15 55 20 M65 20 Q70 15 75 20 M75 25 Q80 20 85 25' },
  { d: 'M18 48 Q18 10 55 6 Q92 10 92 48 Q88 45 85 48 Q82 45 78 48 Q74 45 70 48 Q66 45 62 48 Q58 45 54 48 Q50 45 46 48 Q42 45 38 48 Q34 45 30 48 Q26 45 22 48' },
  { d: 'M20 45 L25 20 L28 45 L33 18 L36 45 L41 15 L44 45 L49 12 L52 45 L57 15 L60 45 L65 18 L68 45 L73 20 L76 45 L81 22 L84 45 L88 25 L90 45' },

  { d: 'M5 35 Q5 5 55 2 Q105 5 105 35 Q105 42 103 52 L101 68 Q99 84 95 96 Q91 105 85 112 L78 117 Q71 120 64 122 Q58 123 55 123 Q52 123 46 122 Q39 120 32 117 L25 112 Q19 105 15 96 Q11 84 9 68 L7 52 Q5 42 5 35 M0 38 Q0 50 2 64 L5 84 Q7 98 12 109 L18 118 M110 38 Q110 50 108 64 L105 84 Q103 98 98 109 L92 118' },
  { d: 'M8 36 Q8 6 55 3 Q102 6 102 36 Q102 44 100 56 L98 74 Q96 90 92 102 Q88 111 82 118 L74 124 Q68 127 62 129 Q57 130 55 130 Q53 130 48 129 Q42 127 36 124 L28 118 Q22 111 18 102 Q14 90 12 74 L10 56 Q8 44 8 36 M3 40 Q3 54 5 70 Q7 88 12 102 Q16 113 22 121 M107 40 Q107 54 105 70 Q103 88 98 102 Q94 113 88 121 M10 74 Q12 92 18 105 Q22 114 28 121 M100 74 Q98 92 92 105 Q88 114 82 121' },
  { d: 'M10 38 Q10 8 55 4 Q100 8 100 38 Q100 46 98 58 L96 76 Q94 92 90 104 Q86 113 80 120 L72 126 Q66 129 60 131 Q55 132 55 132 L50 131 Q44 129 38 126 L30 120 Q24 113 20 104 Q16 92 14 76 L12 58 Q10 46 10 38 M5 42 Q5 56 7 72 Q9 90 14 104 Q18 115 24 123 M105 42 Q105 56 103 72 Q101 90 96 104 Q92 115 86 123 M12 76 Q14 94 20 107 Q24 116 30 123 M98 76 Q96 94 90 107 Q86 116 80 123 M8 62 Q10 80 15 96 M102 62 Q100 80 95 96' },

  { d: 'M20 42 Q20 14 55 10 Q90 14 90 42 L87 40 Q87 22 55 18 Q23 22 23 40 Z M43 20 Q45 16 48 16 L52 16 Q55 17 58 16 L62 16 Q65 16 67 20 L65 22 Q63 24 59 24 L56 23 Q55 23 54 23 L51 24 Q47 24 45 22 Z M20 45 Q18 50 18 56 Q18 64 20 73 L22 84 Q23 92 26 98 M90 45 Q92 50 92 56 Q92 64 90 73 L88 84 Q87 92 84 98' },
  { d: 'M22 40 Q22 12 55 8 Q88 12 88 40 L85 38 Q85 20 55 16 Q25 20 25 38 Z M22 42 Q20 48 20 56 Q20 66 22 76 L24 88 Q25 96 28 102 M88 42 Q90 48 90 56 Q90 66 88 76 L86 88 Q85 96 82 102 M20 78 Q22 92 26 103 Q28 110 32 116 M90 78 Q88 92 84 103 Q82 110 78 116' },

  { d: 'M20 40 Q20 12 55 8 Q90 12 90 40 L87 38 Q87 20 55 16 Q23 20 23 38 Z M50 10 Q48 6 48 2 A7 7 0 1 1 48 2.01 M50 2 A9 9 0 1 1 50 2.01 M47 2 A11 11 0 1 1 47 2.01 M55 -2 A13 13 0 1 1 55 -2.01 M22 45 Q20 52 20 62 Q20 74 22 86 L24 96 Q25 102 28 106 M88 45 Q90 52 90 62 Q90 74 88 86 L86 96 Q85 102 82 106' },
  { d: 'M18 38 Q18 10 55 6 Q92 10 92 38 L89 36 Q89 18 55 14 Q21 18 21 36 Z M16 22 A9 9 0 1 1 16 22.01 M13 22 A11 11 0 1 1 13 22.01 M94 22 A9 9 0 1 1 94 22.01 M97 22 A11 11 0 1 1 97 22.01 M18 42 Q16 50 16 60 Q16 72 18 84 L20 94 Q21 100 24 104 M92 42 Q94 50 94 60 Q94 72 92 84 L90 94 Q89 100 86 104' },

  { d: 'M22 40 Q22 12 55 8 Q88 12 88 40 L85 38 Q85 20 55 16 Q25 20 25 38 Z M22 42 Q20 48 20 56 Q20 66 22 76 L24 86 L26 94 L28 100 L30 105 L32 109 L34 112 L36 115 M30 86 L32 92 L34 97 L36 101 L38 105 L40 108 M28 92 L30 97 L32 101 L34 105 L36 108 M88 42 Q90 48 90 56 Q90 66 88 76 L86 86 Q85 92 82 98' },
  { d: 'M20 40 Q20 12 55 8 Q90 12 90 40 L87 38 Q87 20 55 16 Q23 20 23 38 Z M52 18 L50 28 L52 38 L50 48 L52 58 L50 68 L52 78 L50 88 L52 96 L50 102 L52 107 M54 22 L56 32 L54 42 L56 52 L54 62 L56 72 L54 82 L56 92 L54 100 L56 105 M50 32 L52 42 L50 52 L52 62 L50 72 L52 82 L50 92 L52 100 M20 45 Q18 52 18 62 Q18 74 20 86 L22 96 Q23 102 26 106 M90 45 Q92 52 92 62 Q92 74 90 86 L88 96 Q87 102 84 106' },
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
  { d: 'M26 44 Q26 40 36 40 Q46 40 46 44 Q46 52 36 52 Q26 52 26 44 M64 44 Q64 40 74 40 Q84 40 84 44 Q84 52 74 52 Q64 52 64 44 M46 46 L64 46', stroke: '#c41e3a', strokeWidth: 2.5, fill: 'rgba(255,100,120,0.2)' },
];

const HEADPHONES_VARIANTS = [
  null,
  { d: 'M18 30 Q18 8 55 3 Q92 8 92 30 M12 32 L12 50 Q12 55 17 58 L26 58 Q31 55 31 50 L31 32 M79 32 L79 50 Q79 55 84 58 L93 58 Q98 55 98 50 L98 32', stroke: '#2C3E50', strokeWidth: 3.5, fill: 'none', accent: '#E74C3C' },
  { d: 'M20 32 Q20 10 55 5 Q90 10 90 32 M14 34 L14 52 Q14 57 19 60 L28 60 Q33 57 33 52 L33 34 M77 34 L77 52 Q77 57 82 60 L91 60 Q96 57 96 52 L96 34', stroke: '#34495E', strokeWidth: 3.2, fill: 'none', accent: '#3498DB' },
  { d: 'M22 33 Q22 11 55 6 Q88 11 88 33 M16 35 L16 52 Q16 57 21 60 L30 60 Q35 57 35 52 L35 35 M75 35 L75 52 Q75 57 80 60 L89 60 Q94 57 94 52 L94 35', stroke: '#1ABC9C', strokeWidth: 3, fill: 'none', accent: '#16A085' },
  { d: 'M19 31 Q19 9 55 4 Q91 9 91 31 M13 33 L13 51 Q13 56 18 59 L27 59 Q32 56 32 51 L32 33 M78 33 L78 51 Q78 56 83 59 L92 59 Q97 56 97 51 L97 33', stroke: '#9B59B6', strokeWidth: 3.3, fill: 'none', accent: '#8E44AD' },
  { d: 'M21 32 Q21 10 55 5 Q89 10 89 32 M15 34 L15 52 Q15 57 20 60 L29 60 Q34 57 34 52 L34 34 M76 34 L76 52 Q76 57 81 60 L90 60 Q95 57 95 52 L95 34', stroke: '#E67E22', strokeWidth: 3.1, fill: 'none', accent: '#D35400' },
];

const SIZE_MAP = {
  small: 32,
  medium: 64,
  large: 96,
};

export const AvatarView = ({ config, size = 'medium', className = '' }: AvatarViewProps) => {
  const avatarConfig = { ...DEFAULT_CONFIG, ...config };
  const dimension = SIZE_MAP[size];

  const faceShape = FACE_SHAPES[avatarConfig.faceShapeId || 0] || FACE_SHAPES[0];
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

      {hair.d && (
        <path
          d={hair.d}
          fill={avatarConfig.hairColor}
          stroke={avatarConfig.hairColor}
          strokeWidth="0.5"
          opacity="0.95"
        />
      )}

      <path
        d={faceShape.path}
        fill={`url(#faceGradient-${size})`}
        stroke="#d4a574"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

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
          <circle cx="21" cy="46" r="11" fill={headphones.accent} opacity="0.9" />
          <circle cx="89" cy="46" r="11" fill={headphones.accent} opacity="0.9" />
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
          {eyes.lashes && (
            <path
              d={eyes.lashes}
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.8"
            />
          )}
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
