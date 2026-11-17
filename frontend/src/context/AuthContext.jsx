import { useState } from 'react';
import api from '../api/axios';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  const login = async (username, password) => {
    const { data } = await api.post('auth/login/', { username, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    const me = { username: data.username || username };
    localStorage.setItem('user', JSON.stringify(me));
    setUser(me);
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post('auth/register/', formData);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    const me = { username: data.user.username };
    localStorage.setItem('user', JSON.stringify(me));
    setUser(me);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('auth/logout/', { refresh: localStorage.getItem('refresh_token') });
    } catch {}
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
