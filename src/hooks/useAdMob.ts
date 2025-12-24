import { useState, useEffect, useCallback } from 'react';
import { admobService } from '../lib/admob';

interface UseAdMobReturn {
  initialized: boolean;
  isRewardedReady: boolean;
  isInterstitialReady: boolean;
  showRewardedAd: () => Promise<{ success: boolean; rewarded: boolean; coins?: number }>;
  showInterstitialAd: () => Promise<boolean>;
  testMode: boolean;
}

export function useAdMob(autoInitialize: boolean = true, testMode: boolean = true): UseAdMobReturn {
  const [initialized, setInitialized] = useState(false);
  const [isRewardedReady, setIsRewardedReady] = useState(false);
  const [isInterstitialReady, setIsInterstitialReady] = useState(false);
  const [currentTestMode, setCurrentTestMode] = useState(testMode);

  useEffect(() => {
    if (autoInitialize) {
      admobService.initialize(testMode)
        .then(() => {
          setInitialized(true);
          setCurrentTestMode(admobService.getTestMode());
        })
        .catch(error => {
          console.error('[useAdMob] Initialization failed:', error);
        });
    }
  }, [autoInitialize, testMode]);

  useEffect(() => {
    if (!initialized) return;

    const checkInterval = setInterval(() => {
      setIsRewardedReady(admobService.isRewardedAdReady());
      setIsInterstitialReady(admobService.isInterstitialAdReady());
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [initialized]);

  const showRewardedAd = useCallback(async () => {
    return await admobService.showRewardedAd();
  }, []);

  const showInterstitialAd = useCallback(async () => {
    return await admobService.showInterstitialAd();
  }, []);

  return {
    initialized,
    isRewardedReady,
    isInterstitialReady,
    showRewardedAd,
    showInterstitialAd,
    testMode: currentTestMode,
  };
}
