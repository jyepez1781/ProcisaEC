
import { useState } from 'react';
import { Usuario } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<Usuario | null>(() => {
    const savedUser = localStorage.getItem('app_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Error parsing user from storage", e);
      return null;
    }
  });

  const login = (u: Usuario) => {
    localStorage.setItem('app_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('app_user');
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return { user, login, logout };
};
