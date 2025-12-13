import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { addCoins, getLocalCoins } from './lib/progression';

// Unregister old service workers but KEEP Firebase messaging service worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(registrations => {
      registrations.forEach(reg => {
        if (!reg.active?.scriptURL.includes('firebase-messaging-sw.js')) {
          console.log('[ServiceWorker] Unregistering old service worker:', reg.scope);
          reg.unregister();
        } else {
          console.log('[ServiceWorker] Keeping Firebase messaging service worker:', reg.scope);
        }
      });
    })
    .catch((error) => {
      console.warn('[ServiceWorker] Error managing service workers (no crítico):', error);
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// === CONEXIÓN DEL BOTÓN REWARDED (Unity Ads) ===
window.addEventListener('add-coins', (event: any) => {
  const amount = event.detail || 25000;

  const newTotal = addCoins(amount);

  console.log(`+${amount} monedas añadidas! Total: ${newTotal}`);
});
