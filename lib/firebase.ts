import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

let messaging: ReturnType<typeof getMessaging> | null = null;
let swRegistration: ServiceWorkerRegistration | null = null;

const ensureMessagingReady = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  if (!(await isSupported())) {
    return null;
  }

  if (!swRegistration) {
    try {
      swRegistration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js'
      );
      console.log(
        'Service Worker registered with scope:',
        swRegistration.scope
      );
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  if (!messaging) {
    messaging = getMessaging(app);
  }

  return messaging;
};

export const requestFirebaseToken = async (): Promise<string | null> => {
  try {
    const activeMessaging = await ensureMessagingReady();

    if (!activeMessaging) {
      return null;
    }

    const token = await getToken(activeMessaging, {
      serviceWorkerRegistration: swRegistration ?? undefined,
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });
    return token;
  } catch (error) {
    console.error('Error getting Firebase token:', error);
    return null;
  }
};

export default app;
