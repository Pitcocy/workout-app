import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAKr2eg2sDJKFMm2BbqvULodQrlOi8kNb4",
    authDomain: "workout-app-6446a.firebaseapp.com",
    projectId: "workout-app-6446a",
    storageBucket: "workout-app-6446a.appspot.com",
    messagingSenderId: "661413170013",
    appId: "1:661413170013:web:4280a50dcb7ce7567e36b4",
    measurementId: "G-7W6Q2BS09M"
  };

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

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