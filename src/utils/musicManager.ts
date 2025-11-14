let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;
let currentLevel = 1;

const LEVEL_MUSIC: Record<string, string> = {
  'start': '/audio/start_theme.mp3',
  '1': '/audio/level_1.mp3',
  '2': '/audio/level_2.mp3',
  '3': '/audio/level_3.mp3',
  '4': '/audio/level_4.mp3',
  '5': '/audio/level_5.mp3',
  '6': '/audio/level_6.mp3',
  '7': '/audio/level_7.mp3',
  '8': '/audio/level_8.mp3',
  '9': '/audio/level_9.mp3',
  '10': '/audio/level_10.mp3',
};

export const playMusic = async (level?: number): Promise<void> => {
  try {
    if (level !== undefined) {
      currentLevel = level;
    }

    stopMusic();

    const worldNumber = Math.ceil(currentLevel / 5);
    const musicKey = worldNumber > 10 ? '10' : worldNumber.toString();
    const audioSrc = LEVEL_MUSIC[musicKey] || LEVEL_MUSIC['1'];

    currentAudio = new Audio(audioSrc);
    currentAudio.loop = true;
    currentAudio.volume = 0.4;

    await currentAudio.play();
    isPlaying = true;
  } catch (error) {
    console.log('Error playing music:', error);
  }
};

export const playStartTheme = async (): Promise<void> => {
  try {
    stopMusic();

    currentAudio = new Audio(LEVEL_MUSIC['start']);
    currentAudio.loop = true;
    currentAudio.volume = 0.4;

    await currentAudio.play();
    isPlaying = true;
  } catch (error) {
    console.log('Error playing start theme:', error);
  }
};

export const stopMusic = (): void => {
  if (!currentAudio) return;

  try {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
    isPlaying = false;
  } catch (error) {
    console.log('Error stopping music:', error);
  }
};

export const getMusicInstance = (): HTMLAudioElement | null => {
  return currentAudio;
};
