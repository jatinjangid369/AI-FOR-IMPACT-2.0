import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage and fetch latest profile
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.error('Session restore failed:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      throw err.response?.data?.error || 'Login failed. Please check credentials.';
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      // Store pending email for OTP verification
      localStorage.setItem('pendingEmail', email);
      return res.data;
    } catch (err) {
      throw err.response?.data?.error || 'Registration failed.';
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const email = localStorage.getItem('pendingEmail');
      const res = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      localStorage.removeItem('pendingEmail');
      return res.data;
    } catch (err) {
      throw err.response?.data?.error || 'OTP verification failed.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfileName = async (name) => {
    try {
      const res = await api.put('/auth/me', { name });
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      throw err.response?.data?.error || 'Failed to update profile name.';
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      return res.data;
    } catch (err) {
      throw err.response?.data?.error || 'Failed to change password.';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, logout, updateProfileName, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
