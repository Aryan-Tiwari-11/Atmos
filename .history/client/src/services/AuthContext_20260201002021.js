import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Verify token and fetch user
      authAPI
        .getCurrentUser()
          .then((res) => {
            // Normalize user object so `id` is always present
            const u = res.data;
            if (u && u._id && !u.id) u.id = u._id;
            setUser(u);
        })
        .catch((err) => {
          console.error('Error fetching user:', err);
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    // Fetch full user data with teamId
    try {
      const userRes = await authAPI.getCurrentUser();
      const u = userRes.data;
      if (u && u._id && !u.id) u.id = u._id;
      setUser(u);
    } catch (err) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (name, email, password, role, teamId) => {
    const res = await authAPI.register(name, email, password, role, teamId);
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    // Fetch full user data with teamId
    try {
      const userRes = await authAPI.getCurrentUser();
      const u = userRes.data;
      if (u && u._1 && !u.id) u.id = u._id;
      setUser(u);
    } catch (err) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
