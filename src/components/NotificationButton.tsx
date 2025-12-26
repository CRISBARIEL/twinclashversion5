import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { ensureNotificationPermission, getFcmToken, upsertPushToken } from '../lib/push';
import { getOrCreateClientId } from '../lib/supabase';
import { firebaseApp } from '../lib/firebaseApp';

export const NotificationButton = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.error('[NotificationButton] Browser not supported');
      alert('Tu navegador no soporta notificaciones push');
      return;
    }

    console.log('[NotificationButton] Current permission:', permission);

    if (permission === 'granted') {
      console.log('[NotificationButton] Permission already granted, showing tooltip');
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      return;
    }

    console.log('[NotificationButton] Requesting notification permission...');
    setIsLoading(true);

    try {
      const requestedPermission = await ensureNotificationPermission();
      console.log('[NotificationButton] Permission result:', requestedPermission);

      if (requestedPermission === 'granted') {
        console.log('[NotificationButton] Getting FCM token...');
        const token = await getFcmToken(firebaseApp);

        if (token) {
          console.log('[NotificationButton] Token obtained, saving to database...');
          const clientId = getOrCreateClientId();
          await upsertPushToken(token, clientId);

          setPermission('granted');
          console.log('[NotificationButton] Successfully registered for push notifications');
          alert('¡Notificaciones activadas! Te avisaremos de retos diarios y eventos especiales.');
        } else {
          console.warn('[NotificationButton] Token not generated - check VAPID key and service worker');
          setPermission(Notification.permission);
          alert('No se pudo obtener el token. Verifica la configuración de Firebase.');
        }
      } else {
        console.log('[NotificationButton] Permission not granted:', requestedPermission);
        setPermission(requestedPermission);
      }
    } catch (error) {
      console.error('[NotificationButton] Error requesting permission:', error);
      setPermission(Notification.permission);
      alert('Error al activar notificaciones. Revisa la consola para más detalles.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return null;
  }

  const buttonText = permission === 'granted' ? 'Notificaciones activadas' :
                     permission === 'denied' ? 'Notificaciones bloqueadas' :
                     'Activar notificaciones';

  const Icon = permission === 'granted' ? Bell : BellOff;
  const bgColor = permission === 'granted' ? 'bg-green-500 hover:bg-green-600' :
                  permission === 'denied' ? 'bg-gray-400 cursor-not-allowed' :
                  'bg-blue-500 hover:bg-blue-600';

  return (
    <div className="relative">
      <button
        onClick={handleRequestPermission}
        disabled={isLoading || permission === 'denied'}
        className={`${bgColor} text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg text-sm`}
        title={buttonText}
      >
        <Icon size={18} />
        {isLoading ? (
          <span>Activando...</span>
        ) : (
          <span className="hidden sm:inline">{buttonText}</span>
        )}
      </button>

      {showTooltip && permission === 'granted' && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50">
          Ya están activadas
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
        </div>
      )}
    </div>
  );
};
