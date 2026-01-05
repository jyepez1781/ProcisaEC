
import React, { useState, useEffect, useRef } from 'react';
import { RegistroMantenimiento } from '../../types';
import { reportService } from '../../services/reportService';
import { formatCurrency } from '../../utils/formatters';
import { Wrench, Download, Printer, Eye, FileText, Search } from 'lucide-react';
import { generateExcelFromData } from '../../utils/excelHelper';
import { printCustomHTML } from '../../utils/documentGenerator';
import { Pagination } from '../common/Pagination';
import { FileViewerModal } from '../common/FileViewerModal';

export const MaintenanceReportTab: React.FC = () => {
  const [registros, setRegistros] = useState<RegistroMantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileToView, setFileToView] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [filterText, setFilterText] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    reportService.getMaintenance().then((data) => {
        setRegistros(data);
        setLoading(false);
    });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterText]);

  const filteredRegistros = registros.filter(reg => {
      if (!filterText) return true;
      const searchLower = filterText.toLowerCase();
      return (
          reg.equipo_codigo.toLowerCase().includes(searchLower) ||
          reg.equipo_modelo.toLowerCase().includes(searchLower) ||
          reg.proveedor.toLowerCase().includes(searchLower)
      );
  });

  const totalCost = filteredRegistros.reduce((acc, curr) => {
      const raw = (curr as any)?.costo;
      let cost = 0;
      if (raw === null || raw === undefined || raw === '') {
          cost = 0;
      } else if (typeof raw === 'number') {
          cost = raw;
      } else {
          // Try to parse numbers even if they include currency symbols or are strings
          const cleaned = String(raw).replace(/[^0-9.\-]/g, '');
          cost = parseFloat(cleaned || '0');
      }
      return acc + (isNaN(cost) ? 0 : cost);
  }, 0);

  const prepareExportData = () => {
    return filteredRegistros.map(reg => ({
      'Fecha': reg.fecha,
      'Equipo': `${reg.equipo_codigo} - ${reg.equipo_modelo}`,
      'Tipo': reg.tipo_mantenimiento,
      'Proveedor': reg.proveedor,
      'Costo': formatCurrency(reg.costo),
      'Trabajo Realizado': reg.descripcion,
      'Doc': reg.archivo_orden ? 'Adjunto' : 'Pendiente'
    }));
  };

  const handlePrintPDF = () => {
      let htmlContent = `
      <style>
        body { font-family: 'Segoe UI', sans-serif; color: #334155; font-size: 10px; }
        .header-title { font-size: 18px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; color: #1e293b; }
        .header-meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
        
        .summary-container { display: flex; gap: 15px; margin-bottom: 25px; }
        .summary-card { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #fff; }
        .summary-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 5px; }
        .summary-value { font-size: 18px; font-weight: 700; color: #0f172a; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0; }
        td { padding: 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        tr:last-child td { border-bottom: none; }
        
        .badge { display: inline-block; padding: 3px 8px; border-radius: 99px; font-size: 8px; font-weight: 700; border: 1px solid transparent; text-transform: uppercase; }
        .badge-correctivo { background-color: #fef2f2; color: #dc2626; border-color: #fecaca; }
        .badge-preventivo { background-color: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
        
        .font-medium { font-weight: 700; color: #0f172a; }
        .text-dim { color: #64748b; }
        .money { font-family: monospace; font-weight: 700; }
      </style>
      
      <div class="header-title">Historial de Mantenimientos</div>
      <div class="header-meta">Generado el: ${new Date().toLocaleDateString()}</div>

      <div class="summary-container">
         <div class="summary-card" style="border-left: 4px solid #3b82f6;">
            <div class="summary-label">Total Registros</div>
            <div class="summary-value">${filteredRegistros.length}</div>
         </div>
         <div class="summary-card" style="border-left: 4px solid #f59e0b;">
            <div class="summary-label">Costo Acumulado</div>
            <div class="summary-value">${formatCurrency(totalCost)}</div>
         </div>
      </div>
      `;

      if (filteredRegistros.length === 0) {
          htmlContent += `<div style="text-align:center; padding: 20px; color: #94a3b8; font-style: italic;">No hay registros para mostrar.</div>`;
      } else {
          htmlContent += `
          <table>
            <thead>
                <tr>
                    <th style="width: 10%">Fecha</th>
                    <th style="width: 20%">Equipo</th>
                    <th style="width: 10%">Tipo</th>
                    <th style="width: 15%">Proveedor</th>
                    <th style="width: 10%">Costo</th>
                    <th style="width: 35%">Trabajo Realizado</th>
                </tr>
            </thead>
            <tbody>
          `;

          filteredRegistros.forEach(r => {
              const badgeClass = r.tipo_mantenimiento === 'Correctivo' ? 'badge-correctivo' : 'badge-preventivo';
              htmlContent += `
                <tr>
                    <td>${r.fecha}</td>
                    <td>
                        <div class="font-medium">${r.equipo_codigo}</div>
                        <div class="text-dim" style="font-size: 8px;">${r.equipo_modelo}</div>
                    </td>
                    <td><span class="badge ${badgeClass}">${r.tipo_mantenimiento}</span></td>
                    <td>${r.proveedor}</td>
                    <td class="money">${formatCurrency(r.costo)}</td>
                    <td class="text-dim">${r.descripcion}</td>
                </tr>
              `;
          });

          htmlContent += `</tbody></table>`;
      }

      printCustomHTML(htmlContent, 'Historial de Mantenimientos');
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredRegistros.length / ITEMS_PER_PAGE);
  const paginatedRegistros = filteredRegistros.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCloseViewer = () => {
    if (objectUrlRef.current) {
        try { URL.revokeObjectURL(objectUrlRef.current); } catch(e) {}
        objectUrlRef.current = null;
    }
    setFileToView(null);
  };

  return (
    <div className="space-y-6">
        {/* Toolbar: Search and Exports */}
        <div className="p-4 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col md:flex-row gap-4 items-end justify-between transition-colors">
            <div className="w-full md:w-1/2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Search className="w-3 h-3" /> Buscar Equipo
                </label>
                <input 
                    type="text"
                    placeholder="Buscar por código, modelo o proveedor..."
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                />
            </div>
            
            <div className="flex gap-2">
                <button 
                    onClick={() => generateExcelFromData(prepareExportData(), 'Reporte_Mantenimiento')}
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

        {/* Summary Cards */}
        {/* ... rest of the component ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 flex justify-between items-center transition-colors">
                <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Registros</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{filteredRegistros.length}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-full text-blue-600 dark:text-blue-400">
                    <Wrench className="w-6 h-6" />
                </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30 flex justify-between items-center transition-colors">
                <div>
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Costo Acumulado</p>
                    <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">{formatCurrency(totalCost)}</p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-800/50 rounded-full text-amber-600 dark:text-amber-400">
                    <span className="text-xl font-bold">$</span>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm transition-colors flex flex-col">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Equipo</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Proveedor</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Costo</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Trabajo Realizado</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Doc</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {loading ? (
                            <tr><td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">Cargando...</td></tr>
                        ) : paginatedRegistros.map(reg => (
                            <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{reg.fecha}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{reg.equipo_codigo}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{reg.equipo_modelo}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${reg.tipo_mantenimiento === 'Correctivo' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'}`}>
                                        {reg.tipo_mantenimiento}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{reg.proveedor}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700 dark:text-slate-200">{formatCurrency(reg.costo)}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate" title={reg.descripcion}>{reg.descripcion}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {reg.archivo_orden ? (
                                        <button 
                                            onClick={() => {
                                                (async () => {
                                                        const raw = reg.archivo_orden as string;
                                                        const isFrontDev3000 = window.location.port === '3000';
                                                        const backendOrigin = isFrontDev3000
                                                            ? `${window.location.protocol}//${window.location.hostname}:8000`
                                                            : window.location.origin;
                                                        let url = raw;
                                                        if (!raw.startsWith('http')) {
                                                            if (raw.startsWith('/')) {
                                                                url = backendOrigin + raw;
                                                            } else if (raw.startsWith('storage/')) {
                                                                url = backendOrigin + '/' + raw;
                                                            } else {
                                                                url = backendOrigin + '/storage/' + raw;
                                                            }
                                                        }
                                                    try {
                                                        const res = await fetch(url, { cache: 'no-store' });
                                                        if (!res.ok) throw new Error('HTTP ' + res.status);
                                                        const blob = await res.blob();
                                                        const objUrl = URL.createObjectURL(blob);
                                                        if (objectUrlRef.current) {
                                                            try { URL.revokeObjectURL(objectUrlRef.current); } catch(e) {}
                                                        }
                                                        objectUrlRef.current = objUrl;
                                                        setFileToView(objUrl);
                                                    } catch (e) {
                                                        setFileToView(url);
                                                    }
                                                })();
                                            }}
                                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1 rounded transition-colors"
                                            title="Ver Orden de Servicio"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <span className="text-slate-300 dark:text-slate-600 cursor-not-allowed inline-block p-1" title="Sin archivo adjunto">
                                            <FileText className="w-4 h-4" />
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {!loading && filteredRegistros.length === 0 && (
                            <tr><td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">No hay registros que coincidan con la búsqueda.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredRegistros.length}
                itemsPerPage={ITEMS_PER_PAGE}
            />
        </div>

        <FileViewerModal 
            isOpen={!!fileToView} 
            onClose={handleCloseViewer} 
            fileUrl={fileToView}
            title="Orden de Servicio Firmada"
        />
    </div>
  );
};
