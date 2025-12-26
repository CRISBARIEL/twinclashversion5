# Push Notifications Setup Guide

This guide explains how to configure and use push notifications with Firebase Cloud Messaging (FCM) in your React + Vite + Netlify application.

## Architecture Overview

- **Frontend**: React app requests notification permission, obtains FCM token, and stores it in Supabase
- **Database**: Supabase stores FCM tokens for anonymous users
- **Backend**: Netlify Function sends push notifications to all registered users
- **Messaging**: Firebase Cloud Messaging (FCM) delivers notifications to browsers

## Environment Variables

### Frontend (Vite)

Add these to your `.env` file and Netlify environment:

```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

Get your Firebase config from: [Firebase Console](https://console.firebase.google.com/) > Project Settings > General

Get your VAPID key from: Firebase Console > Project Settings > Cloud Messaging > Web Push certificates

### Backend (Netlify Functions)

Add these to your Netlify environment variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

ADMIN_PUSH_KEY=your_secure_random_key_here

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----"
```

#### Getting Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Extract the values:
   - `FIREBASE_PROJECT_ID`: `project_id` from JSON
   - `FIREBASE_CLIENT_EMAIL`: `client_email` from JSON
   - `FIREBASE_PRIVATE_KEY`: `private_key` from JSON (keep the `\n` newlines)

## Database Schema

The migration creates a `push_tokens` table with the following structure:

```sql
CREATE TABLE push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text,
  token text UNIQUE NOT NULL,
  platform text DEFAULT 'web',
  created_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now()
);
```

### Row Level Security (RLS)

- Anonymous users can **INSERT** and **UPDATE** their own tokens
- Only the **service role** can **SELECT** tokens (for sending notifications)
- This ensures users cannot see other users' tokens

## How It Works

### 1. User Opens the App

1. Service worker (`firebase-messaging-sw.js`) is registered
2. Firebase is initialized with config from environment variables
3. App requests notification permission from user
4. If granted, FCM token is generated
5. Token is saved to Supabase `push_tokens` table
6. A unique `client_id` is generated and stored in localStorage

### 2. Sending Notifications

#### Using the Admin Panel

The push notifications feature is integrated into the existing AdminPanel:

1. Open the Admin Panel in your app
2. Click on the "Push" tab
3. Enter your admin key (saved in localStorage for convenience)
4. Compose your notification:
   - **Título**: Notification title
   - **Mensaje**: Notification message body
   - **URL**: Landing page URL (default: https://twinclash.org/)
5. Click "Enviar a Todos" to send to all registered users

The admin key is separate from the world management password and must match the `ADMIN_PUSH_KEY` environment variable.

#### Using API Directly

Send a POST request to the Netlify function:

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/send-push \
  -H "Content-Type: application/json" \
  -H "x-admin-key: your_admin_key_here" \
  -d '{
    "title": "New Challenge!",
    "body": "A new level is available. Play now!",
    "url": "https://twinclash.org/"
  }'
```

#### Response Format

```json
{
  "ok": true,
  "sent": 98,
  "failed": 2
}
```

### 3. Token Cleanup

- Notifications are only sent to tokens with `last_seen` within the last 30 days
- Invalid tokens (unregistered, expired) are automatically removed from the database
- Tokens are sent in batches of 500 (FCM limit) to handle any number of users
- No limit on total tokens - all active tokens will be processed

## Testing

### Test Notification Permission

1. Open your app in a browser
2. Check the browser console for logs:
   - `[PUSH] Permission: granted` - permission granted
   - `[PUSH] Token: abc123...` - token generated
   - `[PUSH] Saved token to Supabase` - token saved

### Test Sending Notifications

1. Get your admin key from environment variables
2. Use the AdminPushPanel component or curl to send a test notification
3. Check the response for success/failure counts
4. Verify notification appears in the browser (if permission granted)

### Debug Checklist

- [ ] Service worker registered successfully
- [ ] Notification permission is "granted"
- [ ] FCM token is generated (check console)
- [ ] Token is saved in Supabase `push_tokens` table
- [ ] Firebase Admin credentials are correct
- [ ] Admin key matches between request and environment
- [ ] VAPID key is correct and matches Firebase project

## Security Notes

- **Never commit** environment variables to git
- **Keep `ADMIN_PUSH_KEY` secret** - only share with authorized admins
- **Service role key** should only be used server-side (Netlify Functions)
- **VAPID key** can be public (it's in the client-side code)
- RLS policies ensure users cannot access other users' tokens

## Browser Compatibility

Push notifications are supported in:
- Chrome 50+
- Firefox 44+
- Safari 16+ (macOS 13+)
- Edge 17+

Note: Notifications require HTTPS (or localhost for testing)

## Troubleshooting

### No token generated

- Check if service worker is registered
- Verify notification permission is granted
- Check VAPID key is correct
- Ensure HTTPS is enabled (required for push notifications)

### Notifications not sending

- Verify Firebase Admin credentials
- Check admin key is correct
- Ensure tokens exist in database with recent `last_seen`
- Check Netlify function logs for errors

### Tokens not saving to Supabase

- Verify Supabase URL and anon key
- Check RLS policies are configured correctly
- Ensure `push_tokens` table exists

## Files Modified/Created

- `src/lib/push.ts` - Push notification utilities (FCM token management)
- `src/components/AdminPanel.tsx` - Integrated "Push" tab for sending notifications
- `src/main.tsx` - Integration with app initialization
- `netlify/functions/send-push.ts` - Netlify function for batch sending notifications
- `supabase/migrations/*_create_push_tokens_table.sql` - Database migrations
- `README_PUSH.md` - This documentation

## Important Notes

- **ads.txt** and **AdSense** configuration remain unchanged
- **netlify.toml** redirects and headers remain unchanged
- Push notifications work alongside existing features without interference
