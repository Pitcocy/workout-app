import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WeeklyWorkoutOverview from './components/WeeklyWorkoutOverview';
import WeightTracker from './components/WeightTracker';
import TrainingMaxOverview from './components/TrainingMaxOverview';
import { loadData, saveData } from './firebase';

function App() {
  useEffect(() => {
    const testFirebase = async () => {
      try {
        await saveData('test', { message: 'Hello Firebase' });
        const data = await loadData('test', null);
        console.log('Firebase test data:', data);
      } catch (error) {
        console.error('Firebase test error:', error);
      }
    };
    testFirebase();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log-workout" element={<WeeklyWorkoutOverview />} />
          <Route path="/weight-tracker" element={<WeightTracker />} />
          <Route path="/training-max" element={<TrainingMaxOverview />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;