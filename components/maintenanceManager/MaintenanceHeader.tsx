
import React from 'react';
import { Wrench } from 'lucide-react';

interface MaintenanceHeaderProps {
  count: number;
}

export const MaintenanceHeader: React.FC<MaintenanceHeaderProps> = ({ count }) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Wrench className="w-6 h-6 text-amber-600" /> 
        Gestión de Mantenimiento
      </h2>
      <div className="text-sm text-slate-500">
        Equipos en taller: <span className="font-bold text-slate-800">{count}</span>
      </div>
    </div>
  );
};
