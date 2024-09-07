import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // If there's no current user, redirect to the sign-in page
    return <Navigate to="/signin" replace />;
  }

  // If there is a current user, render the child components
  return children;
};

export default PrivateRoute;
