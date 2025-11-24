
import React, { useState, useEffect } from 'react';
import { RegistroMantenimiento } from '../../types';
import { reportService } from '../../services/reportService';
import { formatCurrency } from '../../utils/formatters';
import { Wrench, Download, Printer } from 'lucide-react';
import { downloadCSV } from '../../utils/csvExporter';
import { openPrintPreview } from '../../utils/documentGenerator';

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
      Fecha: reg.fecha,
      Equipo: `${reg.equipo_codigo} - ${reg.equipo_modelo}`,
      Tipo: reg.tipo_mantenimiento,
      Proveedor: reg.proveedor,
      Costo: formatCurrency(reg.costo),
      Detalle: reg.descripcion
    }));
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
                    onClick={() => openPrintPreview(prepareExportData(), 'Historial de Mantenimientos')}
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
