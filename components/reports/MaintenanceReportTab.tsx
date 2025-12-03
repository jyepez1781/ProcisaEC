
import React, { useState, useEffect } from 'react';
import { RegistroMantenimiento } from '../../types';
import { reportService } from '../../services/reportService';
import { formatCurrency } from '../../utils/formatters';
import { Wrench, Download, Printer, Eye, FileText, Search } from 'lucide-react';
import { generateExcelFromData } from '../../utils/excelHelper';
import { printCustomHTML } from '../../utils/documentGenerator';
import { Modal } from '../common/Modal';

export const MaintenanceReportTab: React.FC = () => {
  const [registros, setRegistros] = useState<RegistroMantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileToView, setFileToView] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    reportService.getMaintenance().then((data) => {
        setRegistros(data);
        setLoading(false);
    });
  }, []);

  const filteredRegistros = registros.filter(reg => {
      if (!filterText) return true;
      const searchLower = filterText.toLowerCase();
      return (
          reg.equipo_codigo.toLowerCase().includes(searchLower) ||
          reg.equipo_modelo.toLowerCase().includes(searchLower) ||
          reg.proveedor.toLowerCase().includes(searchLower)
      );
  });

  const totalCost = filteredRegistros.reduce((acc, curr) => acc + curr.costo, 0);

  const prepareExportData = () => {
    return filteredRegistros.map(reg => ({
      'Fecha': reg.fecha,
      'Equipo': `${reg.equipo_codigo} - ${reg.equipo_modelo}`,
      'Tipo': reg.tipo_mantenimiento, // Alineado con UI
      'Proveedor': reg.proveedor,
      'Costo': formatCurrency(reg.costo),
      'Trabajo Realizado': reg.descripcion, // Alineado con UI
      'Doc': reg.archivo_orden ? 'Adjunto' : 'Pendiente' // Alineado con UI
    }));
  };

  const handlePrintPDF = () => {
    let htmlContent = `
      <style>
        .summary-row { display: flex; gap: 15px; margin-bottom: 25px; }
        .summary-card { flex: 1; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .bg-blue { background-color: #eff6ff; border-color: #dbeafe; }
        .bg-amber { background-color: #fffbeb; border-color: #fde68a; }
        .card-title { font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.05em; }
        .text-blue { color: #1e40af; }
        .text-amber { color: #b45309; }
        .card-value { font-size: 24px; font-weight: 700; margin: 0; line-height: 1; }
        
        table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
        th { background-color: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 10px; text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
        td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; color: #334155; vertical-align: top; }
        tr:last-child td { border-bottom: none; }
        
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; border: 1px solid transparent; }
        .badge-correctivo { background-color: #fee2e2; color: #991b1b; border-color: #fecaca; }
        .badge-preventivo { background-color: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
        
        .font-bold { font-weight: 700; }
      </style>
      
      <div class="summary-row">
          <div class="summary-card bg-blue">
              <div class="card-title text-blue">Total Mantenimientos</div>
              <div class="card-value text-blue">${filteredRegistros.length}</div>
          </div>
          <div class="summary-card bg-amber">
              <div class="card-title text-amber">Costo Total Acumulado</div>
              <div class="card-value text-amber">${formatCurrency(totalCost)}</div>
          </div>
      </div>
    `;

    if (filteredRegistros.length === 0) {
       htmlContent += `<div style="text-align:center; padding: 30px; color: #94a3b8; font-style: italic;">No hay registros de mantenimiento con los filtros actuales.</div>`;
    } else {
       htmlContent += `
        <table>
            <thead>
                <tr>
                    <th style="width: 12%">Fecha</th>
                    <th style="width: 20%">Equipo</th>
                    <th style="width: 12%">Tipo</th>
                    <th style="width: 18%">Proveedor</th>
                    <th style="width: 13%">Costo</th>
                    <th style="width: 25%">Trabajo Realizado</th>
                </tr>
            </thead>
            <tbody>
       `;

       filteredRegistros.forEach(reg => {
           const badgeClass = reg.tipo_mantenimiento === 'Correctivo' ? 'badge-correctivo' : 'badge-preventivo';
           htmlContent += `
            <tr>
                <td>${reg.fecha}</td>
                <td>
                    <div class="font-bold">${reg.equipo_codigo}</div>
                    <div style="font-size: 10px; color: #64748b;">${reg.equipo_modelo}</div>
                </td>
                <td><span class="badge ${badgeClass}">${reg.tipo_mantenimiento}</span></td>
                <td>${reg.proveedor}</td>
                <td class="font-bold">${formatCurrency(reg.costo)}</td>
                <td>${reg.descripcion}</td>
            </tr>
           `;
       });

       htmlContent += `</tbody></table>`;
    }

    printCustomHTML(htmlContent, 'Historial de Mantenimientos');
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
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-colors"
                >
                    <Download className="w-4 h-4" /> Excel
                </button>
                <button 
                    onClick={handlePrintPDF}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-colors"
                >
                    <Printer className="w-4 h-4" /> PDF
                </button>
            </div>
        </div>

        {/* Summary Cards */}
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

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm transition-colors">
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
                    ) : filteredRegistros.map(reg => (
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
                                        onClick={() => setFileToView(reg.archivo_orden!)}
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

        {/* Modal para ver archivo */}
        <Modal isOpen={!!fileToView} onClose={() => setFileToView(null)} title="Orden de Servicio Firmada">
             <div className="p-8 text-center bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                 <div className="mb-4 text-slate-400">Simulación de Visor PDF</div>
                 <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800">
                     <FileText className="w-12 h-12 text-red-500 mb-2" />
                     <p className="font-mono text-sm text-slate-700 dark:text-slate-200 font-medium break-all">{fileToView}</p>
                     <p className="text-xs text-slate-400 mt-2">En producción, aquí se mostraría el PDF embebido.</p>
                 </div>
                 <div className="mt-6 flex justify-center">
                    <button onClick={() => setFileToView(null)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                        Cerrar Visor
                    </button>
                 </div>
             </div>
        </Modal>
    </div>
  );
};
