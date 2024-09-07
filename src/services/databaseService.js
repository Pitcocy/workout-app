import { db, auth } from '../firebase';
import { ref, set, get, update } from 'firebase/database';

export const saveData = async (key, value) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  return set(ref(db, `users/${user.uid}/${key}`), value);
};

export const loadData = async (key, defaultValue) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  const snapshot = await get(ref(db, `users/${user.uid}/${key}`));
  return snapshot.exists() ? snapshot.val() : defaultValue;
};

export const updateData = async (updates) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  const userRef = ref(db, `users/${user.uid}`);
  return update(userRef, updates);
};

export const migrateDataForNewUser = async (userId) => {
  const rootSnapshot = await get(ref(db, '/'));
  const rootData = rootSnapshot.val();
  
  if (rootData && !rootData.users) {
    // This assumes your old data structure had keys at the root level
    const userRef = ref(db, `users/${userId}`);
    await set(userRef, rootData);
    
    // Optionally, clear the old data
    // await set(ref(db, '/'), null);
  }
};
