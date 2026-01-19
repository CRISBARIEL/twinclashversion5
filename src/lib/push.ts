import { getMessaging, getToken } from 'firebase/messaging';
import { Capacitor } from '@capacitor/core';

declare global {
  interface Window {
    NotificationPermission?: {
      checkPermission: () => Promise<{ granted: boolean }>;
      requestPermission: () => Promise<{ granted: boolean }>;
    };
  }
}

export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  // En Android nativo, usar el plugin nativo
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      const NotificationPermission = (window as any).NotificationPermission;

      if (NotificationPermission) {
        // Primero verificar si ya tiene permiso
        const checkResult = await NotificationPermission.checkPermission();
        if (checkResult.granted) {
          console.log('[PUSH] Permission already granted (native)');
          return 'granted';
        }

        // Si no tiene permiso, pedirlo
        const result = await NotificationPermission.requestPermission();
        console.log('[PUSH] Permission result (native):', result.granted);
        return result.granted ? 'granted' : 'denied';
      }
    } catch (error) {
      console.warn('[PUSH] Native permission error, falling back to web:', error);
    }
  }

  // Web o fallback
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
    const locale = navigator.language || 'unknown';

    console.log('[PUSH] Registering token via Netlify function...');

    const response = await fetch('/.netlify/functions/register-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        client_id: clientId,
        platform: 'web',
        locale
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('[PUSH] Failed to register token:', response.status, errorData);
      return false;
    }

    const result = await response.json();

    if (result.ok) {
      console.log('[PUSH] Token registered successfully via backend');
      return true;
    } else {
      console.error('[PUSH] Backend returned error:', result);
      return false;
    }
  } catch (error) {
    console.error('[PUSH] Exception registering token:', error);
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
