importScripts("https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Twin Clash';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/twinlogo.png',
    badge: '/twinlogo.png',
    tag: 'twinclash-notification',
    data: { url: 'https://twinclash.org/' }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked');
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification?.data?.url || 'https://twinclash.org/')
  );
});
