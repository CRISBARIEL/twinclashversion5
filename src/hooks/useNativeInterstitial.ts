import { useState, useEffect, useCallback } from 'react';
import { nativeInterstitialService } from '../lib/nativeInterstitial';

interface UseNativeInterstitialReturn {
  initialized: boolean;
  isReady: boolean;
  showAd: () => Promise<boolean>;
  loadAd: () => Promise<boolean>;
  testMode: boolean;
}

export function useNativeInterstitial(autoInitialize: boolean = true, testMode: boolean = false): UseNativeInterstitialReturn {
  const [initialized, setInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTestMode, setCurrentTestMode] = useState(testMode);

  useEffect(() => {
    if (autoInitialize) {
      nativeInterstitialService.initialize(testMode)
        .then(() => {
          setInitialized(true);
          setCurrentTestMode(nativeInterstitialService.getTestMode());
          console.log('[useNativeInterstitial] Initialized');
        })
        .catch(error => {
          console.error('[useNativeInterstitial] Initialization failed:', error);
        });
    }
  }, [autoInitialize, testMode]);

  useEffect(() => {
    if (!initialized) return;

    const checkInterval = setInterval(async () => {
      const ready = await nativeInterstitialService.isReady();
      setIsReady(ready);
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [initialized]);

  const showAd = useCallback(async () => {
    console.log('[useNativeInterstitial] showAd called');
    const success = await nativeInterstitialService.showAd();
    console.log('[useNativeInterstitial] showAd result:', success);
    return success;
  }, []);

  const loadAd = useCallback(async () => {
    console.log('[useNativeInterstitial] loadAd called');
    const success = await nativeInterstitialService.loadAd();
    console.log('[useNativeInterstitial] loadAd result:', success);
    return success;
  }, []);

  return {
    initialized,
    isReady,
    showAd,
    loadAd,
    testMode: currentTestMode,
  };
}
