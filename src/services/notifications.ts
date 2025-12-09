/**
 * Frontend helper to trigger OneSignal push notifications
 *
 * These functions call serverless endpoints that send notifications via OneSignal.
 * DO NOT expose OneSignal API keys in frontend code.
 * All actual sending happens server-side in /api functions.
 */

/**
 * Triggers a daily reminder notification to all subscribed users
 *
 * @returns Promise<boolean> - true if notification was sent successfully
 *
 * @example
 * // From an admin panel or debug button:
 * const success = await triggerDailyReminder();
 * if (success) {
 *   console.log('Daily reminder sent!');
 * } else {
 *   console.error('Failed to send daily reminder');
 * }
 */
export async function triggerDailyReminder(): Promise<boolean> {
  try {
    const res = await fetch('/api/send-daily-reminder', {
      method: 'POST',
    });

    if (!res.ok) {
      console.error('[triggerDailyReminder] HTTP error:', res.status, res.statusText);
      return false;
    }

    const data = await res.json();

    if (data.ok === true) {
      console.log('[triggerDailyReminder] Success:', data);
      return true;
    } else {
      console.error('[triggerDailyReminder] API returned error:', data);
      return false;
    }
  } catch (error) {
    console.error('[triggerDailyReminder] Error:', error);
    return false;
  }
}
