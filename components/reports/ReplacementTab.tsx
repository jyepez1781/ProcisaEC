
import React, { useState, useEffect } from 'react';
import { Equipo } from '../../types';
import { reportService } from '../../services/reportService';
import { formatCurrency, calculateAge } from '../../utils/formatters';
import { AlertOctagon, Download, TrendingUp, Search, MapPin, User, Box, Printer } from 'lucide-react';
import { generateExcelFromData } from '../../utils/excelHelper';
import { printCustomHTML } from '../../utils/documentGenerator';

const RENOVATION_TYPES = ['desktop', 'laptop', 'workstation', 'portatil', 'notebook'];

export const ReplacementTab: React.FC = () => {
  const [candidates, setCandidates] = useState<Equipo[]>([]);
  const [processedList, setProcessedList] = useState<Record<string, Equipo[]>>({});
  const [totalEquiposCount, setTotalEquiposCount] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);

  // Estadísticas del Plan
  const [planStats, setPlanStats] = useState({
    targetCount: 0,
    actualCount: 0,
    totalCost: 0
  });

  const isRenovationType = (equipo: Equipo) => {
      const typeName = equipo.tipo_nombre?.toLowerCase() || '';
      return RENOVATION_TYPES.some(t => typeName.includes(t));
  };

  useEffect(() => {
    const loadData = async () => {
        try {
            const [rawCandidates, allEquipos] = await Promise.all([
                reportService.getReplacementCandidates(),
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
      'Equipo': `${e.codigo_activo} - ${e.marca} ${e.modelo}`, // Combinado como en UI
      'Antigüedad': `${calculateAge(e.fecha_compra)} años (${e.fecha_compra})`,
      'Ubicación Actual': e.ubicacion_nombre || 'Sin ubicación',
      'Usuario Asignado': e.responsable_nombre || 'No asignado',
      'Valor Libros': formatCurrency(e.valor_compra)
    }));
  };

  const handlePrintPDF = () => {
    let htmlContent = `
      <style>
         /* Metrics */
         .metrics-row { display: flex; gap: 15px; margin-bottom: 30px; }
         .metric-card { flex: 1; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
         .bg-red { background-color: #fef2f2; border-color: #fee2e2; }
         .bg-orange { background-color: #fff7ed; border-color: #ffedd5; }
         .bg-blue { background-color: #eff6ff; border-color: #dbeafe; }
         .metric-title { font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; display: flex; align-items: center; gap: 5px; }
         .text-red { color: #991b1b; } .text-orange { color: #9a3412; } .text-blue { color: #1e40af; }
         .metric-value { font-size: 20px; font-weight: 700; margin-bottom: 2px; }
         .metric-sub { font-size: 10px; opacity: 0.8; }

         /* Groups */
         .group-header { background-color: #f1f5f9; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #334155; font-size: 12px; margin-top: 20px; display: flex; align-items: center; gap: 6px; }
         .count-badge { background: #fff; padding: 1px 6px; border-radius: 10px; font-size: 10px; border: 1px solid #cbd5e1; }
         
         /* Table */
         table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
         th { text-align: left; padding: 8px; font-size: 10px; background-color: #f8fafc; color: #64748b; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; }
         td { padding: 8px; font-size: 11px; border-bottom: 1px solid #f1f5f9; color: #1e293b; vertical-align: middle; }
         .age-badge { background-color: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px; }
         .mono { font-family: monospace; color: #64748b; }
      </style>
    `;

    // Metrics HTML
    htmlContent += `
      <div class="metrics-row">
         <div class="metric-card bg-red">
            <div class="metric-title text-red">Candidatos Prioritarios</div>
            <div class="metric-value text-red">${planStats.actualCount}</div>
            <div class="metric-sub text-red">Equipos > 4 años</div>
         </div>
         <div class="metric-card bg-orange">
            <div class="metric-title text-orange">Impacto Flota</div>
            <div class="metric-value text-orange">${totalEquiposCount > 0 ? ((planStats.actualCount / totalEquiposCount) * 100).toFixed(1) : 0}%</div>
            <div class="metric-sub text-orange">Del total (${totalEquiposCount})</div>
         </div>
         <div class="metric-card bg-blue">
            <div class="metric-title text-blue">Costo Estimado</div>
            <div class="metric-value text-blue">${formatCurrency(planStats.totalCost)}</div>
            <div class="metric-sub text-blue">Reposición</div>
         </div>
      </div>
    `;

    // Groups HTML
    if (Object.keys(processedList).length === 0) {
        htmlContent += `<div style="text-align: center; padding: 40px; color: #94a3b8;">No hay candidatos.</div>`;
    } else {
        Object.entries(processedList).forEach(([type, items]) => {
            const eqItems = items as Equipo[];
            htmlContent += `
              <div class="group-header">
                 <span>${type}</span>
                 <span class="count-badge">${eqItems.length}</span>
              </div>
              <table>
                 <thead>
                    <tr>
                       <th style="width: 25%">Equipo</th>
                       <th style="width: 15%">Antigüedad</th>
                       <th style="width: 25%">Ubicación Actual</th>
                       <th style="width: 20%">Usuario Asignado</th>
                       <th style="width: 15%">Valor Libros</th>
                    </tr>
                 </thead>
                 <tbody>
                    ${eqItems.map(e => `
                       <tr>
                          <td>
                             <div style="font-weight:600;">${e.codigo_activo}</div>
                             <div style="color:#64748b; font-size:10px;">${e.marca} ${e.modelo}</div>
                          </td>
                          <td>
                             <span class="age-badge">${calculateAge(e.fecha_compra)} años</span>
                             <div style="font-size:9px; color:#64748b; margin-top:2px;">${e.fecha_compra}</div>
                          </td>
                          <td>${e.ubicacion_nombre || '-'}</td>
                          <td>${e.responsable_nombre || 'No asignado'}</td>
                          <td style="font-weight:600;">${formatCurrency(e.valor_compra)}</td>
                       </tr>
                    `).join('')}
                 </tbody>
              </table>
            `;
        });
    }

    printCustomHTML(htmlContent, 'Plan de Renovación de Equipos');
  };

  return (
    <div className="space-y-6">
       {/* Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800 transition-colors">
             <div className="flex items-center gap-2 mb-1">
                <AlertOctagon className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-semibold text-red-800 dark:text-red-300">Candidatos Prioritarios</span>
             </div>
             <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-bold text-red-700 dark:text-red-400">{planStats.actualCount}</p>
                 <span className="text-xs text-red-600 dark:text-red-400">/ {planStats.targetCount} (Cupo 20%)</span>
             </div>
             <p className="text-xs text-red-500 dark:text-red-400 mt-1">Equipos (PC/Laptop) con &ge; 4 años</p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-800 transition-colors">
             <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-semibold text-orange-800 dark:text-orange-300">Impacto en Flota Cómputo</span>
             </div>
             <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                 {totalEquiposCount > 0 ? ((planStats.actualCount / totalEquiposCount) * 100).toFixed(1) : 0}%
             </p>
             <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Del total de computadoras ({totalEquiposCount})</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 transition-colors">
             <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Costo Reposición (Est.)</span>
             </div>
             <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{formatCurrency(planStats.totalCost)}</p>
             <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Suma del valor de compra histórico</p>
          </div>
       </div>

       {/* Toolbar */}
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text"
                    placeholder="Buscar equipo, modelo o usuario..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => generateExcelFromData(prepareExportData(), 'Plan_Renovacion_Prioritario')}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 transition-colors"
                >
                    <Download className="w-4 h-4" /> Excel
                </button>
                <button 
                    onClick={handlePrintPDF}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 transition-colors"
                >
                    <Printer className="w-4 h-4" /> PDF
                </button>
            </div>
       </div>

       {/* Grouped List */}
       <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm transition-colors">
          {loading ? (
             <div className="p-12 text-center text-slate-500 dark:text-slate-400">Calculando plan de renovación...</div>
          ) : Object.keys(processedList).length === 0 ? (
             <div className="p-12 text-center flex flex-col items-center">
                 <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                     <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                 </div>
                 <p className="text-slate-800 dark:text-white font-medium">No se encontraron candidatos para renovación.</p>
                 <p className="text-slate-500 dark:text-slate-400 text-sm">La flota de cómputo actual cumple con los estándares o no coincide con los filtros.</p>
             </div>
          ) : (
             Object.entries(processedList).map(([type, items]: [string, Equipo[]]) => (
                <div key={type}>
                    <div className="bg-slate-100 dark:bg-slate-700/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200 text-sm">
                        <Box className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        {type} <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs font-normal text-slate-500 dark:text-slate-300 border dark:border-slate-600 ml-1">{items.length}</span>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 mb-4 last:mb-0">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Equipo</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Antigüedad</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ubicación Actual</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Usuario Asignado</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Valor Libros</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                            {items.map(e => (
                                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="font-bold text-slate-800 dark:text-white text-sm">{e.codigo_activo}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{e.marca} {e.modelo}</div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">Compra: {e.fecha_compra}</span>
                                            <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs font-bold w-fit mt-0.5">
                                                {calculateAge(e.fecha_compra)} años
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-slate-400" />
                                            {e.ubicacion_nombre || 'Sin ubicación'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3 text-slate-400" />
                                            {e.responsable_nombre ? (
                                                <span className="text-blue-600 dark:text-blue-400 font-medium">{e.responsable_nombre}</span>
                                            ) : (
                                                <span className="text-slate-400 italic">No asignado</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-200">
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
