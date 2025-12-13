declare global {
  interface Window {
    firebase: any;
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyAw4bFf4JssC0FWFD12-ImaJpDC8dg",
  authDomain: "twinclash-c6eac.firebaseapp.com",
  projectId: "twinclash-c6eac",
  storageBucket: "twinclash-c6eac.appspot.com",
  messagingSenderId: "189939875668",
  appId: "1:189939875668:web:6330e6e16d82051fb18c1"
};

let messaging: any = null;
let isInitialized = false;

export function initializeFirebase() {
  if (isInitialized) return;

  try {
    if (typeof window !== 'undefined' && window.firebase) {
      window.firebase.initializeApp(firebaseConfig);
      messaging = window.firebase.messaging();
      isInitialized = true;
      console.log('[FCM] Firebase Cloud Messaging initialized');

      messaging.onMessage((payload: any) => {
        console.log('[FCM] Mensaje recibido en foreground:', payload);

        const title = payload.notification?.title || '¡Twin Clash!';
        const body = payload.notification?.body || 'Tienes una nueva notificación';

        showInAppNotification(title, body);
      });
    }
  } catch (error) {
    console.error('[FCM] Error initializing Firebase:', error);
  }
}

function showInAppNotification(title: string, body: string) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 99999;
    max-width: 350px;
    animation: slideIn 0.3s ease-out;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  notification.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 4px;">${title}</div>
    <div style="font-size: 14px; opacity: 0.9;">${body}</div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

export async function requestNotificationPermission(clientId: string): Promise<string | null> {
  if (!('Notification' in window)) {
    console.warn('[FCM] Este navegador no soporta notificaciones');
    return null;
  }

  if (!messaging) {
    console.warn('[FCM] Firebase Messaging no inicializado');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('[FCM] Permiso de notificaciones concedido');

      const currentToken = await messaging.getToken({
        vapidKey: 'BIJhA_09TrJnVSR7nfIAbmNmquDaBMH0QNJYMkVMi7SJE6yl6mtdIqSyKXDbUnaO3J4--N6gt5f-GC-J7hKsGto'
      });

      if (currentToken) {
        console.log('[FCM] Token FCM obtenido:', currentToken.substring(0, 20) + '...');

        await saveFCMToken(clientId, currentToken);

        return currentToken;
      } else {
        console.warn('[FCM] No se pudo obtener el token');
        return null;
      }
    } else if (permission === 'denied') {
      console.warn('[FCM] Permiso de notificaciones denegado');
      return null;
    } else {
      console.log('[FCM] Permiso de notificaciones no concedido');
      return null;
    }
  } catch (error) {
    console.error('[FCM] Error al solicitar permiso de notificaciones:', error);
    return null;
  }
}

async function saveFCMToken(clientId: string, token: string) {
  try {
    const { supabase } = await import('./supabase');

    const { error } = await supabase
      .from('fcm_tokens')
      .upsert({
        client_id: clientId,
        token: token,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'client_id'
      });

    if (error) {
      console.error('[FCM] Error guardando token en Supabase:', error);
    } else {
      console.log('[FCM] Token guardado exitosamente en Supabase');
    }
  } catch (error) {
    console.error('[FCM] Error al guardar token:', error);
  }
}

export function getNotificationPermissionStatus(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}
