import React, { useState, useEffect } from 'react';
import { loadData as loadFirebaseData, saveData } from '../services/databaseService';
import { format, parseISO } from 'date-fns';
// Remove the import of loadData from firebase.js if it exists
// import { db, loadData } from '../firebase.js';


const mainExercises = ['Squat', 'Deadlift', 'Overhead Press', 'Bench Press'];
const additionalExercisesList = ['Push Up', 'Pull Up', 'Chin Up', 'Leg Raise', 'Dips', 'Leg Extension', 'Barbell Row'];

const workoutSchedule = {
  1: {
    Monday: { main: 'Squat', supplemental: 'Deadlift', additional: ['Push Up', 'Leg Raise', 'Dips'] },
    Wednesday: { main: 'Overhead Press', supplemental: 'Bench Press', additional: ['Chin Up', 'Leg Raise', 'Barbell Row'] },
    Friday: { main: 'Deadlift', supplemental: 'Squat', additional: ['Pull Up', 'Leg Extension', 'Dips'] },
    Saturday: { main: 'Bench Press', supplemental: 'Overhead Press', additional: ['Push Up', 'Leg Raise', 'Barbell Row'] }
  },
  2: {
    Monday: { main: 'Squat', supplemental: 'Deadlift', additional: ['Chin Up', 'Leg Raise', 'Dips'] },
    Wednesday: { main: 'Overhead Press', supplemental: 'Bench Press', additional: ['Pull Up', 'Leg Extension', 'Barbell Row'] },
    Friday: { main: 'Deadlift', supplemental: 'Squat', additional: ['Push Up', 'Leg Raise', 'Dips'] },
    Saturday: { main: 'Bench Press', supplemental: 'Overhead Press', additional: ['Chin Up', 'Leg Raise', 'Barbell Row'] }
  },
  3: {
    Monday: { main: 'Squat', supplemental: 'Deadlift', additional: ['Pull Up', 'Leg Extension', 'Dips'] },
    Wednesday: { main: 'Overhead Press', supplemental: 'Bench Press', additional: ['Push Up', 'Leg Raise', 'Barbell Row'] },
    Friday: { main: 'Deadlift', supplemental: 'Squat', additional: ['Chin Up', 'Leg Raise', 'Dips'] },
    Saturday: { main: 'Bench Press', supplemental: 'Overhead Press', additional: ['Pull Up', 'Leg Extension', 'Barbell Row'] }
  }
};

const weekPercentages = {
  1: [65, 75, 85],
  2: [70, 80, 90],
  3: [75, 85, 95]
};

const loadFromFirebase = async (key, defaultValue) => {
  const snapshot = await get(ref(db, key));
  return snapshot.exists() ? snapshot.val() : defaultValue;
};

const WeeklyWorkoutOverview = () => {
  const [cycleStartDate, setCycleStartDate] = useState('');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [trainingMax, setTrainingMax] = useState({
    Squat: 0,
    Deadlift: 0,
    'Overhead Press': 0,
    'Bench Press': 0
  });
  const [additionalExercises, setAdditionalExercises] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const loadedCycleStartDate = await loadFirebaseData('cycleStartDate', format(new Date(), 'yyyy-MM-dd'));
      setCycleStartDate(loadedCycleStartDate);

      const loadedTrainingMax = await loadFirebaseData('trainingMax', trainingMax);
      setTrainingMax(loadedTrainingMax);

      const loadedAdditionalExercises = await loadFirebaseData('additionalExercises', {});
      setAdditionalExercises(loadedAdditionalExercises);

      // Calculate current week based on cycle start date
      const start = parseISO(loadedCycleStartDate);
      const today = new Date();
      const weeksPassed = Math.floor((today - start) / (7 * 24 * 60 * 60 * 1000));
      setCurrentWeek((weeksPassed % 3) + 1);
    };

    loadData();
  }, []);

  const calculateWeight = (exercise, percentage) => {
    const weight = trainingMax[exercise] * (percentage / 100);
    return Math.round(weight / 1.25) * 1.25; // Round to nearest 1.25 kg plate
  };

  const renderExercise = (exercise, type, day) => {
    if (type === 'main') {
      return (
        <div key={`${day}-${exercise}-main`} className="mb-4">
          <h3 className="text-lg font-medium">{exercise} (Main)</h3>
          {weekPercentages[currentWeek].map((percentage, index) => (
            <div key={index}>
              Set {index + 1}: {calculateWeight(exercise, percentage)} kg ({percentage}% of TM)
              {index === 2 && " (AMRAP)"}
            </div>
          ))}
        </div>
      );
    } else if (type === 'supplemental') {
      const suppWeight = calculateWeight(exercise, 60); // 60% of TM for supplemental
      return (
        <div key={`${day}-${exercise}-supplemental`} className="mb-4">
          <h3 className="text-lg font-medium">{exercise} (Supplemental)</h3>
          <div>5 x 10 @ {suppWeight} kg (60% of TM)</div>
        </div>
      );
    } else {
      const exerciseData = additionalExercises[exercise] || {};
      return (
        <div key={`${day}-${exercise}-additional`} className="mb-2">
          <h4 className="text-md font-medium">{exercise}</h4>
          <div>{exerciseData.setsReps || 'Sets x Reps not specified'}</div>
          <div>{exerciseData.weight ? `${exerciseData.weight} kg` : 'Weight not specified'}</div>
        </div>
      );
    }
  };

  const renderDayWorkout = (day) => {
    const workout = workoutSchedule[currentWeek][day];
    return (
      <div key={day} className="mb-6 p-4 border rounded shadow-sm">
        <h2 className="text-xl font-bold mb-3">{day}</h2>
        {renderExercise(workout.main, 'main', day)}
        {renderExercise(workout.supplemental, 'supplemental', day)}
        <div>
          <h3 className="text-lg font-medium mb-2">Additional Exercises</h3>
          {workout.additional.map(exercise => renderExercise(exercise, 'additional', day))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Weekly Workout Overview</h1>
      <div className="mb-4">
        <p>Cycle Start Date: {cycleStartDate}</p>
        <p>Current Week: {currentWeek}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(workoutSchedule[currentWeek]).map(renderDayWorkout)}
      </div>
    </div>
  );
};

export default WeeklyWorkoutOverview;