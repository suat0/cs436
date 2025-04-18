import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
  checkAuthStatus: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    console.log('Checking auth status...');
    try {
      const response = await fetch('/auth/status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Auth status response:', response.status);
      const data = await response.json();
      console.log('Auth status data:', data);

      if (response.ok && data.isAuthenticated) {
        console.log('Setting authenticated state with user:', data.user);
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        console.log('Setting unauthenticated state');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication status when the app loads
  useEffect(() => {
    console.log('AuthProvider mounted');
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    console.log('Login attempt with:', { email });
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Update auth state
      setIsAuthenticated(true);
      setUser(data.user);

      // Verify the auth state after login
      await checkAuthStatus();

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      setUser(null);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    console.log('Logout attempt');
    try {
      const response = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      console.log('Logout response:', response.status);

      if (response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        console.log('Logout successful, auth state cleared');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    checkAuthStatus
  };

  console.log('Current auth state:', { isAuthenticated, user, loading });

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;