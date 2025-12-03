
import React from 'react';
import { TipoLicencia, Licencia } from '../../types';
import { Plus } from 'lucide-react';

interface LicenseCatalogTabProps {
  tipos: TipoLicencia[];
  licencias: Licencia[];
  onOpenCreateType: () => void;
  onAddStock: (tipoId: number) => void;
}

export const LicenseCatalogTab: React.FC<LicenseCatalogTabProps> = ({ tipos, licencias, onOpenCreateType, onAddStock }) => {
  
  const getCounts = (tipoId: number) => {
    const total = licencias.filter(l => l.tipo_id === tipoId).length;
    const available = licencias.filter(l => l.tipo_id === tipoId && !l.usuario_id).length;
    return { total, available };
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tipos.map(tipo => {
          const counts = getCounts(tipo.id);
          return (
            <div key={tipo.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-all bg-white dark:bg-slate-800">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 dark:text-white">{tipo.nombre}</h3>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full">{tipo.proveedor}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 min-h-[40px]">{tipo.descripcion}</p>

              <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-700 pt-3">
                <div className="text-sm">
                  <div className="text-slate-500 dark:text-slate-400">Disponibles: <span className="font-bold text-green-600 dark:text-green-400">{counts.available}</span></div>
                  <div className="text-slate-500 dark:text-slate-400">Total: <span className="font-semibold text-slate-700 dark:text-slate-300">{counts.total}</span></div>
                </div>
                <button
                  onClick={() => onAddStock(tipo.id)}
                  className="text-sm bg-slate-800 dark:bg-slate-700 text-white px-3 py-1.5 rounded hover:bg-slate-900 dark:hover:bg-slate-600 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Stock
                </button>
              </div>
            </div>
          );
        })}
        <div 
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-purple-300 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors min-h-[150px] bg-slate-50/50 dark:bg-slate-800/50"
          onClick={onOpenCreateType}
        >
          <Plus className="w-8 h-8 mb-2" />
          <span>Nuevo Tipo de Licencia</span>
        </div>
      </div>
    </div>
  );
};
