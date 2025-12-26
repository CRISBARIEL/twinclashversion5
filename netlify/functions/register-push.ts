import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRole) {
      console.error('[REGISTER-PUSH] Supabase credentials not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Server configuration error: Supabase credentials missing'
        })
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { token, client_id, platform = 'web', locale } = body;

    if (!token || typeof token !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Token is required and must be a string' })
      };
    }

    if (token.length < 20) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Token appears to be invalid (too short)' })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    const userAgent = event.headers['user-agent'] || 'unknown';
    const now = new Date().toISOString();

    const upsertData: any = {
      token,
      platform,
      user_agent: userAgent,
      last_seen: now
    };

    if (client_id) {
      upsertData.client_id = client_id;
    }

    if (locale) {
      upsertData.locale = locale;
    }

    const { error } = await supabase
      .from('push_tokens')
      .upsert(upsertData, {
        onConflict: 'token'
      });

    if (error) {
      console.error('[REGISTER-PUSH] Database error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to save token',
          details: error.message
        })
      };
    }

    console.log('[REGISTER-PUSH] Token registered successfully');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ok: true })
    };
  } catch (error: any) {
    console.error('[REGISTER-PUSH] Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Internal server error'
      })
    };
  }
};
