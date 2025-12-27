import { Handler } from '@netlify/functions';
import * as admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

let adminInitialized = false;

function initializeFirebaseAdmin() {
  if (adminInitialized) return;

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase Admin credentials not configured');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });

    adminInitialized = true;
    console.log('[PUSH-FUNCTION] Firebase Admin initialized');
  } catch (error) {
    console.error('[PUSH-FUNCTION] Firebase Admin init error:', error);
    throw error;
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const adminKey = event.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_PUSH_KEY;

  if (!adminKey || adminKey !== expectedKey) {
    console.warn('[PUSH-FUNCTION] Unauthorized access attempt');
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    const { title, body, url = 'https://twinclash.org/' } = JSON.parse(event.body || '{}');

    if (!title || !body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Title and body are required' })
      };
    }

    initializeFirebaseAdmin();

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRole) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: tokenRecords, error: fetchError } = await supabase
      .from('push_tokens')
      .select('token')
      .gte('last_seen', thirtyDaysAgo.toISOString());

    if (fetchError) {
      throw new Error(`Failed to fetch tokens: ${fetchError.message}`);
    }

    if (!tokenRecords || tokenRecords.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          sent: 0,
          failed: 0,
          message: 'No active tokens found'
        })
      };
    }

    const allTokens = tokenRecords.map(r => r.token);
    const BATCH_SIZE = 500;

    let totalSent = 0;
    let totalFailed = 0;
    const invalidTokens: string[] = [];

    console.log(`[PUSH-FUNCTION] Sending to ${allTokens.length} tokens in batches of ${BATCH_SIZE}`);

    const message = {
      notification: {
        title,
        body
      },
      webpush: {
        fcmOptions: {
          link: url
        }
      }
    };

    for (let i = 0; i < allTokens.length; i += BATCH_SIZE) {
      const tokenBatch = allTokens.slice(i, i + BATCH_SIZE);

      console.log(`[PUSH-FUNCTION] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}: ${tokenBatch.length} tokens`);

      const response = await admin.messaging().sendEachForMulticast({
        tokens: tokenBatch,
        ...message
      });

      totalSent += response.successCount;
      totalFailed += response.failureCount;

      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          const errorCode = resp.error.code;
          if (errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered') {
            invalidTokens.push(tokenBatch[idx]);
          }
        }
      });
    }

    if (invalidTokens.length > 0) {
      console.log(`[PUSH-FUNCTION] Removing ${invalidTokens.length} invalid tokens`);

      for (let i = 0; i < invalidTokens.length; i += 100) {
        const deleteChunk = invalidTokens.slice(i, i + 100);
        await supabase
          .from('push_tokens')
          .delete()
          .in('token', deleteChunk);
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        ok: true,
        sent: totalSent,
        failed: totalFailed
      })
    };
  } catch (error: any) {
    console.error('[PUSH-FUNCTION] Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Internal server error'
      })
    };
  }
};
