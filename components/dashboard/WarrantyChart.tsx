
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Garantías Próximas a Vencer (Días)</h3>
      {barData.length > 0 ? (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="dias" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-72 flex items-center justify-center text-slate-400">
          No hay garantías próximas a vencer
        </div>
      )}
    </div>
  );
};
