const WEIGHT_TRACKER_KEY = 'weightTrackerData';
const WORKOUT_TRACKER_KEY = 'workoutTrackerData';

export const saveWeightData = (data) => {
  try {
    localStorage.setItem(WEIGHT_TRACKER_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving weight data to localStorage:', error);
  }
};

export const loadWeightData = () => {
  try {
    const storedData = localStorage.getItem(WEIGHT_TRACKER_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Error loading weight data from localStorage:', error);
    return [];
  }
};

export const saveWorkoutData = (key, value) => {
  try {
    const existingData = loadWorkoutData();
    const updatedData = { ...existingData, [key]: value };
    localStorage.setItem(WORKOUT_TRACKER_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error saving workout data to localStorage:', error);
  }
};

export const loadWorkoutData = (key, defaultValue) => {
  try {
    const storedData = localStorage.getItem(WORKOUT_TRACKER_KEY);
    const data = storedData ? JSON.parse(storedData) : {};
    return data.hasOwnProperty(key) ? data[key] : defaultValue;
  } catch (error) {
    console.error('Error loading workout data from localStorage:', error);
    return defaultValue;
  }
};

// New function to load all workout data
export const loadAllWorkoutData = () => {
  try {
    const storedData = localStorage.getItem(WORKOUT_TRACKER_KEY);
    return storedData ? JSON.parse(storedData) : {};
  } catch (error) {
    console.error('Error loading all workout data from localStorage:', error);
    return {};
  }
};