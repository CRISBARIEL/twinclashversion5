import { getMessaging, getToken } from 'firebase/messaging';
import { supabase } from './supabase';

export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[PUSH] Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    console.log('[PUSH] Permission already granted');
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    console.log('[PUSH] Permission denied');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  console.log('[PUSH] Permission:', permission);
  return permission;
}

export async function getFcmToken(app: any): Promise<string | null> {
  try {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PUSH] Service Worker not supported');
      return null;
    }

    const messaging = getMessaging(app);
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

    if (!vapidKey) {
      console.error('[PUSH] VITE_FIREBASE_VAPID_KEY not configured');
      return null;
    }

    const registration = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('[PUSH] Token:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.warn('[PUSH] No token received');
      return null;
    }
  } catch (error) {
    console.error('[PUSH] Error getting FCM token:', error);
    return null;
  }
}

export function getOrCreateClientId(): string {
  let clientId = localStorage.getItem('client_id');

  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem('client_id', clientId);
    console.log('[PUSH] Created new client_id:', clientId);
  }

  return clientId;
}

export async function upsertPushToken(token: string, clientId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .upsert({
        token,
        client_id: clientId,
        platform: 'web',
        last_seen: new Date().toISOString()
      }, {
        onConflict: 'token'
      });

    if (error) {
      console.error('[PUSH] Error saving token to Supabase:', error);
      return false;
    }

    console.log('[PUSH] Saved token to Supabase');
    return true;
  } catch (error) {
    console.error('[PUSH] Exception saving token:', error);
    return false;
  }
}

export async function initializePushNotifications(app: any): Promise<void> {
  try {
    const permission = await ensureNotificationPermission();

    if (permission !== 'granted') {
      console.log('[PUSH] Permission not granted, skipping token registration');
      return;
    }

    const token = await getFcmToken(app);

    if (!token) {
      console.log('[PUSH] No FCM token, skipping registration');
      return;
    }

    const clientId = getOrCreateClientId();
    await upsertPushToken(token, clientId);

    console.log('[PUSH] Initialization complete');
  } catch (error) {
    console.error('[PUSH] Error during initialization:', error);
  }
}
