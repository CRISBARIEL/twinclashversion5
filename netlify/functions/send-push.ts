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
      .gte('last_seen', thirtyDaysAgo.toISOString())
      .limit(1000);

    if (fetchError) {
      throw new Error(`Failed to fetch tokens: ${fetchError.message}`);
    }

    if (!tokenRecords || tokenRecords.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          requested: 0,
          successCount: 0,
          failureCount: 0,
          message: 'No active tokens found'
        })
      };
    }

    const tokens = tokenRecords.map(r => r.token);

    console.log(`[PUSH-FUNCTION] Sending to ${tokens.length} tokens`);

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

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      ...message
    });

    const invalidTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error) {
        const errorCode = resp.error.code;
        if (errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered') {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      console.log(`[PUSH-FUNCTION] Removing ${invalidTokens.length} invalid tokens`);
      await supabase
        .from('push_tokens')
        .delete()
        .in('token', invalidTokens);
    }

    const errorsSample = response.responses
      .filter(r => !r.success)
      .slice(0, 5)
      .map(r => r.error?.message);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requested: tokens.length,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errorsSample
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
