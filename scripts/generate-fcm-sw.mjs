import fs from "node:fs";

let content = fs.readFileSync("public/firebase-messaging-sw.template.js", "utf8");

content = content
  .replaceAll("__FIREBASE_API_KEY__", process.env.VITE_FIREBASE_API_KEY)
  .replaceAll("__FIREBASE_AUTH_DOMAIN__", process.env.VITE_FIREBASE_AUTH_DOMAIN)
  .replaceAll("__FIREBASE_PROJECT_ID__", process.env.VITE_FIREBASE_PROJECT_ID)
  .replaceAll("__FIREBASE_STORAGE_BUCKET__", process.env.VITE_FIREBASE_STORAGE_BUCKET)
  .replaceAll("__FIREBASE_MESSAGING_SENDER_ID__", process.env.VITE_FIREBASE_MESSAGING_SENDER_ID)
  .replaceAll("__FIREBASE_APP_ID__", process.env.VITE_FIREBASE_APP_ID);

fs.writeFileSync("public/firebase-messaging-sw.js", content);
