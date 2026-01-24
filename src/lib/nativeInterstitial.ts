import { Capacitor } from '@capacitor/core';
import InterstitialAdPlugin, { AdEventListener } from './interstitialAdPlugin';

class NativeInterstitialAdService {
  private isNativePlatform: boolean;
  private adReady = false;
  private isLoading = false;
  private testMode = false;
  private lastLoadTime = 0;
  private readonly RELOAD_COOLDOWN = 60000;

  constructor() {
    this.isNativePlatform = Capacitor.isNativePlatform();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    InterstitialAdPlugin.addListener('adEvent', (event: AdEventListener) => {
      console.log('[NativeInterstitial] Event:', event);

      switch (event.event) {
        case 'showed':
          console.log('[NativeInterstitial] Ad showed');
          break;
        case 'dismissed':
          console.log('[NativeInterstitial] Ad dismissed - preloading next ad');
          this.adReady = false;
          setTimeout(() => this.loadAd(), 1000);
          break;
        case 'failedToShow':
          console.error('[NativeInterstitial] Ad failed to show:', event.message);
          this.adReady = false;
          setTimeout(() => this.loadAd(), 2000);
          break;
        case 'impression':
          console.log('[NativeInterstitial] Ad impression recorded');
          break;
        case 'clicked':
          console.log('[NativeInterstitial] Ad clicked');
          break;
      }
    });
  }

  async initialize(testMode: boolean = false): Promise<void> {
    this.testMode = testMode;
    console.log('[NativeInterstitial] Initializing...', { testMode, isNative: this.isNativePlatform });

    if (!this.isNativePlatform) {
      console.log('[NativeInterstitial] Web mode - ads will be simulated');
      return;
    }

    await this.loadAd();
  }

  async loadAd(): Promise<boolean> {
    if (this.isLoading) {
      console.log('[NativeInterstitial] Already loading');
      return false;
    }

    if (this.adReady) {
      console.log('[NativeInterstitial] Ad already loaded');
      return true;
    }

    const now = Date.now();
    if (now - this.lastLoadTime < this.RELOAD_COOLDOWN) {
      console.log('[NativeInterstitial] Cooldown active, skipping load');
      return false;
    }

    this.isLoading = true;
    this.lastLoadTime = now;

    try {
      console.log('[NativeInterstitial] Loading ad...', { testMode: this.testMode });

      const result = await InterstitialAdPlugin.loadAd({
        testMode: this.testMode,
      });

      console.log('[NativeInterstitial] Load result:', result);

      if (result.success) {
        this.adReady = true;
        console.log('[NativeInterstitial] Ad loaded successfully');
        return true;
      } else {
        console.error('[NativeInterstitial] Failed to load ad:', result.message);
        this.adReady = false;
        return false;
      }
    } catch (error) {
      console.error('[NativeInterstitial] Error loading ad:', error);
      this.adReady = false;
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  async showAd(): Promise<boolean> {
    console.log('[NativeInterstitial] Attempting to show ad...', { ready: this.adReady });

    if (!this.adReady) {
      console.warn('[NativeInterstitial] Ad not ready');

      await this.loadAd();

      if (!this.adReady) {
        console.error('[NativeInterstitial] Failed to load ad for immediate show');
        return false;
      }
    }

    try {
      const result = await InterstitialAdPlugin.showAd();

      if (result.success) {
        console.log('[NativeInterstitial] Ad shown successfully');
        this.adReady = false;
        return true;
      } else {
        console.error('[NativeInterstitial] Failed to show ad:', result.message);
        return false;
      }
    } catch (error) {
      console.error('[NativeInterstitial] Error showing ad:', error);
      return false;
    }
  }

  async isReady(): Promise<boolean> {
    try {
      const result = await InterstitialAdPlugin.isAdReady();
      this.adReady = result.ready;
      return result.ready;
    } catch (error) {
      console.error('[NativeInterstitial] Error checking ad ready:', error);
      return false;
    }
  }

  getReadyState(): boolean {
    return this.adReady;
  }

  setTestMode(enabled: boolean): void {
    if (this.testMode !== enabled) {
      this.testMode = enabled;
      console.log('[NativeInterstitial] Test mode changed to:', enabled);
      console.warn('[NativeInterstitial] Reload ad for changes to take effect');
    }
  }

  getTestMode(): boolean {
    return this.testMode;
  }
}

export const nativeInterstitialService = new NativeInterstitialAdService();
