
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { EstadoEquipo } from '../../types';

interface EquipmentStackChartProps {
  breakdown: Record<string, Record<string, number>>;
}

export const EquipmentStackChart: React.FC<EquipmentStackChartProps> = ({ breakdown }) => {
  const data = Object.entries(breakdown).map(([type, counts]) => {
    return {
      name: type,
      ...(counts as Record<string, number>)
    };
  });

  const STATUS_COLORS = {
    [EstadoEquipo.ACTIVO]: '#10b981',
    [EstadoEquipo.DISPONIBLE]: '#3b82f6',
    [EstadoEquipo.EN_MANTENIMIENTO]: '#f59e0b',
    [EstadoEquipo.BAJA]: '#ef4444',
    [EstadoEquipo.PARA_BAJA]: '#f97316',
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-white mb-4">Distribución de Equipos por Tipo y Estado</h3>
        {data.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" strokeOpacity={0.2} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{fill: '#f8fafc', opacity: 0.2}}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey={EstadoEquipo.ACTIVO} stackId="a" fill={STATUS_COLORS[EstadoEquipo.ACTIVO]} name="Activo" />
                <Bar dataKey={EstadoEquipo.DISPONIBLE} stackId="a" fill={STATUS_COLORS[EstadoEquipo.DISPONIBLE]} name="Disponible" />
                <Bar dataKey={EstadoEquipo.EN_MANTENIMIENTO} stackId="a" fill={STATUS_COLORS[EstadoEquipo.EN_MANTENIMIENTO]} name="Mantenimiento" />
                <Bar dataKey={EstadoEquipo.PARA_BAJA} stackId="a" fill={STATUS_COLORS[EstadoEquipo.PARA_BAJA]} name="Para Baja" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-400 dark:text-slate-500">
            Sin datos para graficar
          </div>
        )}
    </div>
  );
};
