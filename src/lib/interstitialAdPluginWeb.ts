import { WebPlugin } from '@capacitor/core';
import type { InterstitialAdPlugin } from './interstitialAdPlugin';

export class InterstitialAdPluginWeb extends WebPlugin implements InterstitialAdPlugin {
  private adReady = false;

  async loadAd(options: { testMode: boolean }): Promise<{ success: boolean; message: string }> {
    console.log('[InterstitialAdPluginWeb] Simulating ad load (testMode:', options.testMode, ')');

    await new Promise(resolve => setTimeout(resolve, 500));

    this.adReady = true;

    return {
      success: true,
      message: 'Ad loaded (web simulation)',
    };
  }

  async showAd(): Promise<{ success: boolean; message: string }> {
    console.log('[InterstitialAdPluginWeb] Simulating ad show');

    if (!this.adReady) {
      return {
        success: false,
        message: 'Ad not loaded',
      };
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    this.adReady = false;

    this.notifyListeners('adEvent', { event: 'showed' });

    setTimeout(() => {
      this.notifyListeners('adEvent', { event: 'dismissed' });
    }, 100);

    return {
      success: true,
      message: 'Ad shown (web simulation)',
    };
  }

  async isAdReady(): Promise<{ ready: boolean }> {
    return { ready: this.adReady };
  }

  async destroyAd(): Promise<{ success: boolean }> {
    console.log('[InterstitialAdPluginWeb] Destroying ad');
    this.adReady = false;
    return { success: true };
  }
}
