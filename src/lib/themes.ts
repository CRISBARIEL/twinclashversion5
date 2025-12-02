export interface Theme {
  name: string;
  images: string[];
  background: {
    gradient: string;
    pattern?: string;
  };
}

export const THEMES: Record<string, Theme> = {
  nature: {
    name: 'Naturaleza',
    images: [
      '🍃', '🌸', '🌳', '☀️', '⛰️', '🌊',
      '🦋', '🍄', '🌵', '🎋', '🌺', '🌻',
      '🌴', '🌿', '🍀', '🌹', '🌷', '🏵️'
    ],
    background: {
      gradient: 'from-green-300 via-emerald-400 to-teal-500',
      pattern: '🌿'
    }
  },
  sports: {
    name: 'Deportes',
    images: [
      '⚽', '🏀', '🎾', '🏐', '🏊',
      '🏃', '🚴', '⛳', '🥊', '🛹',
      '🏈', '⚾', '🏓', '🏒', '🎯'
    ],
    background: {
      gradient: 'from-orange-400 via-red-500 to-rose-600',
      pattern: '⚽'
    }
  },
  arcade: {
    name: 'Juegos',
    images: [
      '👾', '🕹️', '🎮', '🎲', '🃏',
      '🎰', '🎯', '🧩', '🎪', '🎭',
      '🎨', '🎬', '🎤', '🎧', '🎹',
      '🎸', '🥁', '🎺'
    ],
    background: {
      gradient: 'from-purple-500 via-pink-500 to-fuchsia-600',
      pattern: '🎮'
    }
  },
  animals: {
    name: 'Animalitos',
    images: [
      '🐱', '🐶', '🐰', '🦊', '🐼',
      '🐨', '🦁', '🐘', '🦒', '🐧',
      '🦉', '🐸', '🐢', '🦈', '🐬',
      '🦋', '🐝', '🐞'
    ],
    background: {
      gradient: 'from-yellow-300 via-amber-400 to-orange-500',
      pattern: '🐾'
    }
  },
  space: {
    name: 'Espacio',
    images: [
      '🪐', '🚀', '⭐', '🌙', '🛸',
      '☄️', '🌌', '🌠', '👨‍🚀', '🌑',
      '🌕', '🌞', '🔭', '👽', '🛰️',
      '💫', '✨', '🌟'
    ],
    background: {
      gradient: 'from-indigo-900 via-purple-900 to-slate-900',
      pattern: '✨'
    }
  },
  ocean: {
    name: 'Océano',
    images: [
      '🐠', '🐟', '🐡', '🦈', '🐬',
      '🐳', '🐋', '🦑', '🐙', '🦀',
      '🦞', '🦐', '🐚', '⛵', '🚢',
      '⚓', '🌊', '🏝️'
    ],
    background: {
      gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
      pattern: '🌊'
    }
  },
  food: {
    name: 'Comida',
    images: [
      '🍕', '🍔', '🍟', '🌭', '🥪',
      '🌮', '🌯', '🥗', '🍝', '🍜',
      '🍱', '🍣', '🍰', '🍪', '🍩',
      '🍦', '🧁', '🍓'
    ],
    background: {
      gradient: 'from-red-400 via-orange-400 to-yellow-400',
      pattern: '🍕'
    }
  },
  music: {
    name: 'Música',
    images: [
      '🎵', '🎶', '🎼', '🎹', '🎸',
      '🥁', '🎺', '🎷', '🎻', '🪕',
      '🎤', '🎧', '📻', '🔊', '🎙️',
      '🪘', '🪗', '🎚️'
    ],
    background: {
      gradient: 'from-violet-500 via-purple-600 to-indigo-700',
      pattern: '🎵'
    }
  },
  beauty: {
    name: 'Belleza',
    images: [
      '💄', '💅', '💋', '👄', '💃',
      '👗', '👠', '👜', '💍', '💐',
      '🌹', '🌺', '🎀', '✨', '💖',
      '🦋', '🌸', '💝'
    ],
    background: {
      gradient: 'from-pink-400 via-rose-400 to-red-400',
      pattern: '💖'
    }
  },
  tech: {
    name: 'Tecnología',
    images: [
      '💻', '⌨️', '🖥️', '🖱️', '🖨️',
      '📱', '☎️', '📞', '📟', '📠',
      '🔋', '🔌', '💾', '💿', '📀',
      '🎮', '🕹️', '⚡'
    ],
    background: {
      gradient: 'from-slate-700 via-gray-800 to-zinc-900',
      pattern: '💻'
    }
  },
  city: {
    name: 'Ciudad',
    images: [
      '🏙️', '🏢', '🏬', '🏦', '🏛️',
      '🏗️', '🌆', '🌃', '🚦', '🚥',
      '🚇', '🚏', '🏪', '🏨', '🏣',
      '🏤', '🏥', '🗼'
    ],
    background: {
      gradient: 'from-gray-600 via-slate-700 to-zinc-800',
      pattern: '🏙️'
    }
  },
  science: {
    name: 'Ciencia',
    images: [
      '🔬', '🧪', '🧬', '⚗️', '🦠',
      '🧫', '💉', '🩺', '🔭', '⚛️',
      '🧲', '🔋', '⚡', '💡', '🌡️',
      '📡', '🛰️', '🔌'
    ],
    background: {
      gradient: 'from-teal-500 via-cyan-600 to-blue-700',
      pattern: '⚛️'
    }
  },
  farm: {
    name: 'Granja',
    images: [
      '🐄', '🐷', '🐑', '🐓', '🐔',
      '🐴', '🐎', '🦆', '🌾', '🌽',
      '🚜', '🌻', '🥕', '🥔', '🍅',
      '🐐', '🦃', '🏡'
    ],
    background: {
      gradient: 'from-lime-400 via-green-500 to-emerald-600',
      pattern: '🌾'
    }
  },
  art: {
    name: 'Arte',
    images: [
      '🎨', '🖌️', '🖍️', '✏️', '🖊️',
      '🖋️', '✒️', '📝', '🎭', '🖼️',
      '🗿', '🏛️', '🎪', '🎬', '📸',
      '📷', '🎥', '🖨️'
    ],
    background: {
      gradient: 'from-fuchsia-400 via-pink-500 to-rose-600',
      pattern: '🎨'
    }
  },
  transport: {
    name: 'Transporte',
    images: [
      '🚗', '🚕', '🚙', '🚌', '🚎',
      '🏎️', '🚓', '🚑', '🚒', '🚐',
      '🛻', '🚚', '🚛', '🚜', '🏍️',
      '🛵', '🚲', '✈️'
    ],
    background: {
      gradient: 'from-sky-400 via-blue-500 to-cyan-600',
      pattern: '🚗'
    }
  },
  clothing: {
    name: 'Ropa',
    images: [
      '👕', '👔', '👗', '👘', '👚',
      '👖', '👙', '🩱', '👠', '👡',
      '👢', '👞', '🥾', '🧢', '👒',
      '🎩', '🧣', '🧤'
    ],
    background: {
      gradient: 'from-rose-400 via-pink-500 to-purple-500',
      pattern: '👗'
    }
  },
  dinosaurs: {
    name: 'Dinosaurios',
    images: [
      '🦕', '🦖', '🦴', '🥚', '🐊',
      '🦎', '🐢', '🐍', '🦂', '🕷️',
      '🦗', '🦟', '🐛', '🐜', '🦋',
      '🌿', '🌴', '🪨'
    ],
    background: {
      gradient: 'from-lime-500 via-green-600 to-emerald-700',
      pattern: '🦕'
    }
  },
  sweets: {
    name: 'Dulces',
    images: [
      '🍬', '🍭', '🍫', '🍩', '🍪',
      '🧁', '🍰', '🎂', '🍮', '🍯',
      '🍡', '🧇', '🥧', '🍦', '🍨',
      '🍧', '🥤', '🍹'
    ],
    background: {
      gradient: 'from-pink-300 via-rose-400 to-red-400',
      pattern: '🍭'
    }
  },
  jerseys: {
    name: 'Camisetas',
    images: [
      '🟥', '🟦', '🟩', '🟨', '🟧',
      '🟪', '🟫', '⬛', '⬜', '🔴',
      '🔵', '🟢', '🟡', '🟠', '🟣',
      '⚫', '⚪', '🔶'
    ],
    background: {
      gradient: 'from-green-500 via-emerald-600 to-teal-700',
      pattern: '⚽'
    }
  },
  eyes: {
    name: 'Ojos',
    images: [
      '👁️', '👀', '🟤', '🔵', '🟢',
      '🟡', '🔴', '🟣', '⚫', '⚪',
      '🔷', '🔶', '🟨', '🟦', '🟩',
      '🟥', '🟪', '🟧'
    ],
    background: {
      gradient: 'from-sky-300 via-blue-400 to-indigo-500',
      pattern: '👁️'
    }
  },
};

export function getThemeImages(themeName: string): string[] {
  return THEMES[themeName]?.images || THEMES.nature.images;
}

export function getThemeName(themeKey: string): string {
  return THEMES[themeKey]?.name || 'Desconocido';
}

export function getThemeBackground(themeName: string): { gradient: string; pattern?: string } {
  return THEMES[themeName]?.background || { gradient: 'from-blue-400 via-purple-500 to-pink-500' };
}
