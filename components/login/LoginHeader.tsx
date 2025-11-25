
import React from 'react';
import { Laptop } from 'lucide-react';

export const LoginHeader: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-md">
        <Laptop className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        <span className="text-orange-500">I</span>
        <span className="text-blue-600">nven</span>
        <span className="text-orange-500">T</span>
        <span className="text-blue-600">ory</span>
      </h1>
      <p className="text-slate-500">Acceso al Sistema de Gestión</p>
    </div>
  );
};
