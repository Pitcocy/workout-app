import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';

console.log('Firebase module loaded');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: "https://workout-app-6446a-default-rtdb.firebaseio.com"
};

console.log('Firebase config:', JSON.stringify(firebaseConfig, null, 2));

let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized:', app);
  db = getDatabase(app);
  console.log('Firebase database initialized:', db);
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { db };

export const saveData = (key, value) => {
  if (!db) {
    console.error('Firebase database not initialized');
    return Promise.reject('Firebase database not initialized');
  }
  console.log(`Saving data: ${key}`, value);
  return set(ref(db, key), value);
};

export const loadData = async (key, defaultValue) => {
  if (!db) {
    console.error('Firebase database not initialized');
    return defaultValue;
  }
  try {
    console.log(`Loading data: ${key}`);
    const snapshot = await get(ref(db, key));
    const result = snapshot.exists() ? snapshot.val() : defaultValue;
    console.log(`Loaded data: ${key}`, result);
    return result;
  } catch (error) {
    console.error('Error loading data from Firebase:', error);
    return defaultValue;
  }
};