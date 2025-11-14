interface SoundEffect {
  name: string;
  url: string;
  volume?: number;
}

const SOUND_EFFECTS: Record<string, SoundEffect> = {
  zap: {
    name: 'Electric Zap',
    url: '/sounds/zap.wav',
    volume: 0.6,
  },
  flipPop: {
    name: 'Card Flip',
    url: '/sounds/flip_pop.wav',
    volume: 0.4,
  },
  countdownClick: {
    name: 'Countdown Tick',
    url: '/sounds/countdown_click.wav',
    volume: 0.5,
  },
  confetti: {
    name: 'Victory Confetti',
    url: '/sounds/confetti.wav',
    volume: 0.7,
  },
  loop: {
    name: 'Background Loop',
    url: '/sounds/loop_150bpm.wav',
    volume: 0.3,
  },
};

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled = true;
  private bgmLoop: HTMLAudioElement | null = null;

  constructor() {
    this.preloadSounds();
  }

  private preloadSounds() {
    Object.entries(SOUND_EFFECTS).forEach(([key, effect]) => {
      try {
        const audio = new Audio(effect.url);
        audio.volume = effect.volume || 0.5;
        audio.preload = 'auto';
        this.sounds.set(key, audio);
      } catch (error) {
        console.warn(`Failed to preload sound: ${effect.name}`, error);
      }
    });
  }

  public play(soundKey: keyof typeof SOUND_EFFECTS) {
    if (!this.enabled) return;

    const audio = this.sounds.get(soundKey);
    if (audio) {
      try {
        audio.currentTime = 0;
        audio.play().catch((err) => {
          console.warn(`Failed to play sound: ${soundKey}`, err);
        });
      } catch (error) {
        console.warn(`Error playing sound: ${soundKey}`, error);
      }
    }
  }

  public playZap() {
    this.play('zap');
  }

  public playFlipPop() {
    this.play('flipPop');
  }

  public playCountdownClick() {
    this.play('countdownClick');
  }

  public playConfetti() {
    this.play('confetti');
  }

  public startBackgroundLoop() {
    if (!this.enabled) return;

    const audio = this.sounds.get('loop');
    if (audio && !this.bgmLoop) {
      try {
        audio.loop = true;
        audio.volume = 0.2;
        audio.play().catch((err) => {
          console.warn('Failed to play background loop', err);
        });
        this.bgmLoop = audio;
      } catch (error) {
        console.warn('Error starting background loop', error);
      }
    }
  }

  public stopBackgroundLoop() {
    if (this.bgmLoop) {
      try {
        this.bgmLoop.pause();
        this.bgmLoop.currentTime = 0;
        this.bgmLoop = null;
      } catch (error) {
        console.warn('Error stopping background loop', error);
      }
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopBackgroundLoop();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(soundKey: keyof typeof SOUND_EFFECTS, volume: number) {
    const audio = this.sounds.get(soundKey);
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  public setMasterVolume(volume: number) {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((audio) => {
      const effect = Object.entries(SOUND_EFFECTS).find(
        ([, e]) => e.url === audio.src.split('/').pop()
      );
      if (effect) {
        audio.volume = (effect[1].volume || 0.5) * normalizedVolume;
      }
    });
  }
}

export const soundManager = new SoundManager();

export const playSoundZap = () => soundManager.playZap();
export const playSoundFlip = () => soundManager.playFlipPop();
export const playSoundCountdown = () => soundManager.playCountdownClick();
export const playSoundConfetti = () => soundManager.playConfetti();
export const startBGM = () => soundManager.startBackgroundLoop();
export const stopBGM = () => soundManager.stopBackgroundLoop();
export const setSoundEnabled = (enabled: boolean) => soundManager.setEnabled(enabled);
export const isSoundEnabled = () => soundManager.isEnabled();
