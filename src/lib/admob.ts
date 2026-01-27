import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, AdOptions, AdLoadInfo, RewardAdOptions, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { addCoins } from './progression';

export interface AdMobConfig {
  rewardedAdUnitId: string;
  interstitialAdUnitId: string;
  testMode?: boolean;
}

// ===== IDs DE PRUEBA (Google Test Ads) =====
// Usa estos IDs SOLO para testing/desarrollo
// const TEST_IDS = {
//   rewarded: 'ca-app-pub-3940256099942544/5224354917',
//   interstitial: 'ca-app-pub-3940256099942544/1033173712',
// };

const TEST_IDS = {
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
};

// ===== IDs DE PRODUCCIÓN (TUS IDS REALES) =====
// App ID: ca-app-pub-2140112688604592~6170461480
// Intersticial: ca-app-pub-2140112688604592/4482879255
const PRODUCTION_IDS = {
  rewarded: 'ca-app-pub-2140112688604592/4482879255',      // Intersticial (sirve para ambos)
  interstitial: 'ca-app-pub-2140112688604592/4482879255',
};

class AdMobService {
  private initialized = false;
  private testMode = false; // PRODUCCIÓN ACTIVADA
  private rewardedAdLoaded = false;
  private interstitialAdLoaded = false;
  private isNativePlatform = false;

  constructor() {
    this.isNativePlatform = Capacitor.isNativePlatform();
  }

  async initialize(testMode: boolean = false): Promise<void> { // PRODUCCIÓN
    if (this.initialized) {
      console.log('[AdMob] Already initialized');
      return;
    }

    if (!this.isNativePlatform) {
      console.warn('[AdMob] Not running on native platform - ads will be simulated');
      this.initialized = true;
      return;
    }

    try {
      this.testMode = testMode;
      const adIds = this.getAdIds();

      console.log('[AdMob] Initializing...', {
        testMode,
        rewardedId: adIds.rewarded,
        interstitialId: adIds.interstitial
      });

      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: testMode ? ['YOUR_DEVICE_ID_HERE'] : undefined,
        initializeForTesting: testMode,
      });

      this.initialized = true;
      console.log('[AdMob] ✅ Initialized successfully', { testMode });

