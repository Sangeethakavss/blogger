'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check and refresh user profile on mount
  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== 'undefined') {
        const savedToken = localStorage.getItem('blogify_token');
        const savedUser = localStorage.getItem('blogify_user');

        if (savedToken && savedUser) {
          try {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);

            const res = await api.get('/auth/me');
            if (res.data.success) {
              setUser(res.data.user);
              localStorage.setItem('blogify_user', JSON.stringify(res.data.user));
            }
          } catch {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user: userData, token: userToken } = res.data;
        setUser(userData);
        setToken(userToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('blogify_token', userToken);
          localStorage.setItem('blogify_user', JSON.stringify(userData));
        }
        return { success: true, message: res.data.message };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid email or password',
      };
    }
  };

  const register = async (name, email, password, avatar) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, avatar });
      if (res.data.success) {
        const { user: userData, token: userToken } = res.data;
        setUser(userData);
        setToken(userToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('blogify_token', userToken);
          localStorage.setItem('blogify_user', JSON.stringify(userData));
        }
        return { success: true, message: res.data.message };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('blogify_token');
      localStorage.removeItem('blogify_user');
    }
  };

  const updateProfile = async (formData) => {
    try {
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        const updatedUser = res.data.user;
        setUser(updatedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('blogify_user', JSON.stringify(updatedUser));
        }
        return { success: true, message: res.data.message, user: updatedUser };
      }
      return { success: false, message: 'Failed to update profile' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed',
      };
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('blogify_user', JSON.stringify(res.data.user));
        }
        return res.data;
      }
    } catch {
      // Ignore refresh error
    }
    return null;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

