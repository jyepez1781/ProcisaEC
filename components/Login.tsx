import React, { useState } from 'react';
import { Laptop } from 'lucide-react';
import { api } from '../services/mockApi';
import { Usuario } from '../types';

interface LoginProps {
  onLogin: (user: Usuario) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4">
            <Laptop className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">SysInventario</h1>
          <p className="text-slate-500">Acceso al Sistema de Gestión</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>Credenciales Demo:</p>
          <p>admin@sys.com / 123</p>
          <p>juan@sys.com / 123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;