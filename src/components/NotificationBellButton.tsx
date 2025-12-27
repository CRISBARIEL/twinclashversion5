import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { getMessaging, getToken } from 'firebase/messaging';
import { firebaseApp } from '../lib/firebaseApp';
import toast, { Toaster } from 'react-hot-toast';

type PushStatus = 'default' | 'granted' | 'denied';

interface NotificationBellButtonProps {
  isHomeScreen: boolean;
}

export function NotificationBellButton({ isHomeScreen }: NotificationBellButtonProps) {
  const [status, setStatus] = useState<PushStatus>('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = () => {
    console.log('[PUSH BELL] Verificando estado inicial...');

    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.log('[PUSH BELL] Navegador no soporta notificaciones');
      setStatus('denied');
      localStorage.setItem('push_status', 'denied');
      return;
    }

    const savedStatus = localStorage.getItem('push_status') as PushStatus | null;

    if (savedStatus) {
      console.log('[PUSH BELL] Estado guardado en localStorage:', savedStatus);
      setStatus(savedStatus);
    } else if (Notification.permission === 'granted') {
      console.log('[PUSH BELL] Permiso ya concedido por el navegador');
      setStatus('granted');
      localStorage.setItem('push_status', 'granted');
    } else if (Notification.permission === 'denied') {
      console.log('[PUSH BELL] Permiso denegado por el navegador');
      setStatus('denied');
      localStorage.setItem('push_status', 'denied');
    } else {
      console.log('[PUSH BELL] Estado pendiente - esperando acción del usuario');
      setStatus('default');
    }
  };

  const handleActivateNotifications = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.error('[PUSH BELL] Navegador no soporta notificaciones');
      toast.error('Tu navegador no soporta notificaciones', {
        duration: 4000,
        position: 'bottom-right',
      });
      setStatus('denied');
      localStorage.setItem('push_status', 'denied');
      return;
    }

    if (status === 'granted') {
      console.log('[PUSH BELL] Ya está activado, no hacer nada');
      return;
    }

    console.log('[PUSH BELL] Usuario hizo clic - solicitando permiso...');
    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();
      console.log('[PUSH BELL] Resultado del permiso:', permission);

      if (permission === 'granted') {
        console.log('[PUSH BELL] ✅ Permiso concedido - obteniendo token...');

        const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

        if (!VAPID_KEY) {
          console.error('[PUSH BELL] ❌ VITE_FIREBASE_VAPID_KEY no configurada');
          toast.error('Error de configuración. Contacta a soporte.', {
            duration: 4000,
            position: 'bottom-right',
          });
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
          console.error('[PUSH BELL] ❌ No se pudo obtener el token FCM');
          toast.error('Error al obtener token. Intenta de nuevo.', {
            duration: 4000,
            position: 'bottom-right',
          });
          setIsLoading(false);
          return;
        }

        console.log('[PUSH BELL] ✅ Token obtenido:', token.substring(0, 20) + '...');
        console.log('[PUSH BELL] Guardando token en Supabase...');

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
          console.log('[PUSH BELL] ✅ Token guardado exitosamente en Supabase');
          setStatus('granted');
          localStorage.setItem('push_status', 'granted');
          toast.success('¡Notificaciones activadas! 🎉', {
            duration: 4000,
            position: 'bottom-right',
            icon: '🔔',
          });
        } else {
          console.error('[PUSH BELL] ❌ Error al guardar token en backend');
          toast.error('Error al registrar. Intenta de nuevo.', {
            duration: 4000,
            position: 'bottom-right',
          });
        }
      } else if (permission === 'denied') {
        console.log('[PUSH BELL] ❌ Usuario denegó el permiso');
        setStatus('denied');
        localStorage.setItem('push_status', 'denied');
        toast.error('Notificaciones bloqueadas 😔', {
          duration: 4000,
          position: 'bottom-right',
        });
      } else {
        console.log('[PUSH BELL] ⚠️ Permiso no concedido (default)');
        toast('Debes aceptar el permiso de notificaciones', {
          duration: 4000,
          position: 'bottom-right',
        });
      }
    } catch (error) {
      console.error('[PUSH BELL] ❌ Error al activar notificaciones:', error);
      toast.error('Error al activar notificaciones', {
        duration: 4000,
        position: 'bottom-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHomeScreen) {
    return null;
  }

  if (status === 'denied') {
    return (
      <>
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Toaster />
      <button
        onClick={handleActivateNotifications}
        disabled={status === 'granted' || isLoading}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
          status === 'granted'
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 cursor-default'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/50 hover:scale-110 animate-pulse-slow'
        }`}
        title={status === 'granted' ? 'Notificaciones activadas' : 'Activar notificaciones'}
      >
        {isLoading ? (
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        ) : status === 'granted' ? (
          <Check size={32} className="text-white animate-bounce" />
        ) : (
          <Bell size={32} className="text-white animate-wiggle" />
        )}
      </button>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 25px 50px -12px rgba(147, 51, 234, 0.5);
          }
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }

        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
