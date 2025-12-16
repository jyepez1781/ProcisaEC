
import React, { useState, useEffect } from 'react';
import { ReporteGarantia, EstadoEquipo } from '../../types';
import { reportService } from '../../services/reportService';
import { AlertTriangle, ShieldCheck, Download, Printer } from 'lucide-react';
import { generateExcelFromData } from '../../utils/excelHelper';
import { printCustomHTML } from '../../utils/documentGenerator';
import { Pagination } from '../common/Pagination';

export const WarrantiesTab: React.FC = () => {
  const [garantias, setGarantias] = useState<ReporteGarantia[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12; // Grid view, multiple of 2/3 for responsiveness

  useEffect(() => {
    reportService.getWarranties().then((data) => {
        // Filtramos para asegurar que no se muestren equipos dados de Baja
        const activeWarranties = data.filter(w => w.equipo.estado !== EstadoEquipo.BAJA);
        setGarantias(activeWarranties.sort((a,b) => a.dias_restantes - b.dias_restantes));
        setLoading(false);
    });
  }, []);

  const prepareData = () => {
      return garantias.map(g => ({
          'Código': g.equipo.codigo_activo,
          'Equipo': `${g.equipo.marca} ${g.equipo.modelo}`,
          'Responsable': g.equipo.responsable_nombre || 'N/A',
          'Vencimiento': g.fecha_vencimiento,
          'Días Restantes': `${g.dias_restantes} días`
      }));
  }

  const handlePrintPDF = () => {
      let html = `
      <style>
        body { font-family: 'Segoe UI', sans-serif; color: #334155; }
        .header-title { font-size: 18px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; color: #1e293b; }
        .header-meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
        
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .card { 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            overflow: hidden; 
            position: relative; 
            page-break-inside: avoid; 
            background: #fff; 
            box-shadow: 0 1px 2px rgba(0,0,0,0.05); 
        }
        .color-bar { position: absolute; top: 0; bottom: 0; left: 0; width: 5px; }
        .bar-red { background-color: #ef4444; }
        .bar-amber { background-color: #f59e0b; }
        
        .content { padding: 12px 12px 12px 18px; }
        
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
        .code { font-weight: 700; color: #0f172a; font-size: 13px; }
        .model { font-size: 10px; color: #64748b; margin-top: 2px; }
        
        .row { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px; }
        .label { color: #64748b; }
        .value { font-weight: 600; color: #334155; text-align: right; }
        
        .days-red { color: #dc2626; font-weight: 800; font-size: 11px; }
        .days-amber { color: #d97706; font-weight: 800; font-size: 11px; }
      </style>
      
      <div class="header-title">Reporte de Garantías Próximas</div>
      <div class="header-meta">Total de Equipos en Riesgo: ${garantias.length} | Fecha: ${new Date().toLocaleDateString()}</div>
      
      <div class="grid">`;
      
      if(garantias.length === 0) html += `<div style="grid-column: 1/-1; text-align: center; padding: 20px; color: #94a3b8;">No hay equipos próximos a vencer garantía.</div>`;
      
      garantias.forEach(g => {
          const isUrgent = g.dias_restantes < 30;
          html += `
          <div class="card">
            <div class="color-bar ${isUrgent ? 'bar-red' : 'bar-amber'}"></div>
            <div class="content">
                <div class="card-header">
                    <div>
                        <div class="code">${g.equipo.codigo_activo}</div>
                        <div class="model">${g.equipo.marca} ${g.equipo.modelo}</div>
                    </div>
                </div>
                <div class="row"><span class="label">Vence:</span><span class="value">${g.fecha_vencimiento}</span></div>
                <div class="row"><span class="label">Restan:</span><span class="${isUrgent ? 'days-red' : 'days-amber'}">${g.dias_restantes} días</span></div>
                <div class="row"><span class="label">Usuario:</span><span class="value">${g.equipo.responsable_nombre || 'N/A'}</span></div>
            </div>
          </div>`;
      });
      html += `</div>`;
      printCustomHTML(html, 'Reporte de Garantías Próximas');
  };

  // Pagination Logic
  const totalPages = Math.ceil(garantias.length / ITEMS_PER_PAGE);
  const paginatedGarantias = garantias.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3 w-full sm:w-auto flex-1">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                    <h4 className="font-bold text-orange-800">Equipos próximos a vencer garantía</h4>
                    <p className="text-sm text-orange-700">Este reporte muestra los equipos activos cuya garantía expira en los próximos 90 días.</p>
                </div>
            </div>
            
            <div className="flex gap-2">
                <button 
                    onClick={() => generateExcelFromData(prepareData(), 'Reporte_Garantias')}
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

        {/* ... rest of the component ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <p className="text-slate-500 p-4">Cargando reporte...</p> : paginatedGarantias.map((g, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${g.dias_restantes < 30 ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                    <div className="flex justify-between items-start mb-2 pl-2">
                        <div>
                            <p className="font-bold text-slate-800">{g.equipo.codigo_activo}</p>
                            <p className="text-xs text-slate-500">{g.equipo.marca} {g.equipo.modelo}</p>
                        </div>
                        <ShieldCheck className={`w-5 h-5 ${g.dias_restantes < 30 ? 'text-red-500' : 'text-amber-500'}`} />
                    </div>
                    
                    <div className="pl-2 space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Vencimiento:</span>
                            <span className="font-medium text-slate-700">{g.fecha_vencimiento}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Días Restantes:</span>
                            <span className={`font-bold ${g.dias_restantes < 30 ? 'text-red-600' : 'text-amber-600'}`}>
                                {g.dias_restantes} días
                            </span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Responsable:</span>
                            <span className="text-slate-700 truncate max-w-[120px]" title={g.equipo.responsable_nombre}>{g.equipo.responsable_nombre || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            ))}
            {!loading && garantias.length === 0 && (
                <div className="col-span-full p-8 text-center text-slate-500">No hay garantías próximas a vencer.</div>
            )}
        </div>

        {garantias.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={garantias.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                />
            </div>
        )}
    </div>
  );
};
