import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState('user-123'); // Mock user ID for development
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (userData) => {
    setUserId(userData.userId || 'user-123');
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUserId(null);
    setIsAuthenticated(false);
  };

  const value = {
    userId,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
