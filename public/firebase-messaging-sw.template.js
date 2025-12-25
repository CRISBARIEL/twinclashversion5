importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "__FIREBASE_API_KEY__",
  authDomain: "__FIREBASE_AUTH_DOMAIN__",
  projectId: "__FIREBASE_PROJECT_ID__",
  storageBucket: "__FIREBASE_STORAGE_BUCKET__",
  messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
  appId: "__FIREBASE_APP_ID__"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en background:', payload);

  const notificationTitle = payload.notification?.title || '¡Twin Clash!';
  const notificationOptions = {
    body: payload.notification?.body || '¡Vuelve a jugar el reto diario!',
    icon: '/twinlogo.png',
    badge: '/twinlogo.png',
    image: payload.notification?.image,
    data: { url: 'https://twinclash.org/' },
    tag: 'twinclash-notification',
    requireInteraction: false
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notificación clickeada');
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification?.data?.url || 'https://twinclash.org/')
  );
});
