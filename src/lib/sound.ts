/**
 * SoundManager - Gestión de música y efectos de sonido del juego
 * No requiere librerías externas, usa HTMLAudioElement nativo
 */

class SoundManager {
  private startMusicTrack: HTMLAudioElement | null = null;
  private currentLevelTrack: HTMLAudioElement | null = null;
  private levelTracks: Map<number, HTMLAudioElement> = new Map();

  private matchSfx: HTMLAudioElement | null = null;
  private winSfx: HTMLAudioElement | null = null;
  private loseSfx: HTMLAudioElement | null = null;

  private muted: boolean = false;
  private masterVolume: number = 1.0;
  private userInteracted: boolean = false;

  constructor() {
    this.loadSettings();
    this.preloadAudio();
    this.setupUserInteractionListener();
    this.setupAppLifecycleListeners();
  }

  private loadSettings(): void {
    try {
      const savedMuted = localStorage.getItem('sound.muted');
      const savedVolume = localStorage.getItem('sound.volume');

      if (savedMuted !== null) {
        this.muted = savedMuted === 'true';
      }

      if (savedVolume !== null) {
        const volume = parseFloat(savedVolume);
        if (!isNaN(volume)) {
          this.masterVolume = Math.max(0, Math.min(1, volume));
        }
      }
    } catch (error) {
      console.warn('Error loading sound settings:', error);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('sound.muted', String(this.muted));
      localStorage.setItem('sound.volume', String(this.masterVolume));
    } catch (error) {
      console.warn('Error saving sound settings:', error);
    }
  }

  private setupUserInteractionListener(): void {
    const markInteraction = () => {
      this.userInteracted = true;
      document.removeEventListener('click', markInteraction);
      document.removeEventListener('keypress', markInteraction);
      document.removeEventListener('touchstart', markInteraction);
    };

    document.addEventListener('click', markInteraction, { once: true });
    document.addEventListener('keypress', markInteraction, { once: true });
    document.addEventListener('touchstart', markInteraction, { once: true });
  }

