import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WeeklyWorkoutOverview from './components/WeeklyWorkoutOverview';
import WeightTracker from './components/WeightTracker';
import TrainingMaxOverview from './components/TrainingMaxOverview';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/log-workout" element={<PrivateRoute><WeeklyWorkoutOverview /></PrivateRoute>} />
            <Route path="/weight-tracker" element={<PrivateRoute><WeightTracker /></PrivateRoute>} />
            <Route path="/training-max" element={<PrivateRoute><TrainingMaxOverview /></PrivateRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;