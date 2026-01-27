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
  { d: 'M4 36 Q4 4 55 1 Q106 4 106 36 Q110 40 110 48 Q110 56 108 66 L106 82 Q104 96 97 106 L92 112 M4 36 Q0 40 0 48 Q0 56 2 66 L4 82 Q6 96 13 106 L18 112 M0 36 Q0 46 2 60 L4 80 Q5 94 12 104 L17 112 M110 36 Q110 46 108 60 L106 80 Q105 94 98 104 L93 112 M2 50 Q0 58 4 68 Q6 78 10 88 Q12 96 16 104 M108 50 Q110 58 106 68 Q104 78 100 88 Q98 96 94 104 M18 8 Q8 12 3 25 M92 8 Q102 12 107 25 M8 18 Q5 23 5 28 M102 18 Q105 23 105 28' },
  { d: 'M2 34 Q2 2 55 0 Q108 2 108 34 Q112 38 112 46 Q112 56 110 68 L108 86 Q106 100 99 110 L94 116 M2 34 Q-2 38 -2 46 Q-2 56 0 68 L2 86 Q4 100 11 110 L16 116 M-2 34 Q-2 44 0 58 L2 80 Q3 94 10 104 L15 116 M112 34 Q112 44 110 58 L108 80 Q107 94 100 104 L95 116 M0 48 Q-2 56 2 68 Q4 78 8 88 Q10 96 14 104 M110 48 Q112 56 108 68 Q106 78 102 88 Q100 96 96 104 M16 6 Q6 10 1 22 M94 6 Q104 10 109 22 M6 16 Q3 21 3 26 M104 16 Q107 21 107 26 M-2 58 Q-1 68 1 78 M112 58 Q111 68 109 78' },
  { d: 'M3 33 Q3 1 55 -1 Q107 1 107 33 Q111 37 111 45 Q111 55 109 67 L107 85 Q105 99 98 109 L93 115 M3 33 Q-1 37 -1 45 Q-1 55 1 67 L3 85 Q5 99 12 109 L17 115 M-1 33 L-1 55 Q-1 72 2 86 L5 100 Q8 108 16 115 M111 33 L111 55 Q111 72 108 86 L105 100 Q102 108 94 115 M1 42 Q-1 50 3 62 Q5 72 8 82 Q10 92 14 100 M109 42 Q111 50 107 62 Q105 72 102 82 Q100 92 96 100 M17 5 Q7 9 2 21 M93 5 Q103 9 108 21 M7 15 Q4 20 4 25 M103 15 Q106 20 106 25' },
  { d: 'M2 35 Q2 3 55 0 Q108 3 108 35 Q112 39 112 47 Q112 57 110 69 L108 87 Q106 101 99 111 L94 117 M2 35 Q-2 39 -2 47 Q-2 57 0 69 L2 87 Q4 101 11 111 L16 117 M-2 35 Q-2 45 0 59 L2 82 Q3 96 10 106 L15 117 M112 35 Q112 45 110 59 L108 82 Q107 96 100 106 L95 117 M0 49 Q-2 57 2 69 Q4 79 8 89 Q10 97 14 105 M110 49 Q112 57 108 69 Q106 79 102 89 Q100 97 96 105 M16 7 Q6 11 1 23 M94 7 Q104 11 109 23 M6 17 Q3 22 3 27 M104 17 Q107 22 107 27' },
  { d: 'M1 37 Q1 1 55 -2 Q109 1 109 37 Q113 41 113 49 Q113 59 111 71 L109 89 Q107 103 100 113 L95 119 M1 37 Q-3 41 -3 49 Q-3 59 -1 71 L1 89 Q3 103 10 113 L15 119 M-3 37 Q-3 47 -1 61 L1 84 Q2 98 9 108 L14 119 M113 37 Q113 47 111 61 L109 84 Q108 98 101 108 L96 119 M-1 51 Q-3 59 1 71 Q3 81 7 91 Q9 99 13 107 M111 51 Q113 59 109 71 Q107 81 103 91 Q101 99 97 107 M15 4 Q5 8 0 20 M95 4 Q105 8 110 20 M5 14 Q2 19 2 24 M105 14 Q108 19 108 24' },
  { d: 'M12 38 Q12 6 55 3 Q98 6 98 38 L94 36 Q94 20 80 15 Q70 12 55 12 Q40 12 30 15 Q16 20 16 36 Z M10 40 Q10 48 12 60 L14 75 Q15 85 20 92 M100 40 Q100 48 98 60 L96 75 Q95 85 90 92' },
  { d: 'M15 42 Q15 10 55 6 Q95 10 95 42 Q91 38 87 42 Q83 38 79 42 Q75 38 71 42 Q67 38 63 42 Q59 38 55 42 Q51 38 47 42 Q43 38 39 42 Q35 38 31 42 Q27 38 23 42 Q19 38 18 42 M12 45 Q10 50 12 60 Q14 70 16 80 Q18 88 22 95 M98 45 Q100 50 98 60 Q96 70 94 80 Q92 88 88 95' },
  { d: 'M10 40 Q10 8 55 4 Q100 8 100 40 M14 42 Q14 52 16 65 L18 80 Q19 90 24 98 L28 105 M96 42 Q96 52 94 65 L92 80 Q91 90 86 98 L82 105 M55 8 Q45 10 35 15 Q25 22 20 32 M55 8 Q65 10 75 15 Q85 22 90 32 M18 48 Q16 58 18 70 M92 48 Q94 58 92 70' },
  { d: 'M8 38 Q8 6 55 2 Q102 6 102 38 Q106 42 106 50 Q106 60 104 72 L102 88 Q100 100 93 108 L88 114 M8 38 Q4 42 4 50 Q4 60 6 72 L8 88 Q10 100 17 108 L22 114 M4 40 Q2 48 4 60 Q6 72 10 85 Q12 95 18 105 M106 40 Q108 48 106 60 Q104 72 100 85 Q98 95 92 105 M20 10 Q10 14 5 26 M90 10 Q100 14 105 26' },
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
