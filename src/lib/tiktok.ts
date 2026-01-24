import { Capacitor, registerPlugin } from '@capacitor/core';

interface TikTokEventsPlugin {
  trackEvent(options: { eventName: string; properties?: Record<string, any> }): Promise<void>;
  trackPurchase(options: { currency: string; value: number; contentId: string }): Promise<void>;
  trackRegistration(options: { method: string }): Promise<void>;
  trackLevelComplete(options: { level: number }): Promise<void>;
  trackContentView(options: { contentType: string; contentId: string }): Promise<void>;
}

const TikTokEvents = registerPlugin<TikTokEventsPlugin>('TikTokEvents');

export const trackTikTokEvent = async (
  eventName: string,
  properties?: Record<string, any>
): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[TikTok] Web platform - event not tracked:', eventName);
    return;
  }

  try {
    await TikTokEvents.trackEvent({ eventName, properties });
    console.log('[TikTok] Event tracked:', eventName);
  } catch (error) {
    console.error('[TikTok] Error tracking event:', error);
  }
};

export const trackTikTokPurchase = async (
  currency: string,
  value: number,
  contentId: string
): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[TikTok] Web platform - purchase not tracked');
    return;
  }

  try {
    await TikTokEvents.trackPurchase({ currency, value, contentId });
    console.log('[TikTok] Purchase tracked:', contentId, value, currency);
  } catch (error) {
    console.error('[TikTok] Error tracking purchase:', error);
  }
};

export const trackTikTokRegistration = async (method: string): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[TikTok] Web platform - registration not tracked');
    return;
  }

  try {
    await TikTokEvents.trackRegistration({ method });
    console.log('[TikTok] Registration tracked:', method);
  } catch (error) {
    console.error('[TikTok] Error tracking registration:', error);
  }
};

export const trackTikTokLevelComplete = async (level: number): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[TikTok] Web platform - level complete not tracked');
    return;
  }

  try {
    await TikTokEvents.trackLevelComplete({ level });
    console.log('[TikTok] Level complete tracked:', level);
  } catch (error) {
    console.error('[TikTok] Error tracking level:', error);
  }
};

export const trackTikTokContentView = async (
  contentType: string,
  contentId: string
): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[TikTok] Web platform - content view not tracked');
    return;
  }

  try {
    await TikTokEvents.trackContentView({ contentType, contentId });
    console.log('[TikTok] Content view tracked:', contentType, contentId);
  } catch (error) {
    console.error('[TikTok] Error tracking content view:', error);
  }
};

export const trackTikTokAdView = async (adType: string): Promise<void> => {
  await trackTikTokEvent('AdView', { ad_type: adType });
};

export const trackTikTokGameStart = async (worldId: number, levelId: number): Promise<void> => {
  await trackTikTokEvent('GameStart', { world_id: worldId, level_id: levelId });
};

export const trackTikTokShopView = async (): Promise<void> => {
  await trackTikTokContentView('shop', 'coin_shop');
};

export const trackTikTokWorldUnlock = async (worldId: number): Promise<void> => {
  await trackTikTokEvent('WorldUnlock', { world_id: worldId });
};
