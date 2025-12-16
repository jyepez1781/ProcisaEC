
import React, { useState, useEffect } from 'react';
import { HistorialMovimiento, Equipo } from '../../types';
import { reportService } from '../../services/reportService';
import { Eye, FileText, Search, Layers, Box, User, Trash2, Download, Printer } from 'lucide-react';
import { Pagination } from '../common/Pagination';
import { FileViewerModal } from '../common/FileViewerModal';
import { generateExcelFromData } from '../../utils/excelHelper';
import { printCustomHTML } from '../../utils/documentGenerator';

interface DisposalItem extends HistorialMovimiento {
    tipo_equipo_nombre?: string;
    equipo_modelo?: string;
}

export const DisposalReportTab: React.FC = () => {
  const [bajas, setBajas] = useState<DisposalItem[]>([]);
  const [filteredBajas, setFilteredBajas] = useState<DisposalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [grouping, setGrouping] = useState<'NONE' | 'TYPE'>('NONE');
  const [fileToView, setFileToView] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [movements, equipos] = await Promise.all([
            reportService.getMovements(),
            reportService.getEquipos()
        ]);

        const disposalMovements = movements
            .filter(m => m.tipo_accion === 'BAJA')
            .map(m => {
                const eq = equipos.find(e => e.id === m.equipo_id); 
                return {
                    ...m,
                    tipo_equipo_nombre: eq?.tipo_nombre || 'Desconocido',
                    equipo_modelo: eq ? `${eq.marca} ${eq.modelo}` : ''
                };
            });

        setBajas(disposalMovements);
        setFilteredBajas(disposalMovements);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let result = bajas;
    if (filterText) {
        const lower = filterText.toLowerCase();
        result = result.filter(b => 
            b.equipo_codigo.toLowerCase().includes(lower) ||
            (b.equipo_modelo && b.equipo_modelo.toLowerCase().includes(lower)) ||
            b.detalle.toLowerCase().includes(lower)
        );
    }
    setFilteredBajas(result);
    setCurrentPage(1); // Reset page on filter
  }, [filterText, bajas]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredBajas.length / ITEMS_PER_PAGE);
  const paginatedBajas = filteredBajas.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const groupedData: Record<string, DisposalItem[]> = grouping === 'NONE' 
    ? { 'Todos los Equipos': paginatedBajas } 
    : paginatedBajas.reduce((acc, item) => {
        const key = item.tipo_equipo_nombre || 'Otros';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, DisposalItem[]>);

  const prepareExportData = () => {
      return filteredBajas.map(b => ({
          'Fecha Baja': b.fecha,
          'Código': b.equipo_codigo,
          'Modelo': b.equipo_modelo,
          'Motivo': b.detalle,
          'Responsable (Hist)': b.usuario_responsable
      }));
  };

  const handlePrintPDF = () => {
      const fullGrouped = grouping === 'NONE' 
        ? { 'Listado Completo': filteredBajas } 
        : filteredBajas.reduce((acc, item) => {
            const key = item.tipo_equipo_nombre || 'Otros';
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {} as Record<string, DisposalItem[]>);

      let html = `
      <style>
        body { font-family: 'Segoe UI', sans-serif; color: #334155; font-size: 10px; }
        .header-title { font-size: 18px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; color: #1e293b; }
        .header-meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
        
        .group-container { margin-bottom: 25px; page-break-inside: avoid; }
        .group-header { 
            background-color: #fef2f2; 
            padding: 8px 12px; 
            font-weight: 700; 
            font-size: 13px; 
            color: #991b1b; 
            border-left: 4px solid #ef4444; 
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .count-badge { background: #fff; padding: 2px 8px; border-radius: 10px; font-size: 10px; border: 1px solid #fecaca; color: #dc2626; }

        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0; }
        td { padding: 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        tr:last-child td { border-bottom: none; }
        
        .font-medium { font-weight: 700; color: #0f172a; }
        .text-dim { color: #64748b; }
        .reason-text { font-style: italic; color: #475569; }
      </style>
      
      <div class="header-title">Reporte de Bajas de Equipos</div>
      <div class="header-meta">Total Registros: ${filteredBajas.length} | Fecha: ${new Date().toLocaleDateString()}</div>
      `;

      if(filteredBajas.length === 0) {
          html += `<div style="text-align:center; padding: 20px; color: #94a3b8; font-style: italic;">No se encontraron registros de baja.</div>`;
      } else {
          Object.entries(fullGrouped).forEach(([groupName, items]: [string, DisposalItem[]]) => {
              html += `
              <div class="group-container">
                  ${grouping !== 'NONE' ? `<div class="group-header">${groupName} <span class="count-badge">${items.length}</span></div>` : ''}
                  <table>
                      <thead>
                          <tr>
                              <th style="width: 15%">Fecha Baja</th>
                              <th style="width: 15%">Código</th>
                              <th style="width: 25%">Equipo / Modelo</th>
                              <th style="width: 30%">Motivo / Detalle</th>
                              <th style="width: 15%">Responsable (Hist)</th>
                          </tr>
                      </thead>
                      <tbody>
              `;
              
              items.forEach(b => {
                  html += `
                  <tr>
                      <td>${b.fecha}</td>
                      <td class="font-medium">${b.equipo_codigo}</td>
                      <td>${b.equipo_modelo}</td>
                      <td class="reason-text">${b.detalle}</td>
                      <td class="text-dim">${b.usuario_responsable || '-'}</td>
                  </tr>
                  `;
              });
              
              html += `</tbody></table></div>`;
          });
      }

      printCustomHTML(html, 'Reporte de Bajas');
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
         <div className="w-full md:w-1/3">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Search className="w-3 h-3" /> Buscar Equipo
            </label>
            <input 
                type="text"
                placeholder="Código, modelo o motivo..."
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
            />
         </div>

         <div className="flex gap-2">
             <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-800 h-[38px]">
                <button onClick={() => setGrouping('NONE')} className={`px-4 h-full text-xs font-medium flex items-center gap-2 ${grouping === 'NONE' ? 'bg-red-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    <Layers className="w-3 h-3" /> Listado
                </button>
                <div className="w-px h-full bg-slate-200 dark:bg-slate-600"></div>
                <button onClick={() => setGrouping('TYPE')} className={`px-4 h-full text-xs font-medium flex items-center gap-2 ${grouping === 'TYPE' ? 'bg-red-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    <Box className="w-3 h-3" /> Por Tipo
                </button>
             </div>
             
             <button 
                onClick={() => generateExcelFromData(prepareExportData(), 'Reporte_Bajas')}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm h-[38px]"
            >
                <Download className="w-4 h-4" /> Excel
            </button>
            <button 
                onClick={handlePrintPDF}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm h-[38px]"
            >
                <Printer className="w-4 h-4" /> PDF
            </button>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm transition-colors flex flex-col">
         {/* ... (rest of the component) ... */}
         {loading ? (
             <div className="p-12 text-center text-slate-500 dark:text-slate-400">Cargando reporte de bajas...</div>
         ) : filteredBajas.length === 0 ? (
             <div className="p-12 text-center flex flex-col items-center text-slate-400 dark:text-slate-500">
                 <Trash2 className="w-12 h-12 mb-2 text-slate-200 dark:text-slate-600" />
                 <p>No se encontraron registros de baja.</p>
             </div>
         ) : (
             <div className="overflow-x-auto">
                 {Object.entries(groupedData).map(([groupName, items]) => (
                     <div key={groupName}>
                         {grouping !== 'NONE' && (
                             <div className="bg-red-50 dark:bg-red-900/20 px-6 py-2 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2 font-semibold text-red-800 dark:text-red-300 text-sm">
                                 <Box className="w-4 h-4" /> {groupName} 
                                 <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs border border-red-200 dark:border-red-800 ml-1 text-red-600 dark:text-red-400">{items.length}</span>
                             </div>
                         )}
                         <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                             <thead className="bg-slate-50 dark:bg-slate-900/50">
                                 <tr>
                                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Fecha Baja</th>
                                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Código</th>
                                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Equipo / Modelo</th>
                                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Detalle / Motivo</th>
                                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Usuario Resp.</th>
                                     <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Evidencia</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                 {items.map(item => (
                                     <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{item.fecha}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-white">{item.equipo_codigo}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{item.equipo_modelo}</td>
                                         <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 max-w-md truncate" title={item.detalle}>{item.detalle}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.usuario_responsable}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-center">
                                             {item.archivo ? (
                                                 <button 
                                                     onClick={() => setFileToView(item.archivo!)}
                                                     className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                                                     title="Ver Evidencia Adjunta"
                                                 >
                                                     <Eye className="w-4 h-4" />
                                                 </button>
                                             ) : (
                                                 <span className="text-slate-300 dark:text-slate-600 inline-block p-1.5" title="Sin archivo">
                                                     <FileText className="w-4 h-4" />
                                                 </span>
                                             )}
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                 ))}
             </div>
         )}
         
         {!loading && filteredBajas.length > 0 && (
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredBajas.length}
                itemsPerPage={ITEMS_PER_PAGE}
            />
         )}
      </div>

      <FileViewerModal 
        isOpen={!!fileToView} 
        onClose={() => setFileToView(null)} 
        fileUrl={fileToView}
        title="Evidencia de Baja"
      />
    </div>
  );
};
