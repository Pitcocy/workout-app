import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { getDatabase, ref, set, get } from 'firebase/database';

const db = getDatabase();

const mainExercises = ['Squat', 'Deadlift', 'Overhead Press', 'Bench Press'];
const additionalExercisesList = ['Push Up', 'Pull Up', 'Chin Up', 'Leg Raise', 'Dips', 'Leg Extension', 'Barbell Row'];

const saveToFirebase = (key, value) => {
  set(ref(db, key), value);
};

const loadFromFirebase = async (key, defaultValue) => {
  const snapshot = await get(ref(db, key));
  return snapshot.exists() ? snapshot.val() : defaultValue;
};

const TrainingMaxOverview = () => {
  const [trainingMax, setTrainingMax] = useState({
    Squat: 0,
    Deadlift: 0,
    'Overhead Press': 0,
    'Bench Press': 0
  });
  const [additionalExercises, setAdditionalExercises] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('Squat');
  const [cycleStartDate, setCycleStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newHistoricalEntry, setNewHistoricalEntry] = useState({
    date: '',
    Squat: '',
    Deadlift: '',
    'Overhead Press': '',
    'Bench Press': ''
  });

  useEffect(() => {
    const loadData = async () => {
      const loadedTrainingMax = await loadFromFirebase('trainingMax', trainingMax);
      setTrainingMax(loadedTrainingMax);

      const loadedAdditionalExercises = await loadFromFirebase('additionalExercises', {});
      setAdditionalExercises(loadedAdditionalExercises);

      const loadedHistoricalData = await loadFromFirebase('historicalData', []);
      setHistoricalData(loadedHistoricalData);

      const loadedCycleStartDate = await loadFromFirebase('cycleStartDate', cycleStartDate);
      setCycleStartDate(loadedCycleStartDate);
    };

    loadData();
  }, []);

  const handleTrainingMaxChange = (exercise, value) => {
    const updatedTrainingMax = {
      ...trainingMax,
      [exercise]: parseFloat(value) || 0
    };
    setTrainingMax(updatedTrainingMax);
    saveToFirebase('trainingMax', updatedTrainingMax);
  };

  const handleAdditionalExerciseChange = (exercise, field, value) => {
    const updatedAdditionalExercises = {
      ...additionalExercises,
      [exercise]: {
        ...additionalExercises[exercise],
        [field]: field === 'weight' ? (parseFloat(value) || 0) : value
      }
    };
    setAdditionalExercises(updatedAdditionalExercises);
    saveToFirebase('additionalExercises', updatedAdditionalExercises);
  };

  const addHistoricalData = () => {
    const newEntry = {
      date: format(new Date(), 'yyyy-MM-dd'),
      ...trainingMax
    };
    const updatedHistoricalData = [...historicalData, newEntry].sort((a, b) => new Date(a.date) - new Date(b.date));
    setHistoricalData(updatedHistoricalData);
    saveToFirebase('historicalData', updatedHistoricalData);
  };

  const handleNewHistoricalEntryChange = (field, value) => {
    setNewHistoricalEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addNewHistoricalEntry = () => {
    if (newHistoricalEntry.date) {
      const newEntry = {
        ...newHistoricalEntry,
        Squat: parseFloat(newHistoricalEntry.Squat) || 0,
        Deadlift: parseFloat(newHistoricalEntry.Deadlift) || 0,
        'Overhead Press': parseFloat(newHistoricalEntry['Overhead Press']) || 0,
        'Bench Press': parseFloat(newHistoricalEntry['Bench Press']) || 0
      };
      const updatedHistoricalData = [...historicalData, newEntry].sort((a, b) => new Date(a.date) - new Date(b.date));
      setHistoricalData(updatedHistoricalData);
      saveToFirebase('historicalData', updatedHistoricalData);
      setNewHistoricalEntry({
        date: '',
        Squat: '',
        Deadlift: '',
        'Overhead Press': '',
        'Bench Press': ''
      });
    }
  };

  const handleCycleStartDateChange = (value) => {
    setCycleStartDate(value);
    saveToFirebase('cycleStartDate', value);
  };

  const calculateMainLiftWeights = (exercise) => {
    const tm = trainingMax[exercise];
    return [
      { week: 1, set1: tm * 0.65, set2: tm * 0.75, set3: tm * 0.85 },
      { week: 2, set1: tm * 0.70, set2: tm * 0.80, set3: tm * 0.90 },
      { week: 3, set1: tm * 0.75, set2: tm * 0.85, set3: tm * 0.95 }
    ];
  };

  const calculateSupplementalWeight = (exercise) => {
    return trainingMax[exercise] * 0.6;
  };

  const roundToNearestPlate = (weight) => {
    const smallestPlate = 1.25; // smallest plate in kg
    return Math.round(weight / smallestPlate) * smallestPlate;
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Training Max & 1RP Overview</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Cycle Start Date</h2>
        <input
          type="date"
          value={cycleStartDate}
          onChange={(e) => handleCycleStartDateChange(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Training Max</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {mainExercises.map(exercise => (
            <div key={exercise}>
              <label className="block text-sm font-medium text-gray-700">{exercise}</label>
              <input
                type="number"
                value={trainingMax[exercise]}
                onChange={(e) => handleTrainingMaxChange(exercise, e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              />
              <div className="mt-2 text-sm text-gray-600">
                Supplemental: {roundToNearestPlate(calculateSupplementalWeight(exercise)).toFixed(2)} kg
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Main Lift Calculations</h2>
        {mainExercises.map(exercise => (
          <div key={exercise} className="mb-4">
            <h3 className="text-lg font-medium">{exercise}</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Set 1</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Set 2</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Set 3</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculateMainLiftWeights(exercise).map((week, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{week.week}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{roundToNearestPlate(week.set1).toFixed(2)} kg</td>
                    <td className="px-6 py-4 whitespace-nowrap">{roundToNearestPlate(week.set2).toFixed(2)} kg</td>
                    <td className="px-6 py-4 whitespace-nowrap">{roundToNearestPlate(week.set3).toFixed(2)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Additional Exercises</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {additionalExercisesList.map(exercise => (
            <div key={exercise} className="border p-4 rounded">
              <h3 className="text-lg font-medium mb-2">{exercise}</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Sets x Reps"
                  value={additionalExercises[exercise]?.setsReps || ''}
                  onChange={(e) => handleAdditionalExerciseChange(exercise, 'setsReps', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm"
                />
                <input
                  type="number"
                  placeholder="Weight in kg (optional)"
                  value={additionalExercises[exercise]?.weight || ''}
                  onChange={(e) => handleAdditionalExerciseChange(exercise, 'weight', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Historical Data</h2>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Add Historical Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
            <input
              type="date"
              value={newHistoricalEntry.date}
              onChange={(e) => handleNewHistoricalEntryChange('date', e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm"
            />
            {mainExercises.map(exercise => (
              <input
                key={exercise}
                type="number"
                placeholder={exercise}
                value={newHistoricalEntry[exercise]}
                onChange={(e) => handleNewHistoricalEntryChange(exercise, e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm"
              />
            ))}
          </div>
          <button 
            onClick={addNewHistoricalEntry}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Historical Entry
          </button>
        </div>
        <button 
          onClick={addHistoricalData}
          className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Current TM to History
        </button>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              {mainExercises.map(exercise => (
                <th key={exercise} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{exercise}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {historicalData.map((entry, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{entry.date}</td>
                {mainExercises.map(exercise => (
                  <td key={exercise} className="px-6 py-4 whitespace-nowrap">{entry[exercise]} kg</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Progress Graph</h2>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="mb-4 block w-full border border-gray-300 rounded-md shadow-sm"
        >
          {mainExercises.map(exercise => (
            <option key={exercise} value={exercise}>{exercise}</option>
          ))}
        </select>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={selectedExercise} stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrainingMaxOverview;