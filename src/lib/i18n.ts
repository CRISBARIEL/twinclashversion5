export type Language = 'es' | 'en' | 'pt-BR';

export interface Translations {
  common: {
    back: string;
    continue: string;
    start: string;
    close: string;
    confirm: string;
    cancel: string;
    loading: string;
    coins: string;
    level: string;
    score: string;
    time: string;
    play: string;
    pause: string;
    resume: string;
    exit: string;
  };
  menu: {
    playDuel: string;
    worldMap: string;
    shop: string;
    dailyChallenge: string;
    continueLevel: string;
    claimDaily: string;
    privacyPolicy: string;
    contact: string;
    description: string;
  };
  game: {
    moves: string;
    timeBonus: string;
    finalScore: string;
    youWin: string;
    tryAgain: string;
    levelComplete: string;
    gameOver: string;
    paused: string;
    exitConfirm: string;
    exitMessage: string;
  };
  duel: {
    duelMode: string;
    createDuel: string;
    joinDuel: string;
    challengePlayers: string;
    howItWorksTitle: string;
    howItWorks1: string;
    howItWorks2: string;
    howItWorks3: string;
    roomCode: string;
    shareCode: string;
    waitingForOpponent: string;
    opponentJoined: string;
    startDuel: string;
    selectLevel: string;
    enterCode: string;
    join: string;
    youWon: string;
    youLost: string;
    tie: string;
    yourScore: string;
    opponentScore: string;
    playAgain: string;
    backToMenu: string;
  };
  worlds: {
    nature: string;
    sports: string;
    games: string;
    animals: string;
    space: string;
    ocean: string;
    food: string;
    music: string;
    beauty: string;
    technology: string;
    city: string;
    science: string;
    farm: string;
    art: string;
    transport: string;
    clothing: string;
    dinosaurs: string;
    sweets: string;
    tshirts: string;
    eyes: string;
    professions: string;
    emotions: string;
    pirates: string;
    jewels: string;
    videogames: string;
    insects: string;
    fruits: string;
    vegetables: string;
    mythology: string;
    medieval: string;
    jungle: string;
    desert: string;
    arctic: string;
    urban: string;
    fantasy: string;
    scifi: string;
    summer: string;
    spring: string;
    autumn: string;
    winter: string;
    cinema: string;
    history: string;
    superheroes: string;
    robots: string;
    aliens: string;
    castles: string;
    treasures: string;
    volcano: string;
    worldLocked: string;
    unlockWorld: string;
    completeWorld: string;
    purchase: string;
    worldUnlocked: string;
  };
  shop: {
    title: string;
    themes: string;
    powerups: string;
    purchased: string;
    buy: string;
    equipped: string;
    equip: string;
    notEnoughCoins: string;
  };
  powerups: {
    hint: string;
    hintDesc: string;
    shuffle: string;
    shuffleDesc: string;
    freeze: string;
    freezeDesc: string;
  };
  themes: {
    cat: string;
    tiger: string;
    fox: string;
    eagle: string;
    brazil: string;
    italy: string;
    croatia: string;
    ecuador: string;
    spain: string;
    france: string;
    netherlands: string;
    apple: string;
    germany: string;
    argentina: string;
    chocolate: string;
    greenEye: string;
    venezuela: string;
    blue: string;
    purple: string;
    brown: string;
  };
  obstacles: {
    stone: string;
    ice: string;
    chain: string;
    fog: string;
    lock: string;
  };
  difficulty: {
    selectDifficulty: string;
    easy: string;
    medium: string;
    hard: string;
    easyDesc: string;
    mediumDesc: string;
    hardDesc: string;
  };
}

