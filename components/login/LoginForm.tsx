import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  email: string;
  setEmail: (value: string) => void;
  pass: string;
  setPass: (value: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  email, setEmail, pass, setPass, loading, error, onSubmit 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow bg-white dark:bg-slate-700 dark:text-white" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow bg-white dark:bg-slate-700 dark:text-white" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 shadow-sm hover:shadow-md dark:ring-1 dark:ring-blue-700"
        >
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </>
  );
};