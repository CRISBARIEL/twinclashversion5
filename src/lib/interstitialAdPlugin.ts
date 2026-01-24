import { registerPlugin } from '@capacitor/core';

export interface InterstitialAdPlugin {
  loadAd(options: { testMode: boolean }): Promise<{ success: boolean; message: string; code?: number }>;
  showAd(): Promise<{ success: boolean; message: string }>;
  isAdReady(): Promise<{ ready: boolean }>;
  destroyAd(): Promise<{ success: boolean }>;
}

export interface AdEventListener {
  event: 'showed' | 'dismissed' | 'failedToShow' | 'impression' | 'clicked';
  message?: string;
}

const InterstitialAdPlugin = registerPlugin<InterstitialAdPlugin>('InterstitialAdPlugin', {
  web: () => import('./interstitialAdPluginWeb').then(m => new m.InterstitialAdPluginWeb()),
});

export default InterstitialAdPlugin;
