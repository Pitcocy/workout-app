import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WeeklyWorkoutOverview from './components/WeeklyWorkoutOverview';
import WeightTracker from './components/WeightTracker';
import TrainingMaxOverview from './components/TrainingMaxOverview';

function App() {
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