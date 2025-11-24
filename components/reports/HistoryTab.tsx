
import React, { useState, useEffect } from 'react';
import { HistorialMovimiento, TipoEquipo } from '../../types';
import { reportService } from '../../services/reportService';
import { Filter, Calendar, Download, Printer } from 'lucide-react';
import { downloadCSV } from '../../utils/csvExporter';
import { printCustomHTML } from '../../utils/documentGenerator';

export const HistoryTab: React.FC = () => {
  const [historial, setHistorial] = useState<HistorialMovimiento[]>([]);
  const [tipos, setTipos] = useState<TipoEquipo[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [h, t] = await Promise.all([
        reportService.getMovements(),
        reportService.getEquipmentTypes()
      ]);
      setHistorial(h);
      setTipos(t);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = async (typeId: string) => {
    setFilterType(typeId);
    setLoading(true);
    const data = await reportService.getMovements(typeId ? Number(typeId) : undefined);
    setHistorial(data);
    setLoading(false);
  };

  const getActionColor = (accion: string) => {
    switch (accion) {
      case 'ASIGNACION': return 'text-green-600 bg-green-50 border-green-200';
      case 'RECEPCION': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'BAJA': return 'text-red-600 bg-red-50 border-red-200';
      case 'MANTENIMIENTO': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const prepareExportData = () => {
    return historial.map(h => ({
      'Fecha': h.fecha,
      'Acción': h.tipo_accion,
      'Código Equipo': h.equipo_codigo,
      'Responsable': h.usuario_responsable,
      'Detalle': h.detalle
    }));
  };

  const handlePrintPDF = () => {
    let htmlContent = `
      <style>
        table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
        th { background-color: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 10px; text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
        td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; color: #334155; vertical-align: top; }
        tr:last-child td { border-bottom: none; }
        
        .badge { display: inline-block; padding: 4px 8px; border-radius: 99px; font-size: 9px; font-weight: 700; border: 1px solid transparent; text-transform: uppercase; }
        .badge-asignacion { color: #16a34a; background-color: #f0fdf4; border-color: #bbf7d0; }
        .badge-recepcion { color: #2563eb; background-color: #eff6ff; border-color: #bfdbfe; }
        .badge-baja { color: #dc2626; background-color: #fef2f2; border-color: #fecaca; }
        .badge-mantenimiento { color: #d97706; background-color: #fffbeb; border-color: #fde68a; }
        .badge-pre-baja { color: #ea580c; background-color: #fff7ed; border-color: #fed7aa; }
        .badge-default { color: #475569; background-color: #f8fafc; border-color: #e2e8f0; }

        .font-medium { font-weight: 600; }
        .text-slate-800 { color: #1e293b; }
        .text-slate-600 { color: #475569; }
      </style>
    `;

    if (historial.length === 0) {
       htmlContent += `<div style="text-align:center; padding: 20px; color: #94a3b8; font-style: italic;">No hay movimientos registrados.</div>`;
    } else {
       htmlContent += `
        <table>
            <thead>
                <tr>
                    <th style="width: 15%">Fecha</th>
                    <th style="width: 15%">Acción</th>
                    <th style="width: 15%">Equipo</th>
                    <th style="width: 20%">Responsable</th>
                    <th style="width: 35%">Detalle</th>
                </tr>
            </thead>
            <tbody>
       `;

       historial.forEach(h => {
           let badgeClass = 'badge-default';
           switch (h.tipo_accion) {
               case 'ASIGNACION': badgeClass = 'badge-asignacion'; break;
               case 'RECEPCION': badgeClass = 'badge-recepcion'; break;
               case 'BAJA': badgeClass = 'badge-baja'; break;
               case 'MANTENIMIENTO': badgeClass = 'badge-mantenimiento'; break;
               case 'PRE_BAJA': badgeClass = 'badge-pre-baja'; break;
               default: badgeClass = 'badge-default'; break;
           }

           htmlContent += `
            <tr>
                <td>${h.fecha}</td>
                <td><span class="badge ${badgeClass}">${h.tipo_accion.replace('_', ' ')}</span></td>
                <td class="font-medium text-slate-800">${h.equipo_codigo}</td>
                <td>${h.usuario_responsable}</td>
                <td class="text-slate-600">${h.detalle}</td>
            </tr>
           `;
       });

       htmlContent += `
            </tbody>
        </table>
       `;
    }

    printCustomHTML(htmlContent, 'Bitácora de Movimientos');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
         <div className="flex items-center gap-4">
            <div className="relative">
                <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <select 
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                >
                    <option value="">Todos los Tipos</option>
                    {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
            </div>
         </div>
         <div className="flex gap-2">
            <button 
                onClick={() => downloadCSV(prepareExportData(), 'Historial_Movimientos')}
                className="flex items-center gap-2 text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium border border-slate-300 bg-white transition-colors"
            >
                <Download className="w-4 h-4" /> Excel
            </button>
            <button 
                onClick={handlePrintPDF}
                className="flex items-center gap-2 text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium border border-slate-300 bg-white transition-colors"
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Acción</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Equipo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Responsable</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Detalle</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">Cargando...</td></tr>
                ) : historial.map(h => (
                    <tr key={h.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {h.fecha}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getActionColor(h.tipo_accion)}`}>
                                {h.tipo_accion.replace('_', ' ')}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                            {h.equipo_codigo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {h.usuario_responsable}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">
                            {h.detalle}
                        </td>
                    </tr>
                ))}
                {!loading && historial.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No hay movimientos registrados.</td></tr>
                )}
            </tbody>
         </table>
      </div>
    </div>
  );
};
