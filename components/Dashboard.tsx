
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import * as d3 from 'd3-scale';
import { api } from '../services/mockApi';
import { ReporteGarantia, Licencia, EstadoEquipo } from '../types';
import { AlertTriangle, Box, CheckCircle, Wrench, Key, Laptop, Archive } from 'lucide-react';
import StatCard from './StatCard';

interface LicenseSummary {
  name: string;
  total: number;
  available: number;
  assigned: number;
}

interface TypeGroupStats {
  total: Record<string, number>;
  assigned: Record<string, number>;
  maintenance: Record<string, number>;
  warranty: Record<string, number>;
  available: Record<string, number>;
  pre_baja: Record<string, number>;
  grandTotals: {
    total: number;
    assigned: number;
    maintenance: number;
    warranty: number;
    available: number;
    pre_baja: number;
  }
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [warrantyData, setWarrantyData] = useState<ReporteGarantia[]>([]);
  const [licenseStats, setLicenseStats] = useState<LicenseSummary[]>([]);
  const [equipmentBreakdown, setEquipmentBreakdown] = useState<Record<string, Record<string, number>>>({});
  
  // Nuevo estado para los contadores agrupados por tipo
  const [groupedStats, setGroupedStats] = useState<TypeGroupStats>({
    total: {},
    assigned: {},
    maintenance: {},
    warranty: {},
    available: {},
    pre_baja: {},
    grandTotals: { total: 0, assigned: 0, maintenance: 0, warranty: 0, available: 0, pre_baja: 0 }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, warranties, licencias, equiposData] = await Promise.all([
          api.getStats(),
          api.getWarrantyReport(),
          api.getLicencias(),
          api.getEquipos()
        ]);
        setStats(statsData);
        setWarrantyData(warranties);
        
        // --- 1. Calcular Agrupaciones por Tipo para las Tarjetas (Excluyendo BAJA) ---
        const gStats: TypeGroupStats = {
            total: {},
            assigned: {},
            maintenance: {},
            warranty: {},
            available: {},
            pre_baja: {},
            grandTotals: { total: 0, assigned: 0, maintenance: 0, warranty: 0, available: 0, pre_baja: 0 }
        };

        // Procesar Equipos
        equiposData.forEach(e => {
            // FILTRO GLOBAL: Ignorar equipos dados de baja
            if (e.estado === EstadoEquipo.BAJA) return;

            const tipo = e.tipo_nombre || 'Otros';
            
            // Total General (Sin bajas)
            gStats.total[tipo] = (gStats.total[tipo] || 0) + 1;
            gStats.grandTotals.total++;

            // Clasificación por estado
            if (e.estado === EstadoEquipo.ACTIVO) {
                gStats.assigned[tipo] = (gStats.assigned[tipo] || 0) + 1;
                gStats.grandTotals.assigned++;
            } else if (e.estado === EstadoEquipo.EN_MANTENIMIENTO) {
                gStats.maintenance[tipo] = (gStats.maintenance[tipo] || 0) + 1;
                gStats.grandTotals.maintenance++;
            } else if (e.estado === EstadoEquipo.DISPONIBLE) {
                gStats.available[tipo] = (gStats.available[tipo] || 0) + 1;
                gStats.grandTotals.available++;
            } else if (e.estado === EstadoEquipo.PARA_BAJA) {
                gStats.pre_baja[tipo] = (gStats.pre_baja[tipo] || 0) + 1;
                gStats.grandTotals.pre_baja++;
            }
        });

        // Procesar Garantías
        warranties.forEach(w => {
            if (w.equipo.estado === EstadoEquipo.BAJA) return; // Ignorar garantías de equipos dados de baja
            const tipo = w.equipo.tipo_nombre || 'Otros';
            gStats.warranty[tipo] = (gStats.warranty[tipo] || 0) + 1;
            gStats.grandTotals.warranty++;
        });

        setGroupedStats(gStats);

        // --- 2. Calcular Licencias Agrupadas ---
        const summaryMap: Record<string, LicenseSummary> = {};
        licencias.forEach(l => {
          if (!summaryMap[l.tipo_nombre]) {
            summaryMap[l.tipo_nombre] = { name: l.tipo_nombre, total: 0, available: 0, assigned: 0 };
          }
          summaryMap[l.tipo_nombre].total++;
          if (l.usuario_id) {
            summaryMap[l.tipo_nombre].assigned++;
          } else {
            summaryMap[l.tipo_nombre].available++;
          }
        });
        setLicenseStats(Object.values(summaryMap));

        // --- 3. Calcular Breakdown para Gráficos y Lista Detallada (Excluyendo BAJA) ---
        const eqMap: Record<string, Record<string, number>> = {};
        equiposData.forEach(e => {
            if (e.estado === EstadoEquipo.BAJA) return; // Ignorar bajas

            const t = e.tipo_nombre || 'Otros';
            const s = e.estado;
            if(!eqMap[t]) eqMap[t] = {};
            if(!eqMap[t][s]) eqMap[t][s] = 0;
            eqMap[t][s]++;
        });
        setEquipmentBreakdown(eqMap);

      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper para renderizar la tarjeta agrupada
  const renderGroupedCard = (title: string, icon: React.ReactNode, dataMap: Record<string, number>, total: number, bgColor: string, textColor: string) => {
     const hasData = Object.keys(dataMap).length > 0;
     return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[140px]">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="text-2xl font-bold text-slate-800 leading-none mt-1">{total}</p>
                </div>
                <div className={`p-2 rounded-lg ${bgColor}`}>
                    {icon}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 border-t border-slate-50 pt-2">
                {hasData ? (
                    <div className="space-y-1">
                        {Object.entries(dataMap).map(([type, count]) => (
                            <div key={type} className="flex justify-between items-center text-xs">
                                <span className="text-slate-600 truncate mr-2">{type}</span>
                                <span className={`font-semibold ${textColor}`}>{count}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 italic mt-1">Sin registros</p>
                )}
            </div>
        </div>
     );
  };

  if (loading || !stats) {
    return <div className="p-8 text-center text-gray-500">Cargando Dashboard...</div>;
  }

  // Data for Pie Chart (Using filtered grandTotals)
  const pieData = [
    { name: 'Activos', value: groupedStats.grandTotals.assigned },
    { name: 'Disponibles', value: groupedStats.grandTotals.available },
    { name: 'Mantenimiento', value: groupedStats.grandTotals.maintenance },
    { name: 'Para Baja', value: groupedStats.grandTotals.pre_baja },
  ].filter(d => d.value > 0);

  const colorScale = d3.scaleOrdinal<string>()
    .domain(['Activos', 'Disponibles', 'Mantenimiento', 'Para Baja'])
    .range(['#10b981', '#3b82f6', '#f59e0b', '#f97316']);

  const barData = warrantyData.slice(0, 5).map(w => ({
    name: w.equipo.codigo_activo,
    dias: w.dias_restantes,
  }));

  const typeStatusChartData = Object.entries(equipmentBreakdown).map(([type, counts]) => {
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard General</h2>

      {/* Stats Cards - Updated to show Grouped Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        
        {/* 1. Total Equipos */}
        {renderGroupedCard(
            "Total Equipos",
            <Box className="w-5 h-5 text-blue-600" />,
            groupedStats.total,
            groupedStats.grandTotals.total,
            "bg-blue-50",
            "text-blue-700"
        )}

        {/* 2. Asignados */}
        {renderGroupedCard(
            "Asignados",
            <CheckCircle className="w-5 h-5 text-green-600" />,
            groupedStats.assigned,
            groupedStats.grandTotals.assigned,
            "bg-green-50",
            "text-green-700"
        )}

        {/* 3. Disponibles (NUEVA TARJETA) */}
        {renderGroupedCard(
            "Disponibles",
            <Laptop className="w-5 h-5 text-indigo-600" />,
            groupedStats.available,
            groupedStats.grandTotals.available,
            "bg-indigo-50",
            "text-indigo-700"
        )}

        {/* 4. En Mantenimiento */}
        {renderGroupedCard(
            "Mantenimiento",
            <Wrench className="w-5 h-5 text-amber-600" />,
            groupedStats.maintenance,
            groupedStats.grandTotals.maintenance,
            "bg-amber-50",
            "text-amber-700"
        )}

        {/* 5. Garantías */}
        {renderGroupedCard(
            "Garantías (Riesgo)",
            <AlertTriangle className="w-5 h-5 text-red-600" />,
            groupedStats.warranty,
            groupedStats.grandTotals.warranty,
            "bg-red-50",
            "text-red-700"
        )}
         
         {/* 6. Licencias */}
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[140px]">
            <div className="flex items-center justify-between mb-2">
               <p className="text-sm font-medium text-slate-500">Licencias</p>
               <div className="p-2 rounded-lg bg-purple-50">
                  <Key className="w-5 h-5 text-purple-600" />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1.5">
               {licenseStats.length === 0 ? (
                 <p className="text-xs text-slate-400 italic text-center mt-2">Sin licencias</p>
               ) : (
                 licenseStats.map((ls, idx) => (
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
      </div>

      {/* Charts Section Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Estado del Inventario (Activo)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorScale(entry.name)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Warranty Expiration Bar */}
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
      </div>

      {/* Charts Section Row 2 - Stacked Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Distribución de Equipos por Tipo y Estado</h3>
          {typeStatusChartData.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={typeStatusChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Legend />
                  <Bar dataKey={EstadoEquipo.ACTIVO} stackId="a" fill={STATUS_COLORS[EstadoEquipo.ACTIVO]} name="Activo" />
                  <Bar dataKey={EstadoEquipo.DISPONIBLE} stackId="a" fill={STATUS_COLORS[EstadoEquipo.DISPONIBLE]} name="Disponible" />
                  <Bar dataKey={EstadoEquipo.EN_MANTENIMIENTO} stackId="a" fill={STATUS_COLORS[EstadoEquipo.EN_MANTENIMIENTO]} name="Mantenimiento" />
                  <Bar dataKey={EstadoEquipo.PARA_BAJA} stackId="a" fill={STATUS_COLORS[EstadoEquipo.PARA_BAJA]} name="Para Baja" />
                  {/* Removed Baja Bar */}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-400">
              Sin datos para graficar
            </div>
          )}
      </div>
    </div>
  );
};

export default Dashboard;
