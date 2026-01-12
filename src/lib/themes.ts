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
      '/argentina.png', '/brasil.png', '/croacia.png', '/españa.png', '/italia.png',
      '/venezuela.png', '/ecuador.png', '/holanda.png', '/alemania.png', '/francia.png',
      '⚽', '🏆', '⭐', '🎖️', '🥇',
      '🏅', '🥈', '🥉'
    ],
    background: {
      gradient: 'from-green-500 via-emerald-600 to-teal-700',
      pattern: '⚽'
    }
  },
  eyes: {
    name: 'Ojos',
    images: [
      '/ojo_verde.png', '/agila.png', '/cat.png', '/tigre.png', '/zorro.png',
      '/marron.png', '/azul.png', '/lila.png', '/manzana.png', '👁️',
      '👀', '🔵', '🟢', '🟤', '⚫',
      '🟡', '🟠', '🔴'
    ],
    background: {
      gradient: 'from-sky-300 via-blue-400 to-indigo-500',
      pattern: '👁️'
    }
  },
  professions: {
    name: 'Profesiones',
    images: [
      '👨‍⚕️', '👮‍♂️', '👨‍🍳', '👩‍⚕️', '👨‍🚒',
      '👨‍🏫', '👨‍✈️', '👨‍🚀', '👷‍♂️', '👨‍🌾',
      '👩‍💼', '👨‍💻', '🧑‍🔬', '👨‍🎨', '👩‍🏭',
      '👨‍⚖️', '👩‍🔧', '🧑‍🚒'
    ],
    background: {
      gradient: 'from-blue-400 via-indigo-500 to-purple-600',
      pattern: '👨‍💼'
    }
  },
  emotions: {
    name: 'Emociones',
    images: [
      '😀', '😢', '😡', '😮', '😱',
      '😍', '😴', '😎', '😒', '😤',
      '🤗', '😂', '😭', '🤯', '🥳',
      '😇', '🤔', '😏'
    ],
    background: {
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      pattern: '😀'
    }
  },
  pirates: {
    name: 'Piratas',
    images: [
      '🏴‍☠️', '💎', '🏴‍☠️', '⚔️', '🦜',
      '🗺️', '💣', '🍺', '🚢', '🪝',
      '⚓', '🏝️', '🪙', '🧭', '⛵',
      '🔱', '🎯', '👁️'
    ],
    background: {
      gradient: 'from-slate-700 via-amber-800 to-orange-900',
      pattern: '🏴‍☠️'
    }
  },
  jewels: {
    name: 'Joyas',
    images: [
      '💎', '💍', '💠', '🔷', '🔶',
      '🟣', '📿', '🏅', '👑', '⭐',
      '✨', '🌟', '💫', '⚜️', '🔱',
      '🏺', '🎖️', '🥇'
    ],
    background: {
      gradient: 'from-purple-600 via-pink-500 to-rose-400',
      pattern: '💎'
    }
  },
  videogames: {
    name: 'Videojuegos',
    images: [
      '🎮', '🕹️', '👾', '🎯', '🎲',
      '🃏', '🎰', '🧩', '🎪', '🎭',
      '🏆', '⚡', '🔫', '🗡️', '🛡️',
      '🎨', '🎬', '🎤'
    ],
    background: {
      gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
      pattern: '🎮'
    }
  },
  insects: {
    name: 'Insectos',
    images: [
      '🦋', '🐝', '🐜', '🪲', '🦗',
      '🕷️', '🪰', '🪳', '🦟', '🐛',
      '🐞', '🦂', '🕸️', '🌸', '🍃',
      '🌿', '🌺', '🌼'
    ],
    background: {
      gradient: 'from-lime-400 via-green-500 to-emerald-600',
      pattern: '🦋'
    }
  },
  fruits: {
    name: 'Frutas',
    images: [
      '🍎', '🍌', '🍓', '🍊', '🍇',
      '🥝', '🍍', '🍉', '🍈', '🥭',
      '🍑', '🍒', '🫐', '🥥', '🍋',
      '🍐', '🍏', '🫒'
    ],
    background: {
      gradient: 'from-red-400 via-orange-400 to-yellow-400',
      pattern: '🍎'
    }
  },
  vegetables: {
    name: 'Verduras',
    images: [
      '🥕', '🥦', '🍅', '🥬', '🧅',
      '🌶️', '🥒', '🥬', '🥔', '🧄',
      '🌽', '🫑', '🍆', '🥗', '🫛',
      '🧆', '🥙', '🌮'
    ],
    background: {
      gradient: 'from-green-400 via-lime-500 to-emerald-600',
      pattern: '🥕'
    }
  },
  bottles: {
    name: 'Botellas',
    images: [
      '🍾', '🍷', '🍸', '🍹', '🍺',
      '🍻', '🥂', '🥃', '🧃', '🧋',
      '🥤', '🧉', '🍶', '🧪', '⚗️',
      '🔵', '🟢', '🔴'
    ],
    background: {
      gradient: 'from-teal-500 via-cyan-600 to-blue-700',
      pattern: '🍾'
    }
  },
  castle: {
    name: 'Castillo',
    images: [
      '🏰', '🗡️', '🛡️', '👑', '⚔️',
      '🏹', '🪓', '🎯', '🏆', '🗝️',
      '🎪', '🎭', '🎨', '🎬', '🎤',
      '🎧', '🎹', '🎺'
    ],
    background: {
      gradient: 'from-stone-600 via-slate-700 to-gray-800',
      pattern: '🏰'
    }
  },
  forest: {
    name: 'Bosque',
    images: [
      '🌲', '🌳', '🌴', '🌱', '🍃',
      '🍂', '🍁', '🌿', '☘️', '🍀',
      '🌾', '🪵', '🦌', '🦉', '🐿️',
      '🦡', '🦝', '🐻'
    ],
    background: {
      gradient: 'from-green-600 via-emerald-700 to-teal-800',
      pattern: '🌲'
    }
  },
  mountains: {
    name: 'Montañas',
    images: [
      '⛰️', '🏔️', '🗻', '🏞️', '🌄',
      '🌅', '🌆', '🌇', '🏕️', '⛺',
      '🎿', '🏂', '⛷️', '🧗', '🥾',
      '🪨', '🏔️', '⛰️'
    ],
    background: {
      gradient: 'from-slate-500 via-gray-600 to-stone-700',
      pattern: '⛰️'
    }
  },
  snow: {
    name: 'Nieve',
    images: [
      '❄️', '⛄', '☃️', '⛸️', '🎿',
      '🏂', '⛷️', '🧊', '💎', '🌨️',
      '🌬️', '💨', '🥶', '🧤', '🧣',
      '🎅', '🤶', '🎁'
    ],
    background: {
      gradient: 'from-sky-300 via-blue-400 to-indigo-500',
      pattern: '❄️'
    }
  },
  locations: {
    name: 'Lugares',
    images: [
      '🗺️', '📍', '🗼', '🗽', '🗿',
      '🏛️', '⛩️', '🕌', '🏰', '🏟️',
      '🎡', '🎢', '🎠', '⛱️', '🏖️',
      '🏝️', '🏜️', '🌍'
    ],
    background: {
      gradient: 'from-amber-400 via-orange-500 to-red-600',
      pattern: '📍'
    }
  },
  cups: {
    name: 'Tazas',
    images: [
      '☕', '🍵', '🥤', '🧃', '🧋',
      '🫖', '🥛', '🍼', '🏆', '🥇',
      '🥈', '🥉', '🎖️', '🏅', '⚱️',
      '🔵', '🟢', '🔴'
    ],
    background: {
      gradient: 'from-amber-500 via-yellow-600 to-orange-700',
      pattern: '☕'
    }
  },
  energy: {
    name: 'Energía',
    images: [
      '⚡', '🔋', '🔌', '💡', '🔆',
      '☀️', '🌞', '🌟', '✨', '💫',
      '⭐', '🌠', '💥', '🔥', '🌪️',
      '🌊', '💨', '⚛️'
    ],
    background: {
      gradient: 'from-yellow-400 via-orange-500 to-red-600',
      pattern: '⚡'
    }
  },
  summer: {
    name: 'Verano',
    images: [
      '☀️', '🌞', '🏖️', '🏝️', '⛱️',
      '🌊', '🏄', '🏊', '🍉', '🍦',
      '🍹', '🕶️', '👙', '🩱', '🩳',
      '🐚', '🦀', '🐠'
    ],
    background: {
      gradient: 'from-yellow-300 via-orange-400 to-red-500',
      pattern: '☀️'
    }
  },
  spring: {
    name: 'Primavera',
    images: [
      '🌸', '🌺', '🌻', '🌼', '🌷',
      '🌹', '🏵️', '🌱', '🌿', '☘️',
      '🍀', '🌾', '🦋', '🐝', '🐞',
      '🐛', '🌈', '☁️'
    ],
    background: {
      gradient: 'from-pink-300 via-rose-400 to-red-500',
      pattern: '🌸'
    }
  },
  autumn: {
    name: 'Otoño',
    images: [
      '🍂', '🍁', '🍃', '🌾', '🍊',
      '🌰', '🦃', '🍄', '🌻', '🌾',
      '🍇', '🍎', '🍊', '🥧', '☕',
      '🧣', '🍂', '🍁'
    ],
    background: {
      gradient: 'from-orange-500 via-amber-600 to-yellow-700',
      pattern: '🍂'
    }
  },
  winter: {
    name: 'Invierno',
    images: [
      '❄️', '⛄', '☃️', '🌨️', '🌬️',
      '💨', '🧊', '⛸️', '🎿', '🏂',
      '⛷️', '🧤', '🧣', '🎅', '🤶',
      '🎁', '🔔', '🕯️'
    ],
    background: {
      gradient: 'from-blue-300 via-cyan-400 to-sky-500',
      pattern: '❄️'
    }
  },
  cinema: {
    name: 'Cine',
    images: [
      '🎬', '🎥', '📽️', '🎞️', '🎭',
      '🎪', '🎨', '🎤', '🎧', '📸',
      '📷', '📹', '🍿', '🎫', '🏆',
      '⭐', '🌟', '✨'
    ],
    background: {
      gradient: 'from-red-700 via-rose-800 to-pink-900',
      pattern: '🎬'
    }
  },
  history: {
    name: 'Historia',
    images: [
      '📜', '📖', '📚', '🏛️', '🗿',
      '⚔️', '🛡️', '👑', '🗝️', '🏺',
      '🏰', '⚱️', '🕯️', '📯', '🎺',
      '🗡️', '🏹', '🪓'
    ],
    background: {
      gradient: 'from-amber-700 via-orange-800 to-brown-900',
      pattern: '📜'
    }
  },
  superheroes: {
    name: 'Superhéroes',
    images: [
      '🦸', '🦹', '💪', '⚡', '🔥',
      '❄️', '🌪️', '🌊', '🕷️', '🧟‍♂️',
      '⚔️', '🛡️', '💥', '💫', '⭐',
      '🌟', '✨', '🏆'
    ],
    background: {
      gradient: 'from-blue-600 via-indigo-700 to-purple-800',
      pattern: '🦸'
    }
  },
  robots: {
    name: 'Robots',
    images: [
      '🤖', '🦾', '🦿', '⚙️', '🔩',
      '🔧', '🔨', '⚡', '🔋', '💻',
      '⌨️', '🖥️', '📱', '🔌', '💾',
      '💿', '📡', '🛰️'
    ],
    background: {
      gradient: 'from-gray-600 via-slate-700 to-zinc-800',
      pattern: '🤖'
    }
  },
  astronauts: {
    name: 'Astronautas',
    images: [
      '👨‍🚀', '👩‍🚀', '🚀', '🛰️', '🌌',
      '🌠', '🪐', '⭐', '🌟', '💫',
      '✨', '🌙', '☄️', '🔭', '🌕',
      '🌑', '🌎', '🛸'
    ],
    background: {
      gradient: 'from-indigo-900 via-blue-950 to-slate-950',
      pattern: '👨‍🚀'
    }
  },
  castles: {
    name: 'Castillos',
    images: [
      '🏰', '🗡️', '🛡️', '👑', '⚔️',
      '🏹', '🪓', '🎯', '🏆', '🗝️',
      '🚪', '🪟', '🕯️', '🔔', '📯',
      '🎺', '🏛️', '⛩️'
    ],
    background: {
      gradient: 'from-slate-700 via-gray-800 to-stone-900',
      pattern: '🏰'
    }
  },
  treasures: {
    name: 'Tesoros',
    images: [
      '💎', '💰', '🪙', '💵', '💴',
      '💶', '💷', '💳', '🏆', '🥇',
      '🥈', '🥉', '🏅', '🎖️', '👑',
      '💍', '📿', '🔱'
    ],
    background: {
      gradient: 'from-yellow-500 via-amber-600 to-orange-700',
      pattern: '💎'
    }
  },
  volcano: {
    name: 'Volcán',
    images: [
      '🌋', '🔥', '💥', '⚡', '💨',
      '🌪️', '☄️', '🪨', '🗻', '⛰️',
      '🏔️', '💎', '🔶', '🔥', '🌡️',
      '💧', '🌊', '🌈'
    ],
    background: {
      gradient: 'from-red-700 via-orange-800 to-yellow-900',
      pattern: '🌋'
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
