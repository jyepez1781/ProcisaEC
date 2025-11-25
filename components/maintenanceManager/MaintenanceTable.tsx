
import React from 'react';
import { Equipo } from '../../types';
import { CheckCircle, User, CheckCircle as EmptyIcon } from 'lucide-react';

interface MaintenanceTableProps {
  equipos: Equipo[];
  loading: boolean;
  onFinalize: (equipo: Equipo) => void;
}

export const MaintenanceTable: React.FC<MaintenanceTableProps> = ({ equipos, loading, onFinalize }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {loading ? (
        <div className="p-12 text-center text-slate-500">Cargando equipos en mantenimiento...</div>
      ) : (
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-amber-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase">Equipo</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase">Responsable (Previo)</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase">Problema Reportado</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-amber-800 uppercase">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {equipos.map(e => (
              <tr key={e.id} className="hover:bg-amber-50/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{e.codigo_activo}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">{e.marca} {e.modelo}</div>
                  <div className="text-xs text-slate-500">{e.tipo_nombre}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                   {e.responsable_nombre ? (
                      <div className="flex items-center gap-1 text-blue-600">
                          <User className="w-3 h-3" /> {e.responsable_nombre}
                      </div>
                   ) : <span className="text-slate-400 italic">Sin asignar</span>}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{e.observaciones}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button 
                    onClick={() => onFinalize(e)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-slate-600 text-sm font-medium rounded-lg transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Finalizar
                  </button>
                </td>
              </tr>
            ))}
            {equipos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center">
                      <EmptyIcon className="w-12 h-12 mb-2 text-green-100" />
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
