import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sevaconnect_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(localStorage.getItem('sevaconnect_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify authentication state on load
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('sevaconnect_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await userService.getProfile();
        if (response.data && response.data.success) {
          setUser(response.data.user);
          localStorage.setItem('sevaconnect_user', JSON.stringify(response.data.user));
          setToken(storedToken);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('[AuthContext] Session invalid or server unavailable, clearing stored session.');
        logout();
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    if (response.data && response.data.success) {
      const { token: receivedToken, user: receivedUser } = response.data;
      localStorage.setItem('sevaconnect_token', receivedToken);
      localStorage.setItem('sevaconnect_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true, role: receivedUser.role, user: receivedUser };
    }
    return { success: false, message: response.data?.message || 'Login failed.' };
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    return response.data;
  };

  const updateProfile = async (name, phone) => {
    const response = await userService.updateProfile({ name, phone });
    if (response.data && response.data.success) {
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('sevaconnect_user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    }
    return { success: false, message: response.data?.message || 'Failed to update profile.' };
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Stateless fallback
    } finally {
      localStorage.removeItem('sevaconnect_token');
      localStorage.removeItem('sevaconnect_user');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    updateProfile,
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
