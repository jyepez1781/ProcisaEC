
import React, { useState, useEffect } from 'react';
import { Equipo } from '../../types';
import { reportService } from '../../services/reportService';
import { formatCurrency, calculateAge } from '../../utils/formatters';
import { AlertOctagon, Download, TrendingUp, Search, MapPin, User, Box, Printer } from 'lucide-react';
import { generateExcelFromData } from '../../utils/excelHelper';
import { printCustomHTML } from '../../utils/documentGenerator';
import { Pagination } from '../common/Pagination';

const RENOVATION_TYPES = ['desktop', 'laptop', 'workstation', 'portatil', 'notebook'];

export const ReplacementTab: React.FC = () => {
  const [candidates, setCandidates] = useState<Equipo[]>([]);
  const [processedList, setProcessedList] = useState<Record<string, Equipo[]>>({});
  const [totalEquiposCount, setTotalEquiposCount] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; // Grouped items are larger, so less per page

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
    setCurrentPage(1);
  }, [filterText]);

  // Derived Filtered List
  const filteredCandidates = candidates.filter(e => {
        if (!filterText) return true;
        const lower = filterText.toLowerCase();
        return (
            e.codigo_activo.toLowerCase().includes(lower) || 
            e.modelo.toLowerCase().includes(lower) || 
            e.marca.toLowerCase().includes(lower) ||
            (e.responsable_nombre && e.responsable_nombre.toLowerCase().includes(lower))
        );
  });

  // Pagination Logic on the Filtered List
  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
  const paginatedCandidates = filteredCandidates.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    // Group only the PAGINATED items for display
    const grouped = paginatedCandidates.reduce((acc, item) => {
        const key = item.tipo_nombre || 'Otros';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, Equipo[]>);

    setProcessedList(grouped);
  }, [paginatedCandidates]);

  const prepareExportData = () => {
    return candidates.map(e => ({
      'Equipo': `${e.codigo_activo} - ${e.marca} ${e.modelo}`,
      'Antigüedad': `${calculateAge(e.fecha_compra)} años (${e.fecha_compra})`,
      'Ubicación Actual': e.ubicacion_nombre || 'Sin ubicación',
      'Usuario Asignado': e.responsable_nombre || 'No asignado',
      'Valor Libros': formatCurrency(e.valor_compra)
    }));
  };

  const handlePrintPDF = () => {
      // Re-derive the grouping from ALL filtered items for the PDF
      const fullGrouped = filteredCandidates.reduce((acc, item) => {
        const key = item.tipo_nombre || 'Otros';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as Record<string, Equipo[]>);

      // Calculate Impact
      const impactPercentage = totalEquiposCount > 0 ? ((planStats.actualCount / totalEquiposCount) * 100).toFixed(1) : '0';

      let html = `
      <style>
        @page { size: A4 portrait; margin: 1.5cm; }
        body { font-family: 'Segoe UI', sans-serif; color: #334155; font-size: 10px; }
        .header-title { font-size: 18px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; color: #1e293b; }
        .header-meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
        
        /* Summary Section */
        .summary-container { display: flex; gap: 15px; margin-bottom: 25px; }
        .summary-card { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #fff; }
        .summary-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 5px; }
        .summary-value { font-size: 18px; font-weight: 700; color: #0f172a; }
        .text-red { color: #dc2626; }
        
        /* Group Styles */
        .group-container { margin-bottom: 25px; page-break-inside: avoid; }
        .group-header { 
            background-color: #f1f5f9; 
            padding: 8px 12px; 
            font-weight: 700; 
            font-size: 13px; 
            color: #0f172a; 
            border-left: 4px solid #3b82f6; 
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .count-badge { background: #fff; padding: 2px 8px; border-radius: 10px; font-size: 10px; border: 1px solid #cbd5e1; }

        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0; }
        td { padding: 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        tr:last-child td { border-bottom: none; }
        
        .badge-age { background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9px; }
        .font-medium { font-weight: 700; color: #0f172a; }
        .text-dim { color: #64748b; }
      </style>
      
      <div class="header-title">Plan de Renovación Tecnológica</div>
      <div class="header-meta">Equipos candidatos por antigüedad (>4 años) | Generado: ${new Date().toLocaleDateString()}</div>
      
      <div class="summary-container">
         <div class="summary-card" style="border-left: 4px solid #ef4444;">
            <div class="summary-label">Candidatos Prioritarios</div>
            <div class="summary-value text-red">${planStats.actualCount} <span style="font-size:12px; color:#64748b; font-weight:normal;">/ ${planStats.targetCount} (Cupo)</span></div>
         </div>
         
         <div class="summary-card" style="border-left: 4px solid #f97316;">
            <div class="summary-label">Impacto en Flota</div>
            <div class="summary-value" style="color: #ea580c;">${impactPercentage}%</div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">De ${totalEquiposCount} equipos total</div>
         </div>

         <div class="summary-card" style="border-left: 4px solid #3b82f6;">
            <div class="summary-label">Costo Estimado Reposición</div>
            <div class="summary-value">${formatCurrency(planStats.totalCost)}</div>
         </div>
      </div>
      `;

      if (Object.keys(fullGrouped).length === 0) {
          html += `<div style="text-align:center; padding: 20px; color: #94a3b8; font-style: italic;">No se encontraron candidatos.</div>`;
      } else {
          Object.entries(fullGrouped).forEach(([type, items]: [string, Equipo[]]) => {
              html += `
              <div class="group-container">
                  <div class="group-header">${type} <span class="count-badge">${items.length}</span></div>
                  <table>
                      <thead>
                          <tr>
                              <th style="width: 25%">Equipo</th>
                              <th style="width: 15%">Antigüedad</th>
                              <th style="width: 20%">Ubicación</th>
                              <th style="width: 25%">Usuario</th>
                              <th style="width: 15%">Valor Libros</th>
                          </tr>
                      </thead>
                      <tbody>
              `;
              
              items.forEach(e => {
                  html += `
                  <tr>
                      <td>
                          <div class="font-medium">${e.codigo_activo}</div>
                          <div class="text-dim" style="font-size: 8px;">${e.marca} ${e.modelo}</div>
                      </td>
                      <td>
                          <span class="badge-age">${calculateAge(e.fecha_compra)} años</span>
                          <div class="text-dim" style="font-size: 8px; margin-top:2px;">Compra: ${e.fecha_compra}</div>
                      </td>
                      <td>${e.ubicacion_nombre || 'Sin ubicación'}</td>
                      <td>${e.responsable_nombre || '<span style="color:#94a3b8; font-style:italic;">No asignado</span>'}</td>
                      <td class="font-medium">${formatCurrency(e.valor_compra)}</td>
                  </tr>
                  `;
              });
              
              html += `</tbody></table></div>`;
          });
      }

      printCustomHTML(html, 'Plan Renovación');
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
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Download className="w-4 h-4" /> Excel
                </button>
                <button 
                    onClick={handlePrintPDF}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Printer className="w-4 h-4" /> PDF
                </button>
            </div>
       </div>

       {/* Grouped List */}
       <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm transition-colors flex flex-col">
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
             <div className="flex-1">
                 {Object.entries(processedList).map(([type, items]: [string, Equipo[]]) => (
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
                 ))}
             </div>
          )}
          
          {Object.keys(processedList).length > 0 && (
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredCandidates.length}
                itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
       </div>
    </div>
  );
};
