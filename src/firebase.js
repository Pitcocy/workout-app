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
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log('Firebase config:', firebaseConfig);

// Firebase initialization should be done outside the try-catch to ensure the variables are scoped correctly
const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized:', app);
const db = getDatabase(app);
console.log('Firebase database initialized:', db);

// Exporting db and functions outside the try-catch block
export { db };

export const saveData = (key, value) => {
  console.log(`Saving data: ${key}`, value);
  return set(ref(db, key), value);
};

export const loadData = async (key, defaultValue) => {
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