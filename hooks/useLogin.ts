
import { useState } from 'react';
import { api } from '../services/mockApi';
import { Usuario } from '../types';

export const useLogin = (onLogin: (user: Usuario) => void) => {
  const [email, setEmail] = useState('admin@sys.com');
  const [password, setPassword] = useState('123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await api.login(email, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleLogin
  };
};
