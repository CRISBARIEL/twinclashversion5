importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAw4bFf4JssC0FWFD12-ImaJpDC8dg",
  authDomain: "twinclash-c6eac.firebaseapp.com",
  projectId: "twinclash-c6eac",
  storageBucket: "twinclash-c6eac.appspot.com",
  messagingSenderId: "189939875668",
  appId: "1:189939875668:web:6330e6e16d82051fb18c1"
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
