
import React from 'react';
import { Key } from 'lucide-react';
import { LicenseSummary } from '../../hooks/useDashboardData';

interface LicenseCardProps {
  stats: LicenseSummary[];
}

export const LicenseCard: React.FC<LicenseCardProps> = ({ stats }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full min-h-[140px] transition-colors">
       <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Licencias</p>
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
             <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
       </div>
       <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1.5 border-t border-slate-50 dark:border-slate-700 pt-2">
          {stats.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center mt-2">Sin licencias</p>
          ) : (
            stats.map((ls, idx) => (
              <div key={idx} className="border-b border-slate-50 dark:border-slate-700 last:border-0 pb-1">
                 <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate" title={ls.name}>{ls.name}</p>
                 <div className="flex justify-between text-[10px]">
                    <span className="text-green-600 dark:text-green-400 font-medium" title="Disponibles">Libre: {ls.available}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium" title="Asignadas">Asig: {ls.assigned}</span>
                 </div>
              </div>
            ))
          )}
       </div>
    </div>
  );
};
