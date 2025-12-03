import React from 'react';
import { Laptop } from 'lucide-react';

export const LoginHeader: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-blue-900 dark:bg-blue-700 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-md">
        <Laptop className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-blue-900 dark:text-white">
        <span className="text-orange-600 dark:text-orange-500">I</span>
        <span>nven</span>
        <span className="text-orange-600 dark:text-orange-500">T</span>
        <span>ory</span>
      </h1>
      <p className="text-slate-500 dark:text-slate-400">Acceso al Sistema de Gestión</p>
    </div>
  );
};