      this.preloadRewardedAd();
      this.preloadInterstitialAd();
    } catch (error) {
      console.error('[AdMob] ❌ Initialization failed:', error);
      throw error;
    }
  }

  private getAdIds() {
    return this.testMode ? TEST_IDS : PRODUCTION_IDS;
  }

  async preloadRewardedAd(): Promise<void> {
    if (!this.initialized || this.rewardedAdLoaded) return;

    if (!this.isNativePlatform) {
      this.rewardedAdLoaded = true;
      console.log('[AdMob] Simulating rewarded ad preload (web mode)');
      return;
    }

    try {
      const adIds = this.getAdIds();
      const options: RewardAdOptions = {
        adId: adIds.rewarded,
      };

      await AdMob.prepareRewardVideoAd(options);
      this.rewardedAdLoaded = true;
      console.log('[AdMob] Rewarded ad preloaded');
    } catch (error) {
      console.error('[AdMob] Failed to preload rewarded ad:', error);
      this.rewardedAdLoaded = false;
    }
  }

  async showRewardedAd(): Promise<{ success: boolean; rewarded: boolean; coins?: number }> {
    if (!this.initialized) {
      console.warn('[AdMob] Not initialized - call initialize() first');
      return { success: false, rewarded: false };
    }

    if (!this.isNativePlatform) {
      console.log('[AdMob] Simulating rewarded ad (web mode)');
      await new Promise(resolve => setTimeout(resolve, 2000));
      const coins = addCoins(1000);
      console.log('[AdMob] Simulated reward granted: +1000 coins, total:', coins);
      return { success: true, rewarded: true, coins };
    }

    if (!this.rewardedAdLoaded) {
      console.warn('[AdMob] Rewarded ad not loaded yet');
      await this.preloadRewardedAd();

      if (!this.rewardedAdLoaded) {
        return { success: false, rewarded: false };
      }
    }

    try {
      let rewardGranted = false;
      let rewardAmount = 0;

      const rewardListener = await AdMob.addListener(
        RewardAdPluginEvents.Rewarded,
        (reward: AdMobRewardItem) => {
          console.log('[AdMob] Reward granted:', reward);
          rewardGranted = true;
          rewardAmount = reward.amount;
        }
      );

      const dismissListener = await AdMob.addListener(
        RewardAdPluginEvents.Dismissed,
        () => {
          console.log('[AdMob] Rewarded ad dismissed');
          rewardListener.remove();
          dismissListener.remove();
          failedListener.remove();
        }
      );

      const failedListener = await AdMob.addListener(
        RewardAdPluginEvents.FailedToShow,
        (error) => {
          console.error('[AdMob] Rewarded ad failed to show:', error);
          rewardListener.remove();
          dismissListener.remove();
          failedListener.remove();
        }
      );

      await AdMob.showRewardVideoAd();
      this.rewardedAdLoaded = false;

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (rewardGranted) {
        const coins = addCoins(1000);
        console.log('[AdMob] Reward granted: +1000 coins, total:', coins);

        this.preloadRewardedAd();

        return { success: true, rewarded: true, coins };
      }

      this.preloadRewardedAd();
      return { success: true, rewarded: false };
    } catch (error) {
      console.error('[AdMob] Error showing rewarded ad:', error);
      this.rewardedAdLoaded = false;
      this.preloadRewardedAd();
      return { success: false, rewarded: false };
    }
  }

  async preloadInterstitialAd(): Promise<void> {
    if (!this.initialized || this.interstitialAdLoaded) return;

    if (!this.isNativePlatform) {
      this.interstitialAdLoaded = true;
      console.log('[AdMob] Simulating interstitial ad preload (web mode)');
      return;
    }

    try {
      const adIds = this.getAdIds();
      const options: AdOptions = {
        adId: adIds.interstitial,
      };

      await AdMob.prepareInterstitial(options);
      this.interstitialAdLoaded = true;
      console.log('[AdMob] Interstitial ad preloaded');
    } catch (error) {
      console.error('[AdMob] Failed to preload interstitial ad:', error);
      this.interstitialAdLoaded = false;
    }
  }

  async showInterstitialAd(): Promise<boolean> {
    if (!this.initialized) {
      console.warn('[AdMob] Not initialized - call initialize() first');
      return false;
    }

    if (!this.isNativePlatform) {
      console.log('[AdMob] Simulating interstitial ad (web mode)');
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('[AdMob] Simulated interstitial ad shown');
      return true;
    }

    if (!this.interstitialAdLoaded) {
      console.warn('[AdMob] Interstitial ad not loaded yet');
      await this.preloadInterstitialAd();

      if (!this.interstitialAdLoaded) {
        return false;
      }
    }

    try {
      await AdMob.showInterstitial();
      this.interstitialAdLoaded = false;
      console.log('[AdMob] Interstitial ad shown');

      this.preloadInterstitialAd();

      return true;
    } catch (error) {
      console.error('[AdMob] Error showing interstitial ad:', error);
      this.interstitialAdLoaded = false;
      this.preloadInterstitialAd();
      return false;
    }
  }

  isRewardedAdReady(): boolean {
    return this.initialized && this.rewardedAdLoaded;
  }

  isInterstitialAdReady(): boolean {
    return this.initialized && this.interstitialAdLoaded;
  }

  getTestMode(): boolean {
    return this.testMode;
  }

  setTestMode(enabled: boolean): void {
    if (this.testMode !== enabled) {
      this.testMode = enabled;
      console.log('[AdMob] Test mode changed to:', enabled);
      console.warn('[AdMob] Reinitialize AdMob for test mode changes to take effect');
    }
  }
}

export const admobService = new AdMobService();
