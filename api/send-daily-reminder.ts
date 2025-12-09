/**
 * Vercel Serverless Function: Send Daily Reminder via OneSignal
 *
 * USAGE:
 * This endpoint is designed to be called by a Vercel Cron Job (Scheduled Function).
 * Configure a daily cron in your Vercel dashboard to hit this endpoint.
 *
 * TESTING:
 * You can test manually with:
 * curl -X POST https://your-deployment-url.vercel.app/api/send-daily-reminder
 *
 * ENVIRONMENT VARIABLES (set in Vercel):
 * - ONESIGNAL_APP_ID: Your OneSignal App ID (same as frontend)
 * - ONESIGNAL_API_KEY: Your OneSignal REST API Key (server-side only, NEVER expose in frontend)
 * - PUBLIC_SITE_URL: Your site URL (default: https://twinclash.org)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed. Use POST (or GET for testing).'
    });
  }

  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_API_KEY;
  const siteUrl = process.env.PUBLIC_SITE_URL || 'https://twinclash.org';

  if (!appId || !apiKey) {
    return res.status(500).json({
      ok: false,
      error: 'Missing ONESIGNAL_APP_ID or ONESIGNAL_API_KEY environment variables'
    });
  }

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${apiKey}`
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ['Subscribed Users'],
        headings: {
          en: '🔥 Vuelve a jugar a TwinClash'
        },
        contents: {
          en: 'Hay nuevos retos esperándote. Pon a prueba tu memoria hoy ⚡'
        },
        url: siteUrl
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[OneSignal Error]', data);
      return res.status(500).json({
        ok: false,
        error: data.errors || 'Failed to send notification via OneSignal',
        details: data
      });
    }

    console.log('[OneSignal Success]', data);
    return res.status(200).json({
      ok: true,
      message: 'Daily reminder sent successfully',
      recipients: data.recipients || 0
    });

  } catch (error) {
    console.error('[Send Daily Reminder Error]', error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
