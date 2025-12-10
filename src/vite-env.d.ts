/// <reference types="vite/client" />

interface GameMonetizeSDK {
  game: {
    fn: {
      rewarded: (callback: () => void) => void;
    };
  };
}

interface Window {
  showRewardedAd?: () => void;
  GameMonetize?: GameMonetizeSDK;
}
