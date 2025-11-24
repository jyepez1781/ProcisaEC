
import React, { useState, useEffect } from 'react';
import { Equipo } from '../../types';
import { reportService } from '../../services/reportService';
import { formatCurrency, calculateAge } from '../../utils/formatters';
import { AlertOctagon, Download, TrendingUp, Search, MapPin, User, Box, Printer } from 'lucide-react';
import { downloadCSV } from '../../utils/csvExporter';
import { openPrintPreview } from '../../utils/documentGenerator';

const RENOVATION_TYPES = ['desktop', 'laptop', 'workstation', 'portatil', 'notebook'];

export const ReplacementTab: React.FC = () => {
  const [candidates, setCandidates] = useState<Equipo[]>([]);
  const [processedList, setProcessedList] = useState<Record<string, Equipo[]>>({});
  const [totalEquiposCount, setTotalEquiposCount] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);

  // Estadísticas del Plan
  const [planStats, setPlanStats] = useState({
    targetCount: 0, // El 20% ideal
    actualCount: 0, // Cuantos entraron en el reporte
    totalCost: 0
  });

  // Helper para validar tipos permitidos en el plan
  const isRenovationType = (equipo: Equipo) => {
      const typeName = equipo.tipo_nombre?.toLowerCase() || '';
      return RENOVATION_TYPES.some(t => typeName.includes(t));
  };

  useEffect(() => {
    const loadData = async () => {
        try {
            const [rawCandidates, allEquipos] = await Promise.all([
                reportService.getReplacementCandidates(), // Devuelve equipos >= 4 años
                reportService.getEquipos()
            ]);
            
            const relevantFleet = allEquipos.filter(isRenovationType);
            const totalCount = relevantFleet.length;
            setTotalEquiposCount(totalCount);
            
            const maxAllowed = Math.ceil(totalCount * 0.20);
            
            const eligibleCandidates = rawCandidates.filter(isRenovationType);

            const sortedCandidates = eligibleCandidates.sort((a, b) => 
                new Date(a.fecha_compra).getTime() - new Date(b.fecha_compra).getTime()
            );

            const finalCandidates = sortedCandidates.slice(0, maxAllowed);
            
            setCandidates(finalCandidates);
            setPlanStats({
                targetCount: maxAllowed,
                actualCount: finalCandidates.length,
                totalCost: finalCandidates.reduce((acc, curr) => acc + curr.valor_compra, 0)
            });

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, []);

  useEffect(() => {
    let result = candidates;

    if (filterText) {
        const lower = filterText.toLowerCase();
        result = result.filter(e => 
            e.codigo_activo.toLowerCase().includes(lower) || 
            e.modelo.toLowerCase().includes(lower) ||
            e.marca.toLowerCase().includes(lower) ||
            (e.responsable_nombre && e.responsable_nombre.toLowerCase().includes(lower))
        );
    }

    const grouped = result.reduce((acc, item) => {
        const key = item.tipo_nombre || 'Otros';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, Equipo[]>);

    setProcessedList(grouped);
  }, [candidates, filterText]);

  const prepareExportData = () => {
    return candidates.map(e => ({
      Codigo: e.codigo_activo,
      Equipo: `${e.marca} ${e.modelo}`,
      Tipo: e.tipo_nombre,
      Fecha_Compra: e.fecha_compra,
      Antiguedad: `${calculateAge(e.fecha_compra)} años`,
      Ubicacion: e.ubicacion_nombre || 'Sin ubicación',
      Usuario: e.responsable_nombre || 'No asignado',
      Valor_Libros: formatCurrency(e.valor_compra)
    }));
  };

  return (
    <div className="space-y-6">
       {/* Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
             <div className="flex items-center gap-2 mb-1">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-800">Candidatos Prioritarios</span>
             </div>
             <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-bold text-red-700">{planStats.actualCount}</p>
                 <span className="text-xs text-red-600">/ {planStats.targetCount} (Cupo 20%)</span>
             </div>
             <p className="text-xs text-red-500 mt-1">Equipos (PC/Laptop) con &ge; 4 años</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
             <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-800">Impacto en Flota Cómputo</span>
             </div>
             <p className="text-3xl font-bold text-orange-700">
                 {totalEquiposCount > 0 ? ((planStats.actualCount / totalEquiposCount) * 100).toFixed(1) : 0}%
             </p>
             <p className="text-xs text-orange-600 mt-1">Del total de computadoras ({totalEquiposCount})</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
             <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-blue-800">Costo Reposición (Est.)</span>
             </div>
             <p className="text-2xl font-bold text-blue-700">{formatCurrency(planStats.totalCost)}</p>
             <p className="text-xs text-blue-600 mt-1">Suma del valor de compra histórico</p>
          </div>
       </div>

       {/* Toolbar */}
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text"
                    placeholder="Buscar equipo, modelo o usuario..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => downloadCSV(prepareExportData(), 'Plan_Renovacion_Prioritario')}
                    className="flex items-center gap-2 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 bg-white transition-colors"
                >
                    <Download className="w-4 h-4" /> Excel
                </button>
                <button 
                    onClick={() => openPrintPreview(prepareExportData(), 'Plan de Renovacion Prioritario')}
                    className="flex items-center gap-2 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 bg-white transition-colors"
                >
                    <Printer className="w-4 h-4" /> PDF
                </button>
            </div>
       </div>

       {/* Grouped List */}
       <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
          {loading ? (
             <div className="p-12 text-center text-slate-500">Calculando plan de renovación...</div>
          ) : Object.keys(processedList).length === 0 ? (
             <div className="p-12 text-center flex flex-col items-center">
                 <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                     <TrendingUp className="w-6 h-6 text-green-600" />
                 </div>
                 <p className="text-slate-800 font-medium">No se encontraron candidatos para renovación.</p>
                 <p className="text-slate-500 text-sm">La flota de cómputo actual cumple con los estándares o no coincide con los filtros.</p>
             </div>
          ) : (
             Object.entries(processedList).map(([type, items]: [string, Equipo[]]) => (
                <div key={type}>
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2 font-semibold text-slate-700 text-sm">
                        <Box className="w-4 h-4 text-blue-600" />
                        {type} <span className="bg-white px-2 py-0.5 rounded-full text-xs font-normal text-slate-500 border ml-1">{items.length}</span>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200 mb-4 last:mb-0">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Equipo</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Antigüedad</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Ubicación Actual</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Usuario Asignado</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Valor Libros</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {items.map(e => (
                                <tr key={e.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="font-bold text-slate-800 text-sm">{e.codigo_activo}</div>
                                        <div className="text-xs text-slate-500">{e.marca} {e.modelo}</div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-500">Compra: {e.fecha_compra}</span>
                                            <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold w-fit mt-0.5">
                                                {calculateAge(e.fecha_compra)} años
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-slate-400" />
                                            {e.ubicacion_nombre || 'Sin ubicación'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3 text-slate-400" />
                                            {e.responsable_nombre ? (
                                                <span className="text-blue-600 font-medium">{e.responsable_nombre}</span>
                                            ) : (
                                                <span className="text-slate-400 italic">No asignado</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-700">
                                        {formatCurrency(e.valor_compra)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             ))
          )}
       </div>
    </div>
  );
};
