import { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { getMessaging, getToken } from 'firebase/messaging';
import { firebaseApp } from '../lib/firebaseApp';

type PushStatus = 'default' | 'granted' | 'denied';

export function NotificationButton() {
  const [status, setStatus] = useState<PushStatus>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('denied');
      localStorage.setItem('push_status', 'denied');
      return;
    }

    const savedStatus = localStorage.getItem('push_status') as PushStatus | null;

    if (savedStatus) {
      setStatus(savedStatus);
    } else if (Notification.permission === 'granted') {
      setStatus('granted');
      localStorage.setItem('push_status', 'granted');
    } else if (Notification.permission === 'denied') {
      setStatus('denied');
      localStorage.setItem('push_status', 'denied');
    } else {
      setStatus('default');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleActivateNotifications = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      showNotification('Tu navegador no soporta notificaciones', 'error');
      setStatus('denied');
      localStorage.setItem('push_status', 'denied');
      return;
    }

    if (status === 'granted') {
      return;
    }

    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('[PUSH] Permiso concedido');

        const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

        if (!VAPID_KEY) {
          console.error('[PUSH] VITE_FIREBASE_VAPID_KEY no está configurada');
          showNotification('Error de configuración. Contacta a soporte.', 'error');
          setIsLoading(false);
          return;
        }

        const messaging = getMessaging(firebaseApp);
        const registration = await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });

        if (!token) {
          console.error('[PUSH] No se pudo obtener el token');
          showNotification('Error al obtener token. Intenta de nuevo.', 'error');
          setIsLoading(false);
          return;
        }

        console.log('[PUSH] Token obtenido:', token.substring(0, 20) + '...');

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
          console.log('[PUSH] Token guardado en Supabase');
          setStatus('granted');
          localStorage.setItem('push_status', 'granted');
          showNotification('¡Notificaciones activadas! 🎉', 'success');
        } else {
          console.error('[PUSH] Error al guardar token');
          showNotification('Error al registrar. Intenta de nuevo.', 'error');
        }
      } else if (permission === 'denied') {
        console.log('[PUSH] Permiso denegado');
        setStatus('denied');
        localStorage.setItem('push_status', 'denied');
        showNotification('Notificaciones bloqueadas 😔', 'error');
      } else {
        console.log('[PUSH] Permiso no concedido (default)');
        showNotification('Debes aceptar el permiso de notificaciones', 'error');
      }
    } catch (error) {
      console.error('[PUSH] Error al activar notificaciones:', error);
      showNotification('Error al activar notificaciones', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'denied' && !('Notification' in window)) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleActivateNotifications}
        disabled={status === 'granted' || isLoading}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-full shadow-2xl transition-all duration-300 font-semibold text-sm ${
          status === 'granted'
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white cursor-default'
            : status === 'denied'
            ? 'bg-gray-400 text-gray-100 cursor-not-allowed opacity-60'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/50 hover:scale-105 animate-pulse-slow'
        }`}
        style={{
          animation: status === 'default' && !isLoading ? 'pulse-slow 2s ease-in-out infinite' : 'none'
        }}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="hidden sm:inline">Activando...</span>
          </>
        ) : status === 'granted' ? (
          <>
            <Check size={20} className="animate-bounce" />
            <span className="hidden sm:inline">Notificaciones activadas</span>
          </>
        ) : status === 'denied' ? (
          <>
            <BellOff size={20} />
            <span className="hidden sm:inline">Bloqueado</span>
          </>
        ) : (
          <>
            <Bell size={20} className="animate-wiggle" />
            <span className="hidden sm:inline">Activar notificaciones</span>
          </>
        )}
      </button>

      {showToast && (
        <div
          className={`fixed bottom-24 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl animate-slide-in ${
            toastType === 'success'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
              : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
          }`}
        >
          {toastType === 'success' ? (
            <Check size={20} />
          ) : (
            <X size={20} />
          )}
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
          50% { transform: scale(1.05); box-shadow: 0 25px 50px -12px rgba(147, 51, 234, 0.5); }
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }

        @keyframes slide-in {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
