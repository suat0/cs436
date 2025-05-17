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

// Helper function to set up auth headers for requests
const setupAuthHeaderForRequests = () => {
  // This will be used in the fetch API calls
  console.log('Setting up auth header for requests');
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    console.log('Checking auth status...');
    try {
      const token = localStorage.getItem('authToken');
      console.log('Auth token from localStorage:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('/auth/status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
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
        // Clean up token if authentication failed
        if (token) localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication status when the app loads
  useEffect(() => {
    console.log('AuthProvider mounted');
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Check for token in localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('Found token in localStorage on initialization');
    }
  }, []);

  const login = async (email, password) => {
    console.log('Login attempt with:', { email });
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Still keep this for cookies as fallback
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store the token in localStorage for auth header approach
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        console.log('Token stored in localStorage');
      } else {
        console.warn('No token received in login response');
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
      localStorage.removeItem('authToken'); // Clear token on error
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    console.log('Logout attempt');
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      console.log('Logout response:', response.status);

      // Clear auth state regardless of response
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('authToken');
      console.log('Auth state and token cleared');
      
      if (!response.ok) {
        console.warn('Server logout may have failed, but client-side logout completed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear state on error
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('authToken');
    }
  };

  // Function to make authenticated requests
  const authFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('authToken');
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Keep for cookie fallback
      });
      
      // If unauthorized, attempt to refresh auth state
      if (response.status === 401) {
        console.log('Received 401, checking auth status');
        await checkAuthStatus();
      }
      
      return response;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }, [checkAuthStatus]);

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    checkAuthStatus,
    authFetch  // Add this utility function for making authenticated requests
  };

  console.log('Current auth state:', { isAuthenticated, user, loading });

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;