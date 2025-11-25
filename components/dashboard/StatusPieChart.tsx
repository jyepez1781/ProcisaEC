
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as d3 from 'd3-scale';

interface StatusPieChartProps {
  data: { name: string; value: number }[];
}

export const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  const filteredData = data.filter(d => d.value > 0);

  const colorScale = d3.scaleOrdinal<string>()
    .domain(['Activos', 'Disponibles', 'Mantenimiento', 'Para Baja'])
    .range(['#10b981', '#3b82f6', '#f59e0b', '#f97316']);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Estado del Inventario (Activo)</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colorScale(entry.name)} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
