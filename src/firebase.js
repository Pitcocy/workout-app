import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };

export const saveData = (key, value) => {
  return set(ref(db, key), value);
};

export const loadData = async (key, defaultValue) => {
  try {
    const snapshot = await get(ref(db, key));
    return snapshot.exists() ? snapshot.val() : defaultValue;
  } catch (error) {
    console.error('Error loading data from Firebase:', error);
    return defaultValue;
  }
};