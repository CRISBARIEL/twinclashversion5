import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { addCoins, getLocalCoins } from './lib/progression';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(registration => {
      console.log('[ServiceWorker] Firebase messaging service worker registered:', registration.scope);
    })
    .catch(error => {
      console.warn('[ServiceWorker] Registration failed (non-critical):', error);
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// === CONEXIÓN DEL BOTÓN REWARDED (Unity Ads) ===
window.addEventListener('add-coins', (event: any) => {
  const amount = event.detail || 2000;

  const newTotal = addCoins(amount);

  console.log(`+${amount} monedas añadidas! Total: ${newTotal}`);
});
