import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('auth:user');
    return stored ? JSON.parse(stored) : null;
  });
  const isAuthenticated = Boolean(user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth:user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth:user');
    }
  }, [user]);

  async function requestAccessCode(phoneNumber) {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/request-code', { phoneNumber });
      toast.success('Access code sent via SMS');
      return true;
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to request access code';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function verifyAccessCode(phoneNumber, accessCode) {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify-code', { phoneNumber, accessCode });
      const role = data?.role || 'owner';
      const nextUser = { phoneNumber, role };
      setUser(nextUser);
      toast.success('Logged in');
      if (role === 'owner') {
        navigate('/owner', { replace: true });
      } else {
        navigate('/employee', { replace: true });
      }
      return true;
    } catch (e) {
      const msg = e?.response?.data?.message || 'Invalid access code';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    if (location.pathname.startsWith('/owner')) navigate('/login');
    if (location.pathname.startsWith('/employee')) navigate('/login');
  }

  const value = useMemo(
    () => ({ user, isAuthenticated, loading, error, requestAccessCode, verifyAccessCode, logout }),
    [user, isAuthenticated, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


