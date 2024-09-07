import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SignOut from './SignOut';

const AuthStatus = () => {
  const { currentUser } = useAuth();

  return (
    <div className="flex items-center space-x-4">
      {currentUser ? (
        <>
          <span>Signed in as {currentUser.email}</span>
          <SignOut />
        </>
      ) : (
        <span>Not signed in</span>
      )}
    </div>
  );
};

export default AuthStatus;
