import { getMessaging, getToken } from 'firebase/messaging';
import { firebaseApp } from './firebaseApp';

const messaging = getMessaging(firebaseApp);

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export async function iniciarNotificacionesPush() {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('[PUSH] Este navegador no soporta notificaciones push');
    return;
  }

  try {
    console.log('[PUSH] 🔥 Iniciando configuración de notificaciones push...');

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('[PUSH] ❌ Permiso denegado por el usuario');
      return;
    }

    console.log('[PUSH] ✅ Permiso concedido');

    if (!VAPID_KEY) {
      console.error('[PUSH] ❌ VITE_FIREBASE_VAPID_KEY no está configurada');
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      console.log('[PUSH] ❌ No se pudo obtener el token (revisa VAPID key o service worker)');
      return;
    }

    console.log('[PUSH] 🎉 TOKEN OBTENIDO:', token);
    console.log('Copia este token y úsalo para pruebas en Firebase Console');

    const response = await fetch('/.netlify/functions/register-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        platform: 'web',
        locale: navigator.language
      })
    });

    if (response.ok) {
      console.log('[PUSH] ✅ Token guardado en Supabase correctamente');
    } else {
      console.error('[PUSH] ❌ Error al guardar token:', await response.text());
    }

  } catch (error) {
    console.error('[PUSH] Error grave:', error);
  }
}
