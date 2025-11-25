
import React from 'react';
import { Key } from 'lucide-react';
import { LicenseSummary } from '../../hooks/useDashboardData';

interface LicenseCardProps {
  stats: LicenseSummary[];
}

export const LicenseCard: React.FC<LicenseCardProps> = ({ stats }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[140px]">
       <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-500">Licencias</p>
          <div className="p-2 rounded-lg bg-purple-50">
             <Key className="w-5 h-5 text-purple-600" />
          </div>
       </div>
       <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1.5">
          {stats.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center mt-2">Sin licencias</p>
          ) : (
            stats.map((ls, idx) => (
              <div key={idx} className="border-b border-slate-50 last:border-0 pb-1">
                 <p className="text-[11px] font-bold text-slate-700 truncate" title={ls.name}>{ls.name}</p>
                 <div className="flex justify-between text-[10px]">
                    <span className="text-green-600 font-medium" title="Disponibles">Libre: {ls.available}</span>
                    <span className="text-blue-600 font-medium" title="Asignadas">Asig: {ls.assigned}</span>
                 </div>
              </div>
            ))
          )}
       </div>
    </div>
  );
};
