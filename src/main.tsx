import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { addCoins, getLocalCoins } from './lib/progression';
import { initializeApp } from 'firebase/app';
import { initializePushNotifications } from './lib/push';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("[PUSH] SW registered:", reg.scope);

      await initializePushNotifications(app);
    } catch (e) {
      console.error("[PUSH] SW register failed:", e);
    }
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
