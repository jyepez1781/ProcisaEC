
import React from 'react';
import { Search, Filter, Layers, Box, User, Laptop } from 'lucide-react';
import { TipoEquipo, Usuario, EstadoEquipo } from '../../types';

interface EquipmentFiltersProps {
  filters: any;
  setFilters: (f: any) => void;
  grouping: string;
  setGrouping: (g: any) => void;
  tipos: TipoEquipo[];
  usuarios: Usuario[];
}

export const EquipmentFilters: React.FC<EquipmentFiltersProps> = ({ 
  filters, setFilters, grouping, setGrouping, tipos, usuarios 
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4 transition-colors">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text"
            placeholder="Buscar código, serie..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-slate-900 dark:text-white"
            value={filters.text}
            onChange={(e) => setFilters({...filters, text: e.target.value})}
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select 
            className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white dark:bg-slate-900 dark:text-white text-sm"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="ALL">Estado: Todos</option>
            {Object.values(EstadoEquipo).map(est => (
              <option key={est} value={est}>{est}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Laptop className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select 
            className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white dark:bg-slate-900 dark:text-white text-sm"
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="ALL">Tipo: Todos</option>
            {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>

        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select 
            className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white dark:bg-slate-900 dark:text-white text-sm"
            value={filters.user}
            onChange={(e) => setFilters({...filters, user: e.target.value})}
          >
            <option value="ALL">Usuario: Todos</option>
            {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre_completo}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-700">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-3 uppercase tracking-wide">Agrupar por:</span>
        <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
          <button onClick={() => setGrouping('NONE')} className={`px-3 py-1.5 text-xs font-medium flex items-center gap-2 ${grouping === 'NONE' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <Layers className="w-3 h-3" /> Plano
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-600"></div>
          <button onClick={() => setGrouping('TYPE')} className={`px-3 py-1.5 text-xs font-medium flex items-center gap-2 ${grouping === 'TYPE' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <Box className="w-3 h-3" /> Tipo
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-600"></div>
          <button onClick={() => setGrouping('USER')} className={`px-3 py-1.5 text-xs font-medium flex items-center gap-2 ${grouping === 'USER' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <User className="w-3 h-3" /> Usuario
          </button>
        </div>
      </div>
    </div>
  );
};
