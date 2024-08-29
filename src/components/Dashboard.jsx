import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const menuItems = [
    { name: 'Weekly Workout', path: '/log-workout' },
    { name: 'Weight Tracker', path: '/weight-tracker' },
    { name: 'TM & 1RP Overview', path: '/training-max' },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome to your workout tracker dashboard!</p>
      
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h2>
      <ul className="space-y-2">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link 
              to={item.path} 
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;