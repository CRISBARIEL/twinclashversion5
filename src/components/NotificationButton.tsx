import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { requestNotificationPermission, getNotificationPermissionStatus, isNotificationSupported } from '../lib/firebase';
import { getOrCreateClientId } from '../lib/supabase';

export const NotificationButton = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (isNotificationSupported()) {
      setPermission(getNotificationPermissionStatus());
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!isNotificationSupported()) {
      alert('Tu navegador no soporta notificaciones push');
      return;
    }

    if (permission === 'granted') {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      return;
    }

    setIsLoading(true);

    try {
      const clientId = getOrCreateClientId();
      const token = await requestNotificationPermission(clientId);

      if (token) {
        setPermission('granted');
        alert('¡Notificaciones activadas! Te avisaremos de retos diarios y eventos especiales.');
      } else {
        setPermission(Notification.permission);
      }
    } catch (error) {
      console.error('[NotificationButton] Error requesting permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isNotificationSupported()) {
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
