# Push Notifications Setup Guide

This guide explains how to configure and use push notifications with Firebase Cloud Messaging (FCM) in your React + Vite + Netlify application.

## Architecture Overview

- **Frontend**: React app requests notification permission and obtains FCM token
- **Registration**: Netlify Function (`register-push`) securely stores token in Supabase using SERVICE_ROLE_KEY
- **Database**: Supabase stores FCM tokens (no direct writes from frontend)
- **Backend**: Netlify Function (`send-push`) sends push notifications to all registered users
- **Messaging**: Firebase Cloud Messaging (FCM) delivers notifications to browsers

### Security Pattern: Backend-Only Token Storage

**Critical**: The frontend NEVER writes directly to Supabase. All token registration goes through a Netlify Function with SERVICE_ROLE_KEY.

**Token Registration Flow**:
1. User clicks "Activar notificaciones"
2. Browser requests permission and gets FCM token from Firebase
3. Frontend calls `/.netlify/functions/register-push` (POST) with token
4. Netlify function validates and saves to Supabase using SERVICE_ROLE_KEY
5. No RLS INSERT policies needed - function has full database access

**Benefits**:
- ✅ No 401 Unauthorized errors
- ✅ Anonymous users can register tokens
- ✅ Centralized validation and logging
- ✅ Easy to add rate limiting or spam protection
- ✅ Simplified security (no complex RLS policies)

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

- Check Network tab for `register-push` function call
- If 500 error: Missing `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` in Netlify
- If 400 error: Token validation failed (check token format)
- Check Netlify function logs in Netlify dashboard

## Testing Token Registration (DevTools)

After enabling notifications, verify the registration flow works:

### 1. Open Browser DevTools

- Press F12 or right-click > Inspect
- Go to **Network** tab
- Filter by `register-push` or leave empty

### 2. Click "Activar notificaciones"

- Grant permission in browser prompt
- Watch for request to `register-push` in Network tab

### 3. Verify Request/Response

**Expected Request**:
```
POST /.netlify/functions/register-push
Content-Type: application/json

{
  "token": "eQbTK...",
  "client_id": "123e4567-e89b-12d3-a456-426614174000",
  "platform": "web",
  "locale": "es-ES"
}
```

**Expected Response (200 OK)**:
```json
{
  "ok": true
}
```

**If 500 Error**: Check Netlify function logs for missing environment variables
**If 400 Error**: Token validation failed (token too short or invalid format)
**If Network Error**: Function not deployed or Netlify issue

### 4. Check Console Logs

Look for these logs in order:
```
[PUSH] Token: eQbTK... (truncated)
[PUSH] Registering token via Netlify function...
[PUSH] Token registered successfully via backend
[NotificationButton] Successfully registered for push notifications
```

### 5. Verify in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** > `push_tokens`
3. You should see your token with:
   - `token`: Your FCM token (long string)
   - `client_id`: UUID from localStorage
   - `platform`: "web"
   - `user_agent`: Your browser info
   - `locale`: Your language (e.g., "es-ES")
   - `last_seen`: Current timestamp

### Quick Test Command

Test the registration endpoint directly (replace with your real token):

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/register-push \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eQbTKxPHrfE:APA91bE...",
    "client_id": "test-client-123",
    "platform": "web",
    "locale": "es-ES"
  }'
```

Expected response: `{"ok":true}`

## Files Modified/Created

- `src/lib/push.ts` - Push notification utilities (FCM token management, now calls Netlify function)
- `src/components/NotificationButton.tsx` - User-facing notification activation button
- `src/components/AdminPanel.tsx` - Integrated "Push" tab for sending notifications
- `src/main.tsx` - Integration with app initialization
- **`netlify/functions/register-push.ts`** - **NEW**: Register user tokens (no auth required, backend-only storage)
- `netlify/functions/send-push.ts` - Netlify function for batch sending notifications (admin only)
- `supabase/migrations/*_create_push_tokens_table.sql` - Database migrations
- `README_PUSH.md` - This documentation

## Important Notes

- **ads.txt** and **AdSense** configuration remain unchanged
- **netlify.toml** redirects and headers remain unchanged
- Push notifications work alongside existing features without interference
- Service worker is automatically generated during build with Firebase credentials
- **Admin key** is separate from world management password

## Production Deployment (Netlify)

### Critical: Service Worker Generation

The service worker (`firebase-messaging-sw.js`) is generated at build time by `scripts/generate-fcm-sw.mjs`. This script:
- Loads Firebase environment variables (VITE_FIREBASE_*)
- Replaces placeholders in the template with actual values
- Generates the final service worker with correct configuration

**In Netlify**:
1. Environment variables are automatically available during build
2. The build command `npm run build` runs the generation script
3. The service worker is copied to `dist/` with correct Firebase config

### Troubleshooting: "Notification button locked/blocked in production"

If the notification button works in preview but not in production:

**1. Verify Service Worker Configuration**
- Download `firebase-messaging-sw.js` from your production site
- Check if Firebase config has real values (not "undefined")
- If values are undefined, environment variables weren't available during build

**2. Check Netlify Environment Variables**
- Go to Site settings > Environment variables
- Verify all `VITE_FIREBASE_*` variables are set
- Redeploy after adding/updating variables

**3. Check Browser Console**
- Look for `[NotificationButton]` logs showing the registration flow
- Look for `[PUSH]` logs from the initialization
- Common errors:
  - "VAPID key not configured" → Missing `VITE_FIREBASE_VAPID_KEY`
  - "Token not generated" → Service worker config is wrong or not ready
  - "Service worker not found" → Build didn't copy it to dist/

**4. Test Locally First**
- Create `.env` file with all Firebase variables
- Run `npm run build` (should show: `[generate-fcm-sw] Service worker generated`)
- Check `dist/firebase-messaging-sw.js` has real Firebase values
- Run `npm run preview` and test notifications

**5. Service Worker DevTools**
- Open DevTools > Application > Service Workers
- Verify `/firebase-messaging-sw.js` is registered and active
- Click on the service worker to see its console
- Look for initialization errors
