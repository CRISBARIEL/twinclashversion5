# Netlify Environment Variables Setup

## Required Environment Variables

To deploy this project on Netlify, you need to configure the following environment variables in your Netlify dashboard:

### Supabase Variables
```
VITE_SUPABASE_URL=https://fdlqyqeobwumyjuqgrpl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbHF5cWVvYnd1bXlqdXFncnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NjUyNzgsImV4cCI6MjA3ODM0MTI3OH0.8FPhoxYODWFnkileEwT7S5piPX53Hk1YwLoGB5zppPI
```

### Firebase Variables
```
VITE_FIREBASE_API_KEY=AIzaSyAw4bFf4JssC0FWFD12-ImaJpDC8dg
VITE_FIREBASE_AUTH_DOMAIN=twinclash-c6eac.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=twinclash-c6eac
VITE_FIREBASE_STORAGE_BUCKET=twinclash-c6eac.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=189939875668
VITE_FIREBASE_APP_ID=1:189939875668:web:6330e6e16d82051fb18c1
```

## How to Add Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add each variable from above with its corresponding value
6. Click **Save**
7. Trigger a new deploy

## Important Notes

- These environment variables are injected at **build time** by Vite
- Firebase API keys are meant to be public (they're used client-side)
- Security for Firebase comes from Security Rules, not from hiding the API key
- The service worker (`firebase-messaging-sw.js`) is generated during build from the template
- Never commit `.env` file to the repository
