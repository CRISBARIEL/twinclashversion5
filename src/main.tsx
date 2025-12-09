import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { addCoins, getLocalCoins } from './lib/progression';
import OneSignal from 'react-onesignal';

async function initOneSignal() {
  await OneSignal.init({
    appId: "9fe397c5-d5a7-4e12-bc60-26e2cbdab4f5",
    allowLocalhostAsSecureOrigin: true,
    notifyButton: { enable: false }
  });

  OneSignal.showSlidedownPrompt();
}

initOneSignal();

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
