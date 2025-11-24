
import React, { useState, useEffect } from 'react';
import { ReporteGarantia } from '../../types';
import { reportService } from '../../services/reportService';
import { AlertTriangle, ShieldCheck, Download, Printer } from 'lucide-react';
import { downloadCSV } from '../../utils/csvExporter';
import { printCustomHTML } from '../../utils/documentGenerator';

export const WarrantiesTab: React.FC = () => {
  const [garantias, setGarantias] = useState<ReporteGarantia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getWarranties().then((data) => {
        setGarantias(data.sort((a,b) => a.dias_restantes - b.dias_restantes));
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
    let htmlContent = `
      <style>
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .card { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; position: relative; page-break-inside: avoid; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .color-bar { position: absolute; top: 0; bottom: 0; left: 0; width: 4px; }
        .bar-red { background-color: #ef4444; }
        .bar-amber { background-color: #f59e0b; }
        .content { padding: 16px 16px 16px 20px; }
        .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; }
        .code { font-weight: 700; color: #1e293b; font-size: 14px; }
        .model { font-size: 11px; color: #64748b; margin-top: 2px; }
        .row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; }
        .label { color: #64748b; }
        .value { font-weight: 500; color: #334155; }
        .days-red { color: #dc2626; font-weight: 700; }
        .days-amber { color: #d97706; font-weight: 700; }
        .icon { font-size: 16px; }
      </style>
      <div class="grid">
    `;
    
    if (garantias.length === 0) {
        htmlContent += `<div style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 20px;">No hay garantías próximas a vencer.</div>`;
    }

    garantias.forEach(g => {
        const isUrgent = g.dias_restantes < 30;
        htmlContent += `
          <div class="card">
            <div class="color-bar ${isUrgent ? 'bar-red' : 'bar-amber'}"></div>
            <div class="content">
               <div class="header">
                  <div>
                    <div class="code">${g.equipo.codigo_activo}</div>
                    <div class="model">${g.equipo.marca} ${g.equipo.modelo}</div>
                  </div>
                  <div class="icon">${isUrgent ? '⚠️' : '🛡️'}</div>
               </div>
               <div class="row">
                  <span class="label">Vencimiento:</span>
                  <span class="value">${g.fecha_vencimiento}</span>
               </div>
               <div class="row">
                  <span class="label">Días Restantes:</span>
                  <span class="${isUrgent ? 'days-red' : 'days-amber'}">${g.dias_restantes} días</span>
               </div>
               <div class="row">
                  <span class="label">Responsable:</span>
                  <span class="value">${g.equipo.responsable_nombre || 'N/A'}</span>
               </div>
            </div>
          </div>
        `;
    });

    htmlContent += `</div>`;
    printCustomHTML(htmlContent, 'Reporte de Garantías Próximas');
  };

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
                    onClick={() => downloadCSV(prepareData(), 'Reporte_Garantias')}
                    className="flex items-center gap-2 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <Download className="w-4 h-4" /> Excel
                </button>
                <button 
                    onClick={handlePrintPDF}
                    className="flex items-center gap-2 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <Printer className="w-4 h-4" /> PDF
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <p className="text-slate-500 p-4">Cargando reporte...</p> : garantias.map((g, idx) => (
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
    </div>
  );
};
