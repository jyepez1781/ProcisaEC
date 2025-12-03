
import React from 'react';
import { Equipo } from '../../types';
import { CheckCircle, User, CheckCircle as EmptyIcon, Calendar, AlertTriangle } from 'lucide-react';

interface MaintenanceTableProps {
  equipos: Equipo[];
  loading: boolean;
  onFinalize: (equipo: Equipo) => void;
}

export const MaintenanceTable: React.FC<MaintenanceTableProps> = ({ equipos, loading, onFinalize }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      {loading ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400">Cargando equipos en mantenimiento...</div>
      ) : (
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-amber-50 dark:bg-amber-900/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 dark:text-amber-200 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 dark:text-amber-200 uppercase">Equipo</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 dark:text-amber-200 uppercase">Responsable (Previo)</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 dark:text-amber-200 uppercase">Origen / Problema</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-amber-800 dark:text-amber-200 uppercase">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {equipos.map(e => (
              <tr key={e.id} className="hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">{e.codigo_activo}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900 dark:text-white">{e.marca} {e.modelo}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{e.tipo_nombre}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                   {e.responsable_nombre ? (
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <User className="w-3 h-3" /> {e.responsable_nombre}
                      </div>
                   ) : <span className="text-slate-400 italic">Sin asignar</span>}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate">
                  {e.observaciones && e.observaciones.toLowerCase().includes('programado') ? (
                     <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded w-fit">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Mantenimiento Programado</span>
                     </div>
                  ) : (
                    <div className="flex items-start gap-1.5 text-red-700 dark:text-red-400 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5" />
                        <span>{e.observaciones || 'Falla no especificada'}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button 
                    onClick={() => onFinalize(e)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 text-slate-600 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Finalizar
                  </button>
                </td>
              </tr>
            ))}
            {equipos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center">
                      <EmptyIcon className="w-12 h-12 mb-2 text-green-100 dark:text-green-900/30" />
                      <p>No hay equipos pendientes de mantenimiento.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
