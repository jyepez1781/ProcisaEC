
import React, { useState, useEffect, useMemo } from 'react';
import { Equipo, EstadoEquipo, TipoEquipo } from '../../types';
import { reportService } from '../../services/reportService';
import { Search, Download, Printer, Box, Cpu, Database, HardDrive, Monitor, Layout, Activity } from 'lucide-react';
import { generateExcelFromData } from '../../utils/excelHelper';
import { generateStockReportPDF } from '../../utils/documentGenerator';
import { Pagination } from '../common/Pagination';

export const StockReportTab: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [tipos, setTipos] = useState<TipoEquipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [e, t] = await Promise.all([
          reportService.getEquipos(),
          reportService.getEquipmentTypes()
        ]);
        // No mostrar equipos dados de baja en el reporte de stock operativo
        setEquipos(e.filter(eq => eq.estado !== EstadoEquipo.BAJA));
        setTipos(t);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredEquipos = useMemo(() => {
    if (!filterText) return equipos;
    const lower = filterText.toLowerCase();
    return equipos.filter(e => 
      e.codigo_activo.toLowerCase().includes(lower) ||
      e.numero_serie.toLowerCase().includes(lower) ||
      e.marca.toLowerCase().includes(lower) ||
      e.modelo.toLowerCase().includes(lower) ||
      (e.responsable_nombre && e.responsable_nombre.toLowerCase().includes(lower))
    );
  }, [equipos, filterText]);

  // Resumen de conteos por Tipo y Estado
  const summaryStats = useMemo(() => {
    const stats: Record<string, Record<string, number>> = {};
    filteredEquipos.forEach(eq => {
      const t = eq.tipo_nombre || 'Otros';
      const s = eq.estado;
      if (!stats[t]) stats[t] = {};
      stats[t][s] = (stats[t][s] || 0) + 1;
    });
    return stats;
  }, [filteredEquipos]);

  // Agrupación jerárquica para la tabla: Tipo -> Estado
  const groupedData = useMemo(() => {
    const paged = filteredEquipos.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    return paged.reduce((acc, eq) => {
      const typeKey = eq.tipo_nombre || 'Otros';
      const statusKey = eq.estado;
      
      if (!acc[typeKey]) acc[typeKey] = {};
      if (!acc[typeKey][statusKey]) acc[typeKey][statusKey] = [];
      
      acc[typeKey][statusKey].push(eq);
      return acc;
    }, {} as Record<string, Record<string, Equipo[]>>);
  }, [filteredEquipos, currentPage]);

  const handleExportExcel = () => {
    const data = filteredEquipos.map(e => ({
      'Código Activo': e.codigo_activo,
      'Serie': e.numero_serie,
      'Tipo': e.tipo_nombre,
      'Marca': e.marca,
      'Modelo': e.modelo,
      'Estado': e.estado,
      'Usuario Asignado': e.responsable_nombre || 'DISPONIBLE EN BODEGA',
      'Ubicación': e.ubicacion_nombre,
      'Procesador': e.procesador || 'N/A',
      'RAM': e.ram || 'N/A',
      'Disco': `${e.disco_capacidad || 'N/A'} ${e.disco_tipo || ''}`,
      'S.O.': e.sistema_operativo || 'N/A'
    }));
    generateExcelFromData(data, 'Reporte_Stock_Inventario_IT');
  };

  const handleExportPDF = () => {
    generateStockReportPDF(filteredEquipos);
  };

  return (
    <div className="space-y-6">
      {/* 1. Resumen Superior (Etiquetas por Tipo y Estado) */}
      {!loading && filteredEquipos.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest">
            <Activity className="w-4 h-4" /> Resumen de Disponibilidad
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summaryStats).map(([type, states]) => (
              <div key={type} className="flex items-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                <span className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase">{type}</span>
                <div className="flex gap-1 px-2 py-1">
                  {Object.entries(states).map(([status, count]) => (
                    <span key={status} className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      status === 'Activo' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' :
                      status === 'Disponible' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' :
                      'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
                    }`}>
                      {status}: {count}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Filtros y Acciones */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar por código, serie, modelo o usuario..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={filterText}
            onChange={e => { setFilterText(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={handleExportExcel} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors">
            <Download className="w-4 h-4" /> Excel
          </button>
          <button onClick={handleExportPDF} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors">
            <Printer className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* 3. Tabla Agrupada */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm transition-colors">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Cargando inventario...</div>
        ) : filteredEquipos.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic">No se encontraron activos.</div>
        ) : (
          <div className="overflow-x-auto">
            {Object.entries(groupedData).map(([typeName, states]) => (
              <div key={typeName} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-2 flex items-center gap-2 font-bold text-blue-800 dark:text-blue-400 text-xs uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                  <Box className="w-3.5 h-3.5" /> {typeName}
                </div>
                
                {Object.entries(states).map(([status, items]) => (
                  <div key={status}>
                    <div className="px-8 py-1.5 bg-white dark:bg-slate-800 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{status}</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium text-slate-500">{items.length} unidades</span>
                    </div>
                    
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                      <thead className="bg-slate-50/30 dark:bg-slate-800/30">
                        <tr>
                          <th className="px-6 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">Activo / Serie</th>
                          <th className="px-6 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">Modelo</th>
                          <th className="px-6 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">Usuario / Resp.</th>
                          <th className="px-6 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">Especificaciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                        {items.map(eq => (
                          <tr key={eq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{eq.codigo_activo}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{eq.numero_serie}</div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="text-sm text-slate-700 dark:text-slate-300">{eq.marca}</div>
                              <div className="text-xs text-slate-500">{eq.modelo}</div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              {eq.responsable_nombre ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                                    {eq.responsable_nombre.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{eq.responsable_nombre}</div>
                                    <div className="text-[10px] text-slate-500">{eq.ubicacion_nombre}</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-slate-400 italic text-xs">
                                  <Monitor className="w-3.5 h-3.5" /> Bodega: {eq.ubicacion_nombre}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              {eq.procesador ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                                    <Cpu className="w-3 h-3 text-blue-500" /> <span className="font-medium">{eq.procesador}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                      <Database className="w-3 h-3 text-purple-500" /> {eq.ram}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                      <HardDrive className="w-3 h-3 text-amber-500" /> {eq.disco_capacidad} {eq.disco_tipo}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-[9px] text-slate-400">
                                      <Layout className="w-3 h-3 text-blue-400" /> {eq.sistema_operativo || 'S.O No especificado'}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No disponible</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <Pagination 
          currentPage={currentPage}
          totalPages={Math.ceil(filteredEquipos.length / ITEMS_PER_PAGE)}
          onPageChange={setCurrentPage}
          totalItems={filteredEquipos.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
    </div>
  );
};
