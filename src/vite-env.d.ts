/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

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
