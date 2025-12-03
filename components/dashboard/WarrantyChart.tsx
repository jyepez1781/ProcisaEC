
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ReporteGarantia } from '../../types';

interface WarrantyChartProps {
  data: ReporteGarantia[];
}

export const WarrantyChart: React.FC<WarrantyChartProps> = ({ data }) => {
  const barData = data.slice(0, 5).map(w => ({
    name: w.equipo.codigo_activo,
    dias: w.dias_restantes,
  }));

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
      <h3 className="text-lg font-semibold text-slate-700 dark:text-white mb-4">Garantías Próximas a Vencer (Días)</h3>
      {barData.length > 0 ? (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#475569" strokeOpacity={0.2} />
              <XAxis type="number" tick={{ fill: '#94a3b8' }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip 
                cursor={{fill: 'transparent'}} 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
              />
              <Bar dataKey="dias" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-72 flex items-center justify-center text-slate-400 dark:text-slate-500">
          No hay garantías próximas a vencer
        </div>
      )}
    </div>
  );
};
