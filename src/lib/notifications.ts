import { LocalNotifications } from '@capacitor/local-notifications';

export async function initializeNotifications() {
  try {
    const permission = await LocalNotifications.requestPermissions();

    if (permission.display === 'granted') {
      await scheduleDailyReminder();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
}

export async function scheduleDailyReminder() {
  try {
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(19, 0, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: '🎮 Twin Clash te extraña!',
          body: 'Vuelve y completa tu reto diario. ¡Gana monedas extra!',
          schedule: {
            at: scheduledTime,
            repeats: true,
            every: 'day'
          },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null
        }
      ]
    });

    console.log('Daily reminder scheduled for', scheduledTime);
    return true;
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
    return false;
  }
}

export async function cancelAllNotifications() {
  try {
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
    return true;
  } catch (error) {
    console.error('Error canceling notifications:', error);
    return false;
  }
}

export async function checkNotificationPermissions(): Promise<boolean> {
  try {
    const permission = await LocalNotifications.checkPermissions();
    return permission.display === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
}
