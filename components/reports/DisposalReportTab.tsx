
import React, { useState, useEffect } from 'react';
import { HistorialMovimiento, Equipo } from '../../types';
import { reportService } from '../../services/reportService';
import { Eye, FileText, Search, Layers, Box, User, Trash2 } from 'lucide-react';
import { Modal } from '../common/Modal';

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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [movements, equipos] = await Promise.all([
            reportService.getMovements(),
            reportService.getEquipos()
        ]);

        // Filter only BAJA actions and enrich with equipment details for grouping
        const disposalMovements = movements
            .filter(m => m.tipo_accion === 'BAJA')
            .map(m => {
                const eq = equipos.find(e => e.id === m.equipo_id); // Assuming simple match or create map for optimization
                // Note: Historical equipment might be deleted, but in this mock they persist with status BAJA
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
  }, [filterText, bajas]);

  const groupedData: Record<string, DisposalItem[]> = grouping === 'NONE' 
    ? { 'Todos los Equipos': filteredBajas } 
    : filteredBajas.reduce((acc, item) => {
        const key = item.tipo_equipo_nombre || 'Otros';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, DisposalItem[]>);

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

         <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
            <button onClick={() => setGrouping('NONE')} className={`px-4 py-2 text-xs font-medium flex items-center gap-2 ${grouping === 'NONE' ? 'bg-red-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                <Layers className="w-3 h-3" /> Listado
            </button>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-600"></div>
            <button onClick={() => setGrouping('TYPE')} className={`px-4 py-2 text-xs font-medium flex items-center gap-2 ${grouping === 'TYPE' ? 'bg-red-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                <Box className="w-3 h-3" /> Por Tipo
            </button>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm transition-colors">
         {loading ? (
             <div className="p-12 text-center text-slate-500 dark:text-slate-400">Cargando reporte de bajas...</div>
         ) : filteredBajas.length === 0 ? (
             <div className="p-12 text-center flex flex-col items-center text-slate-400 dark:text-slate-500">
                 <Trash2 className="w-12 h-12 mb-2 text-slate-200 dark:text-slate-600" />
                 <p>No se encontraron registros de baja.</p>
             </div>
         ) : (
             Object.entries(groupedData).map(([groupName, items]) => (
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
             ))
         )}
      </div>

      <Modal isOpen={!!fileToView} onClose={() => setFileToView(null)} title="Evidencia de Baja">
         <div className="p-8 text-center bg-slate-50 dark:bg-slate-700/50 rounded-lg">
             <div className="mb-4 text-slate-400 font-medium">Visualizador de Archivo</div>
             <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800">
                 <FileText className="w-16 h-16 text-red-500 mb-3" />
                 <p className="font-mono text-sm text-slate-700 dark:text-slate-200 font-bold break-all bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded">{fileToView}</p>
                 <p className="text-xs text-slate-400 mt-3">
                    Este es un visor simulado. En producción se descargaría o visualizaría el PDF/Imagen real.
                 </p>
             </div>
             <div className="mt-6">
                <button onClick={() => setFileToView(null)} className="px-5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                    Cerrar
                </button>
             </div>
         </div>
      </Modal>
    </div>
  );
};
