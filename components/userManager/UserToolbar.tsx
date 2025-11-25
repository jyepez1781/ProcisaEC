
import React from 'react';
import { Search, UserPlus } from 'lucide-react';

interface UserToolbarProps {
  filterText: string;
  onFilterChange: (text: string) => void;
  onNewUser: () => void;
}

export const UserToolbar: React.FC<UserToolbarProps> = ({ filterText, onFilterChange, onNewUser }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h2 className="text-2xl font-bold text-slate-800">Administración de Usuarios</h2>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text"
            placeholder="Buscar usuario..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={filterText}
            onChange={(e) => onFilterChange(e.target.value)}
          />
        </div>
        <button 
          onClick={onNewUser} 
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>
    </div>
  );
};