export const translations: Record<Language, Translations> = {
  es: {
    common: {
      back: 'Volver',
      continue: 'Continuar',
      start: 'Comenzar',
      close: 'Cerrar',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      loading: 'Cargando...',
      coins: 'Monedas',
      level: 'Nivel',
      score: 'Puntos',
      time: 'Tiempo',
      play: 'Jugar',
      pause: 'Pausar',
      resume: 'Reanudar',
      exit: 'Salir',
    },
    menu: {
      playDuel: 'Jugar Duelo',
      worldMap: 'Mapa de Mundos',
      shop: 'Tienda',
      dailyChallenge: 'Desafío Diario',
      continueLevel: 'Continuar Nivel',
      claimDaily: 'Reclamar Recompensa',
      privacyPolicy: 'Política de Privacidad',
      contact: 'Contacto',
      description: 'Memoriza las parejas antes de que se acabe el tiempo',
    },
    game: {
      moves: 'Movimientos',
      timeBonus: 'Bonus de Tiempo',
      finalScore: 'Puntuación Final',
      youWin: '¡Ganaste!',
      tryAgain: 'Inténtalo de nuevo',
      levelComplete: 'Nivel Completado',
      gameOver: 'Juego Terminado',
      paused: 'Pausado',
      exitConfirm: '¿Salir del nivel?',
      exitMessage: 'Perderás todo el progreso actual',
    },
    duel: {
      duelMode: 'Modo Duelo',
      createDuel: 'Crear Duelo',
      joinDuel: 'Unirse a Duelo',
      challengePlayers: 'Desafía a otros jugadores en tiempo real',
      howItWorksTitle: '¿Cómo funciona?',
      howItWorks1: 'Crea una sala y comparte el código con tu rival',
      howItWorks2: 'Ambos juegan el mismo nivel con las mismas cartas',
      howItWorks3: '¡El más rápido en completar el nivel gana!',
      roomCode: 'Código de sala',
      shareCode: 'Compartir código',
      waitingForOpponent: 'Esperando oponente...',
      opponentJoined: '¡Oponente unido!',
      startDuel: 'Comenzar Duelo',
      selectLevel: 'Seleccionar Nivel',
      enterCode: 'Ingresa el código',
      join: 'Unirse',
      youWon: '¡Ganaste!',
      youLost: 'Perdiste',
      tie: 'Empate',
      yourScore: 'Tu puntuación',
      opponentScore: 'Puntuación del oponente',
      playAgain: 'Jugar de nuevo',
      backToMenu: 'Volver al menú',
    },
    worlds: {
      nature: 'Naturaleza',
      sports: 'Deportes',
      games: 'Juegos',
      animals: 'Animales',
      space: 'Espacio',
      ocean: 'Océano',
      food: 'Comida',
      music: 'Música',
      beauty: 'Belleza',
      technology: 'Tecnología',
      city: 'Ciudad',
      science: 'Ciencia',
      farm: 'Granja',
      art: 'Arte',
      transport: 'Transporte',
      clothing: 'Ropa',
      dinosaurs: 'Dinosaurios',
      sweets: 'Dulces',
      tshirts: 'Camisetas',
      eyes: 'Ojos',
      professions: 'Profesiones',
      emotions: 'Emociones',
      pirates: 'Piratas',
      jewels: 'Joyas',
      videogames: 'Videojuegos',
      insects: 'Insectos',
      fruits: 'Frutas',
      vegetables: 'Verduras',
      mythology: 'Mitología',
      medieval: 'Medieval',
      jungle: 'Jungla',
      desert: 'Desierto',
      arctic: 'Ártico',
      urban: 'Urbano',
      fantasy: 'Fantasía',
      scifi: 'Ciencia Ficción',
      summer: 'Verano',
      spring: 'Primavera',
      autumn: 'Otoño',
      winter: 'Invierno',
      cinema: 'Cine',
      history: 'Historia',
      superheroes: 'Superhéroes',
      robots: 'Robots',
      aliens: 'Extraterrestres',
      castles: 'Castillos',
      treasures: 'Tesoros',
      volcano: 'Volcán',
      worldLocked: 'Mundo Bloqueado',
      unlockWorld: 'Desbloquear Mundo',
      completeWorld: 'Completa el mundo anterior',
      purchase: 'Comprar',
      worldUnlocked: 'Mundo Desbloqueado',
    },
    shop: {
      title: 'Tienda',
      themes: 'Temas',
      powerups: 'Power-ups',
      purchased: 'Comprado',
      buy: 'Comprar',
      equipped: 'Equipado',
      equip: 'Equipar',
      notEnoughCoins: 'No tienes suficientes monedas',
    },
    powerups: {
      hint: 'Pista',
      hintDesc: 'Resalta una pareja disponible',
      shuffle: 'Mezclar',
      shuffleDesc: 'Reordena todas las cartas',
      freeze: 'Congelar',
      freezeDesc: 'Pausa el tiempo por 10 segundos',
    },
    themes: {
      cat: 'Tema Gato',
      tiger: 'Tema Tigre',
      fox: 'Tema Zorro',
      eagle: 'Tema Águila',
      brazil: 'Tema Brasil',
      italy: 'Tema Italia',
      croatia: 'Tema Croacia',
      ecuador: 'Tema Ecuador',
      spain: 'Tema España',
      france: 'Tema Francia',
      netherlands: 'Tema Holanda',
      apple: 'Tema Manzana',
      germany: 'Tema Alemania',
      argentina: 'Tema Argentina',
      chocolate: 'Tema Chocolate',
      greenEye: 'Tema Ojo Verde',
      venezuela: 'Tema Venezuela',
      blue: 'Tema Azul',
      purple: 'Tema Lila',
      brown: 'Tema Marrón',
    },
    obstacles: {
      stone: 'Piedra',
      ice: 'Hielo',
      chain: 'Cadena',
      fog: 'Niebla',
      lock: 'Candado',
    },
    difficulty: {
      selectDifficulty: 'Selecciona Dificultad',
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil',
      easyDesc: 'Más tiempo y menos cartas',
      mediumDesc: 'Tiempo normal y cartas normales',
      hardDesc: 'Menos tiempo y más cartas',
    },
  },
  en: {
    common: {
      back: 'Back',
      continue: 'Continue',
      start: 'Start',
      close: 'Close',
      confirm: 'Confirm',
      cancel: 'Cancel',
      loading: 'Loading...',
      coins: 'Coins',
      level: 'Level',
      score: 'Score',
      time: 'Time',
      play: 'Play',
      pause: 'Pause',
      resume: 'Resume',
      exit: 'Exit',
    },
    menu: {
      playDuel: 'Play Duel',
      worldMap: 'World Map',
      shop: 'Shop',
      dailyChallenge: 'Daily Challenge',
      continueLevel: 'Continue Level',
      claimDaily: 'Claim Reward',
      privacyPolicy: 'Privacy Policy',
      contact: 'Contact',
      description: 'Memorize the pairs before time runs out',
    },
    game: {
      moves: 'Moves',
      timeBonus: 'Time Bonus',
      finalScore: 'Final Score',
      youWin: 'You Win!',
      tryAgain: 'Try Again',
      levelComplete: 'Level Complete',
      gameOver: 'Game Over',
      paused: 'Paused',
      exitConfirm: 'Exit level?',
      exitMessage: 'You will lose all current progress',
    },
    duel: {
      duelMode: 'Duel Mode',
      createDuel: 'Create Duel',
      joinDuel: 'Join Duel',
      challengePlayers: 'Challenge other players in real-time',
      howItWorksTitle: 'How it works?',
      howItWorks1: 'Create a room and share the code with your rival',
      howItWorks2: 'Both play the same level with the same cards',
      howItWorks3: 'The fastest to complete the level wins!',
      roomCode: 'Room code',
      shareCode: 'Share code',
      waitingForOpponent: 'Waiting for opponent...',
      opponentJoined: 'Opponent joined!',
      startDuel: 'Start Duel',
      selectLevel: 'Select Level',
      enterCode: 'Enter the code',
      join: 'Join',
      youWon: 'You Won!',
      youLost: 'You Lost',
      tie: 'Tie',
      yourScore: 'Your score',
      opponentScore: 'Opponent score',
      playAgain: 'Play Again',
      backToMenu: 'Back to Menu',
    },
    worlds: {
      nature: 'Nature',
      sports: 'Sports',
      games: 'Games',
      animals: 'Animals',
      space: 'Space',
      ocean: 'Ocean',
      food: 'Food',
      music: 'Music',
      beauty: 'Beauty',
      technology: 'Technology',
      city: 'City',
      science: 'Science',
      farm: 'Farm',
      art: 'Art',
      transport: 'Transport',
      clothing: 'Clothing',
      dinosaurs: 'Dinosaurs',
      sweets: 'Sweets',
      tshirts: 'T-shirts',
      eyes: 'Eyes',
      professions: 'Professions',
      emotions: 'Emotions',
      pirates: 'Pirates',
      jewels: 'Jewels',
      videogames: 'Video Games',
      insects: 'Insects',
      fruits: 'Fruits',
      vegetables: 'Vegetables',
      mythology: 'Mythology',
      medieval: 'Medieval',
      jungle: 'Jungle',
      desert: 'Desert',
      arctic: 'Arctic',
      urban: 'Urban',
      fantasy: 'Fantasy',
      scifi: 'Sci-Fi',
      summer: 'Summer',
      spring: 'Spring',
      autumn: 'Autumn',
      winter: 'Winter',
      cinema: 'Cinema',
      history: 'History',
      superheroes: 'Superheroes',
      robots: 'Robots',
      aliens: 'Aliens',
      castles: 'Castles',
      treasures: 'Treasures',
      volcano: 'Volcano',
      worldLocked: 'World Locked',
      unlockWorld: 'Unlock World',
      completeWorld: 'Complete the previous world',
      purchase: 'Purchase',
      worldUnlocked: 'World Unlocked',
    },
    shop: {
      title: 'Shop',
      themes: 'Themes',
      powerups: 'Power-ups',
      purchased: 'Purchased',
      buy: 'Buy',
      equipped: 'Equipped',
      equip: 'Equip',
      notEnoughCoins: 'Not enough coins',
    },
    powerups: {
      hint: 'Hint',
      hintDesc: 'Highlights an available pair',
      shuffle: 'Shuffle',
      shuffleDesc: 'Rearranges all cards',
      freeze: 'Freeze',
      freezeDesc: 'Pauses time for 10 seconds',
    },
    themes: {
      cat: 'Cat Theme',
      tiger: 'Tiger Theme',
      fox: 'Fox Theme',
      eagle: 'Eagle Theme',
      brazil: 'Brazil Theme',
      italy: 'Italy Theme',
      croatia: 'Croatia Theme',
      ecuador: 'Ecuador Theme',
      spain: 'Spain Theme',
      france: 'France Theme',
      netherlands: 'Netherlands Theme',
      apple: 'Apple Theme',
      germany: 'Germany Theme',
      argentina: 'Argentina Theme',
      chocolate: 'Chocolate Theme',
      greenEye: 'Green Eye Theme',
      venezuela: 'Venezuela Theme',
      blue: 'Blue Theme',
      purple: 'Purple Theme',
      brown: 'Brown Theme',
    },
    obstacles: {
      stone: 'Stone',
      ice: 'Ice',
      chain: 'Chain',
      fog: 'Fog',
      lock: 'Lock',
    },
    difficulty: {
      selectDifficulty: 'Select Difficulty',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      easyDesc: 'More time and fewer cards',
      mediumDesc: 'Normal time and normal cards',
      hardDesc: 'Less time and more cards',
    },
  },
  'pt-BR': {
    common: {
      back: 'Voltar',
      continue: 'Continuar',
      start: 'Começar',
      close: 'Fechar',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      loading: 'Carregando...',
      coins: 'Moedas',
      level: 'Nível',
      score: 'Pontos',
      time: 'Tempo',
      play: 'Jogar',
      pause: 'Pausar',
      resume: 'Retomar',
      exit: 'Sair',
    },
    menu: {
      playDuel: 'Jogar Duelo',
      worldMap: 'Mapa de Mundos',
      shop: 'Loja',
      dailyChallenge: 'Desafio Diário',
      continueLevel: 'Continuar Nível',
      claimDaily: 'Resgatar Recompensa',
      privacyPolicy: 'Política de Privacidade',
      contact: 'Contato',
      description: 'Memorize os pares antes que o tempo acabe',
    },
    game: {
      moves: 'Movimentos',
      timeBonus: 'Bônus de Tempo',
      finalScore: 'Pontuação Final',
      youWin: 'Você Ganhou!',
      tryAgain: 'Tente novamente',
      levelComplete: 'Nível Completo',
      gameOver: 'Fim de Jogo',
      paused: 'Pausado',
      exitConfirm: 'Sair do nível?',
      exitMessage: 'Você perderá todo o progresso atual',
    },
    duel: {
      duelMode: 'Modo Duelo',
      createDuel: 'Criar Duelo',
      joinDuel: 'Entrar no Duelo',
      challengePlayers: 'Desafie outros jogadores em tempo real',
      howItWorksTitle: 'Como funciona?',
      howItWorks1: 'Crie uma sala e compartilhe o código com seu rival',
      howItWorks2: 'Ambos jogam o mesmo nível com as mesmas cartas',
      howItWorks3: 'O mais rápido a completar o nível vence!',
      roomCode: 'Código da sala',
      shareCode: 'Compartilhar código',
      waitingForOpponent: 'Aguardando oponente...',
      opponentJoined: 'Oponente entrou!',
      startDuel: 'Começar Duelo',
      selectLevel: 'Selecionar Nível',
      enterCode: 'Digite o código',
      join: 'Entrar',
      youWon: 'Você Ganhou!',
      youLost: 'Você Perdeu',
      tie: 'Empate',
      yourScore: 'Sua pontuação',
      opponentScore: 'Pontuação do oponente',
      playAgain: 'Jogar novamente',
      backToMenu: 'Voltar ao menu',
    },
    worlds: {
      nature: 'Natureza',
      sports: 'Esportes',
      games: 'Jogos',
      animals: 'Animais',
      space: 'Espaço',
      ocean: 'Oceano',
      food: 'Comida',
      music: 'Música',
      beauty: 'Beleza',
      technology: 'Tecnologia',
      city: 'Cidade',
      science: 'Ciência',
      farm: 'Fazenda',
      art: 'Arte',
      transport: 'Transporte',
      clothing: 'Roupas',
      dinosaurs: 'Dinossauros',
      sweets: 'Doces',
      tshirts: 'Camisetas',
      eyes: 'Olhos',
      professions: 'Profissões',
      emotions: 'Emoções',
      pirates: 'Piratas',
      jewels: 'Joias',
      videogames: 'Videogames',
      insects: 'Insetos',
      fruits: 'Frutas',
      vegetables: 'Vegetais',
      mythology: 'Mitologia',
      medieval: 'Medieval',
      jungle: 'Selva',
      desert: 'Deserto',
      arctic: 'Ártico',
      urban: 'Urbano',
      fantasy: 'Fantasia',
      scifi: 'Ficção Científica',
      summer: 'Verão',
      spring: 'Primavera',
      autumn: 'Outono',
      winter: 'Inverno',
      cinema: 'Cinema',
      history: 'História',
      superheroes: 'Super-heróis',
      robots: 'Robôs',
      aliens: 'Alienígenas',
      castles: 'Castelos',
      treasures: 'Tesouros',
      volcano: 'Vulcão',
      worldLocked: 'Mundo Bloqueado',
      unlockWorld: 'Desbloquear Mundo',
      completeWorld: 'Complete o mundo anterior',
      purchase: 'Comprar',
      worldUnlocked: 'Mundo Desbloqueado',
    },
    shop: {
      title: 'Loja',
      themes: 'Temas',
      powerups: 'Power-ups',
      purchased: 'Comprado',
      buy: 'Comprar',
      equipped: 'Equipado',
      equip: 'Equipar',
      notEnoughCoins: 'Moedas insuficientes',
    },
    powerups: {
      hint: 'Dica',
      hintDesc: 'Destaca um par disponível',
      shuffle: 'Embaralhar',
      shuffleDesc: 'Reorganiza todas as cartas',
      freeze: 'Congelar',
      freezeDesc: 'Pausa o tempo por 10 segundos',
    },
    themes: {
      cat: 'Tema Gato',
      tiger: 'Tema Tigre',
      fox: 'Tema Raposa',
      eagle: 'Tema Águia',
      brazil: 'Tema Brasil',
      italy: 'Tema Itália',
      croatia: 'Tema Croácia',
      ecuador: 'Tema Equador',
      spain: 'Tema Espanha',
      france: 'Tema França',
      netherlands: 'Tema Holanda',
      apple: 'Tema Maçã',
      germany: 'Tema Alemanha',
      argentina: 'Tema Argentina',
      chocolate: 'Tema Chocolate',
      greenEye: 'Tema Olho Verde',
      venezuela: 'Tema Venezuela',
      blue: 'Tema Azul',
      purple: 'Tema Lilás',
      brown: 'Tema Marrom',
    },
    obstacles: {
      stone: 'Pedra',
      ice: 'Gelo',
      chain: 'Corrente',
      fog: 'Neblina',
      lock: 'Cadeado',
    },
    difficulty: {
      selectDifficulty: 'Selecione a Dificuldade',
      easy: 'Fácil',
      medium: 'Médio',
      hard: 'Difícil',
      easyDesc: 'Mais tempo e menos cartas',
      mediumDesc: 'Tempo normal e cartas normais',
      hardDesc: 'Menos tempo e mais cartas',
    },
  },
};

export function getBrowserLanguage(): Language {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('pt')) {
    return 'pt-BR';
  }
  if (browserLang.startsWith('es')) {
    return 'es';
  }
  return 'en';
}

export function getStoredLanguage(): Language {
  const stored = localStorage.getItem('gameLanguage') as Language | null;
  if (stored && (stored === 'es' || stored === 'en' || stored === 'pt-BR')) {
    return stored;
  }
  return getBrowserLanguage();
}

export function setStoredLanguage(lang: Language): void {
  localStorage.setItem('gameLanguage', lang);
}
