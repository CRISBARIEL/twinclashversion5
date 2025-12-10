import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { addCoins, getLocalCoins } from './lib/progression';

declare global {
  interface Window {
    OneSignalDeferred: any[];
  }
}

function OneSignalInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      await OneSignal.init({
        appId: "9fe397c5-d5a7-4e12-bc60-26e2cbdab4f5",
        allowLocalhostAsSecureOrigin: true,
      });

      setTimeout(() => {
        OneSignal.Slidedown.promptPush();
      }, 3000);
    });
  }, []);

  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OneSignalInit />
    <App />
  </StrictMode>
);

// === CONEXIÓN DEL BOTÓN REWARDED (Unity Ads) ===
window.addEventListener('add-coins', (event: any) => {
  const amount = event.detail || 25000;

  const newTotal = addCoins(amount);

  console.log(`+${amount} monedas añadidas! Total: ${newTotal}`);
});
