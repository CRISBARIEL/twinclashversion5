let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;
let currentLevel = 1;

const proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proxy-audio`;

const LEVEL_MUSIC: Record<string, string> = {
  'start': `${proxyUrl}?id=11emXBwP8Eh5Ab1-g0iE_6ur9aSd1Mlg0`,
  '1': `${proxyUrl}?id=1_SmRaOJLpStZkeE2CJTwbGc0wl40JHHt`,
  '2': `${proxyUrl}?id=1RZJnneed5RDjCFRk_qJTN7vgqSh8l6iq`,
  '3': `${proxyUrl}?id=1ROiU_daRdwvFDGyP-7lqjgUGPiu-tNud`,
  '4': `${proxyUrl}?id=1z8uc4xwAU6p0ByRagyxtopdRuTSWw6g6`,
  '5': `${proxyUrl}?id=1gPF6ZeGedoteadPQ4r1lz7X9tL3k4nf0`,
  '6': `${proxyUrl}?id=1ftqAtZtGsUsaXkY1ktkBBmjz7R25uRzG`,
  '7': `${proxyUrl}?id=12zL4eFNLBnTdEAKeXdFuaVAwwSmCP7G5`,
  '8': `${proxyUrl}?id=1ndIQpNRME0zw8ybqp_UIGE0LYexEgt3-`,
  '9': `${proxyUrl}?id=1ndIQpNRME0zw8ybqp_UIGE0LYexEgt3-`,
  '10': `${proxyUrl}?id=1ndIQpNRME0zw8ybqp_UIGE0LYexEgt3-`,
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
