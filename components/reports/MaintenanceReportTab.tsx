
import React, { useState, useEffect } from 'react';
import { RegistroMantenimiento } from '../../types';
import { reportService } from '../../services/reportService';
import { formatCurrency } from '../../utils/formatters';
import { Wrench, Download, Printer } from 'lucide-react';
import { downloadCSV } from '../../utils/csvExporter';
import { printCustomHTML } from '../../utils/documentGenerator';

export const MaintenanceReportTab: React.FC = () => {
  const [registros, setRegistros] = useState<RegistroMantenimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getMaintenance().then((data) => {
        setRegistros(data);
        setLoading(false);
    });
  }, []);

  const totalCost = registros.reduce((acc, curr) => acc + curr.costo, 0);

  const prepareExportData = () => {
    return registros.map(reg => ({
      'Fecha': reg.fecha,
      'Equipo': `${reg.equipo_codigo} - ${reg.equipo_modelo}`,
      'Tipo Mantenimiento': reg.tipo_mantenimiento,
      'Proveedor': reg.proveedor,
      'Costo': formatCurrency(reg.costo),
      'Detalle Trabajo': reg.descripcion
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
        .text-slate-500 { color: #64748b; }
        .mono { font-family: monospace; }
      </style>
      
      <div class="summary-row">
          <div class="summary-card bg-blue">
              <div class="card-title text-blue">Total Mantenimientos</div>
              <div class="card-value text-blue">${registros.length}</div>
          </div>
          <div class="summary-card bg-amber">
              <div class="card-title text-amber">Costo Total Acumulado</div>
              <div class="card-value text-amber">${formatCurrency(totalCost)}</div>
          </div>
      </div>
    `;

    if (registros.length === 0) {
       htmlContent += `<div style="text-align:center; padding: 30px; color: #94a3b8; font-style: italic;">No hay registros de mantenimiento.</div>`;
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

       registros.forEach(reg => {
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

       htmlContent += `
            </tbody>
        </table>
       `;
    }

    printCustomHTML(htmlContent, 'Historial de Mantenimientos');
  };

  return (
    <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-600 font-medium">Total Mantenimientos</p>
                <p className="text-2xl font-bold text-blue-800">{registros.length}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <p className="text-sm text-amber-600 font-medium">Costo Total Acumulado</p>
                <p className="text-2xl font-bold text-amber-800">{formatCurrency(totalCost)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-center gap-2">
                <button 
                    onClick={() => downloadCSV(prepareExportData(), 'Reporte_Mantenimiento')}
                    className="flex items-center gap-2 bg-white border border-slate-300 shadow-sm px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm"
                >
                    <Download className="w-4 h-4" /> Excel
                </button>
                <button 
                    onClick={handlePrintPDF}
                    className="flex items-center gap-2 bg-white border border-slate-300 shadow-sm px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm"
                >
                    <Printer className="w-4 h-4" /> PDF
                </button>
            </div>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Equipo</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Proveedor</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Costo</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Trabajo Realizado</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {loading ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">Cargando...</td></tr>
                    ) : registros.map(reg => (
                        <tr key={reg.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{reg.fecha}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-slate-900">{reg.equipo_codigo}</div>
                                <div className="text-xs text-slate-500">{reg.equipo_modelo}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${reg.tipo_mantenimiento === 'Correctivo' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {reg.tipo_mantenimiento}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{reg.proveedor}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">{formatCurrency(reg.costo)}</td>
                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={reg.descripcion}>{reg.descripcion}</td>
                        </tr>
                    ))}
                    {!loading && registros.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">No hay registros de mantenimiento.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};
