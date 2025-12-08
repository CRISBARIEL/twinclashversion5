const USE_LOCAL_AUDIO = false;

export function getAudioUrl(filename: string): string {
  if (USE_LOCAL_AUDIO) {
    return `/audio/${filename}`;
  }

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const AUDIO_BASE = `${SUPABASE_URL}/storage/v1/object/public/twinclash-audio`;
  return `${AUDIO_BASE}/${filename}`;
}

export function getLevelAudioUrl(level: number): string {
  return getAudioUrl(`level_${level}.mp3`);
}

export function getStartThemeUrl(): string {
  return getAudioUrl('start_theme.mp3');
}

export function getMatchSfxUrl(): string {
  return getAudioUrl('match.wav');
}

export function getWinSfxUrl(): string {
  return getAudioUrl('win.mp3');
}

export function getLoseSfxUrl(): string {
  return getAudioUrl('lose.mp3');
}
