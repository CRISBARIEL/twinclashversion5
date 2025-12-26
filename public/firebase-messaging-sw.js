importScripts("https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js");

// Inicializa Firebase con tu configuración
firebase.initializeApp({
  apiKey: "AIzaSyAw4bFf4JssC0FWFD12-ImaJpDC8dg",
  authDomain: "twinclash-c6eac.firebaseapp.com",
  projectId: "twinclash-c6eac",
  storageBucket: "twinclash-c6eac.appspot.com",
  messagingSenderId: "189939875668",
  appId: "1:189939875668:web:6330e6e16d82051fb18c1"
});

const messaging = firebase.messaging();

// Maneja notificaciones cuando la app está en segundo plano o cerrada
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje en segundo plano recibido:', payload);

  // Título y cuerpo de la notificación
  const notificationTitle = payload.notification?.title || 'Twin Clash';
  const notificationBody = payload.notification?.body || 'Tienes una nueva notificación';

  const notificationOptions = {
    body: notificationBody,
    icon: '/twinlogo.png',        // Asegúrate de tener este archivo en public/
    badge: '/twinlogo.png',       // Icono pequeño en la barra de notificaciones (opcional)
    tag: 'twinclash-notification', // Evita duplicados
    renotify: true,               // Vibración/notificación nueva si hay tag igual
    data: {
      url: payload.fcmOptions?.link || payload.notification?.click_action || 'https://twinclash.org/'
    },
    actions: [                    // Botones opcionales en la notificación (solo algunos navegadores)
      {
        action: 'open',
        title: 'Abrir Twin Clash'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Maneja el clic en la notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notificación clicada');

  event.notification.close();

  const urlToOpen = event.notification.data?.url || 'https://twinclash.org/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una pestaña abierta, enfócela
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abre una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});