import { getStartThemeUrl, getLevelAudioUrl } from './audioLoader';

let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;
let currentLevel = 1;

const LEVEL_MUSIC: Record<string, string> = {
  'start': getStartThemeUrl(),
  '1': getLevelAudioUrl(1),
  '2': getLevelAudioUrl(2),
  '3': getLevelAudioUrl(3),
  '4': getLevelAudioUrl(4),
  '5': getLevelAudioUrl(5),
  '6': getLevelAudioUrl(6),
  '7': getLevelAudioUrl(7),
  '8': getLevelAudioUrl(8),
  '9': getLevelAudioUrl(9),
  '10': getLevelAudioUrl(10),
};

export const playMusic = async (level?: number): Promise<void> => {
  try {
    if (level !== undefined) {
      currentLevel = level;
    }

    stopMusic();

    const worldNumber = Math.ceil(currentLevel / 5);
    let musicKey: string;
    if (worldNumber <= 10) {
      musicKey = worldNumber.toString();
    } else if (worldNumber === 11 || worldNumber === 12) {
      musicKey = '10';
    } else {
      musicKey = ((worldNumber - 13) % 3 + 1).toString();
    }
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
