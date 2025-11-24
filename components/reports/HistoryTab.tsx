
import React, { useState, useEffect } from 'react';
import { HistorialMovimiento, TipoEquipo } from '../../types';
import { reportService } from '../../services/reportService';
import { Filter, Calendar, Download, Printer } from 'lucide-react';
import { downloadCSV } from '../../utils/csvExporter';
import { openPrintPreview } from '../../utils/documentGenerator';

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
      Fecha: h.fecha,
      Accion: h.tipo_accion,
      Equipo_Codigo: h.equipo_codigo,
      Responsable: h.usuario_responsable,
      Detalle: h.detalle
    }));
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
                onClick={() => openPrintPreview(prepareExportData(), 'Bitacora de Movimientos')}
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
                                {h.tipo_accion}
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
