import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const template = readFileSync(join(__dirname, 'public/firebase-messaging-sw.template.js'), 'utf-8');

const sw = template
  .replace('__FIREBASE_API_KEY__', process.env.VITE_FIREBASE_API_KEY || '')
  .replace('__FIREBASE_AUTH_DOMAIN__', process.env.VITE_FIREBASE_AUTH_DOMAIN || '')
  .replace('__FIREBASE_PROJECT_ID__', process.env.VITE_FIREBASE_PROJECT_ID || '')
  .replace('__FIREBASE_STORAGE_BUCKET__', process.env.VITE_FIREBASE_STORAGE_BUCKET || '')
  .replace('__FIREBASE_MESSAGING_SENDER_ID__', process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '')
  .replace('__FIREBASE_APP_ID__', process.env.VITE_FIREBASE_APP_ID || '');

writeFileSync(join(__dirname, 'public/firebase-messaging-sw.js'), sw);
console.log('✓ Service worker generated from template');