  private setupAppLifecycleListeners(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopLevelMusic();
        this.stopStartMusic();
      }
    });

    window.addEventListener('pagehide', () => {
      this.stopLevelMusic();
      this.stopStartMusic();
    });

    window.addEventListener('beforeunload', () => {
      this.stopLevelMusic();
      this.stopStartMusic();
    });
  }

  private preloadAudio(): void {
    try {
      this.startMusicTrack = new Audio('/audio/start_theme.mp3');
      this.startMusicTrack.loop = true;
      this.startMusicTrack.preload = 'auto';

      for (let i = 1; i <= 10; i++) {
        const track = new Audio(`/audio/level_${i}.mp3`);
        track.loop = true;
        track.preload = 'auto';
        this.levelTracks.set(i, track);
      }

      this.matchSfx = new Audio('/audio/match.wav');
      this.matchSfx.preload = 'auto';

      this.winSfx = new Audio('/audio/win.mp3');
      this.winSfx.preload = 'auto';

      this.loseSfx = new Audio('/audio/lose.mp3');
      this.loseSfx.preload = 'auto';

      this.applyVolume();
    } catch (error) {
      console.warn('Error preloading audio:', error);
    }
  }

  private applyVolume(): void {
    const effectiveVolume = this.muted ? 0 : this.masterVolume;

    if (this.startMusicTrack) this.startMusicTrack.volume = effectiveVolume;

    this.levelTracks.forEach((track) => {
      track.volume = effectiveVolume;
    });

    if (this.matchSfx) this.matchSfx.volume = effectiveVolume;
    if (this.winSfx) this.winSfx.volume = effectiveVolume;
    if (this.loseSfx) this.loseSfx.volume = effectiveVolume;
  }

  private async crossFade(outTrack: HTMLAudioElement, inTrack: HTMLAudioElement): Promise<void> {
    const fadeDuration = 300;
    const steps = 20;
    const stepTime = fadeDuration / steps;
    const targetVolume = this.muted ? 0 : this.masterVolume;

    // Fade out
    for (let i = steps; i >= 0; i--) {
      outTrack.volume = (i / steps) * targetVolume;
      await new Promise(resolve => setTimeout(resolve, stepTime));
    }

    outTrack.pause();
    outTrack.currentTime = 0;

    // Fade in
    inTrack.volume = 0;

    try {
      await inTrack.play();

      for (let i = 0; i <= steps; i++) {
        inTrack.volume = (i / steps) * targetVolume;
        await new Promise(resolve => setTimeout(resolve, stepTime));
      }
    } catch (error) {
      console.warn('Error during crossfade:', error);
    }
  }

  // Reproducción segura para efectos de sonido (resetea desde el inicio)
  private async playSfxSafely(audio: HTMLAudioElement): Promise<void> {
    if (!this.userInteracted) {
      console.warn('Cannot play audio before user interaction');
      return;
    }

    try {
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.warn('Error playing audio:', error);
    }
  }

  // API Pública - Música

  public playStartMusic(): void {
    if (!this.startMusicTrack || !this.userInteracted) return;

    try {
      // Si ya está sonando, no reiniciar
      if (!this.startMusicTrack.paused) {
        console.log('Start music already playing, skipping');
        return;
      }

      this.startMusicTrack.volume = this.muted ? 0 : this.masterVolume;
      this.startMusicTrack.currentTime = 0;
      this.startMusicTrack.play().catch(err => console.warn('Error playing start music:', err));
    } catch (error) {
      console.warn('Error playing start music:', error);
    }
  }

  public stopStartMusic(): void {
    if (!this.startMusicTrack) return;

    try {
      this.startMusicTrack.pause();
      this.startMusicTrack.currentTime = 0;
    } catch (error) {
      console.warn('Error stopping start music:', error);
    }
  }

  public playLevelMusic(level: number): void {
    if (!this.userInteracted) return;

    const trackNumber = Math.min(level, 10);
    const newTrack = this.levelTracks.get(trackNumber);
    if (!newTrack) {
      console.warn(`Level ${level} music not found, using track ${trackNumber}`);
      return;
    }

    try {
      // Si es la MISMA pista y ya está sonando, NO hacer nada
      if (this.currentLevelTrack === newTrack && !this.currentLevelTrack.paused) {
        console.log(`Level ${level} music already playing, skipping`);
        return;
      }

      // Si hay OTRA música sonando, detenerla directamente
      if (this.currentLevelTrack && !this.currentLevelTrack.paused) {
        this.currentLevelTrack.pause();
        this.currentLevelTrack.currentTime = 0;
      }

      // Reproducir la nueva pista
      this.currentLevelTrack = newTrack;
      newTrack.volume = this.muted ? 0 : this.masterVolume;
      newTrack.currentTime = 0;
      newTrack.play().catch(err => console.warn('Error playing level music:', err));

    } catch (error) {
      console.warn(`Error playing level ${level} music:`, error);
    }
  }

  public stopLevelMusic(): void {
    try {
      // Detener el track actual
      if (this.currentLevelTrack) {
        this.currentLevelTrack.pause();
        this.currentLevelTrack.currentTime = 0;
        this.currentLevelTrack = null;
      }

      // Por seguridad, detener TODOS los tracks de nivel que puedan estar sonando
      this.levelTracks.forEach((track) => {
        if (!track.paused) {
          track.pause();
          track.currentTime = 0;
        }
      });
    } catch (error) {
      console.warn('Error stopping level music:', error);
    }
  }

  // API Pública - Efectos de sonido

  public playMatch(): void {
    if (!this.matchSfx || !this.userInteracted) return;
    this.playSfxSafely(this.matchSfx);
  }

  public playWin(): void {
    if (!this.winSfx || !this.userInteracted) return;
    this.playSfxSafely(this.winSfx);
  }

  public playLose(): void {
    if (!this.loseSfx || !this.userInteracted) return;
    this.playSfxSafely(this.loseSfx);
  }

  // API Pública - Controles

  public mute(): void {
    this.muted = true;
    this.applyVolume();
    this.saveSettings();
  }

  public unmute(): void {
    this.muted = false;
    this.applyVolume();
    this.saveSettings();
  }

  public toggleMute(): void {
    if (this.muted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.applyVolume();
    this.saveSettings();
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }
}

// Singleton export
export const soundManager = new SoundManager();
