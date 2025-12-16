
import React, { useState, useEffect, useRef } from 'react';
import { HistorialMovimiento, TipoEquipo } from '../../types';
import { reportService } from '../../services/reportService';
import { Filter, Calendar, Download, Printer, Eye, FileText, Search, User, Box, Layers, Zap } from 'lucide-react';
import { generateExcelFromData } from '../../utils/excelHelper';
import { printCustomHTML } from '../../utils/documentGenerator';
import { Pagination } from '../common/Pagination';
import { FileViewerModal } from '../common/FileViewerModal';

export const HistoryTab: React.FC = () => {
  const [historial, setHistorial] = useState<HistorialMovimiento[]>([]);
  const [tipos, setTipos] = useState<TipoEquipo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterType, setFilterType] = useState<string>('');
  const [filterEquipment, setFilterEquipment] = useState('');
  const [filterResponsible, setFilterResponsible] = useState('');

  // Grouping
  const [grouping, setGrouping] = useState<'NONE' | 'ACTION'>('NONE');
  
  // File Viewer State
  const [fileToView, setFileToView] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadData();
  }, []);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterEquipment, filterResponsible, grouping]);

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
    // Reload from API based on type
    const data = await reportService.getMovements(typeId ? Number(typeId) : undefined);
    setHistorial(data);
    setLoading(false);
  };

  // Client-side filtering for Equipment and Responsible
  const filteredHistorial = historial.filter(h => {
      const matchEq = filterEquipment 
        ? h.equipo_codigo.toLowerCase().includes(filterEquipment.toLowerCase()) 
        : true;
      const matchResp = filterResponsible 
        ? h.usuario_responsable.toLowerCase().includes(filterResponsible.toLowerCase()) 
        : true;
      return matchEq && matchResp;
  });

  // Grouping Logic for Display (Paginated)
  // We need this logic replicated for the full dataset in PDF export
  const getGroupedData = (data: HistorialMovimiento[]) => {
      return data.reduce((groups, item) => {
          const key = grouping === 'ACTION' ? item.tipo_accion : 'Listado General';
          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
          return groups;
      }, {} as Record<string, HistorialMovimiento[]>);
  };

  // Helper for colors
  const getActionColor = (accion: string) => {
    switch (accion) {
      case 'ASIGNACION': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'RECEPCION': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'BAJA': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'MANTENIMIENTO': return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      default: return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
    }
  };

  const getActionLabel = (accion: string) => {
      return accion.replace('_', ' ');
  };

  const prepareExportData = () => {
    return filteredHistorial.map(h => ({
      'Fecha': h.fecha,
      'Acción': h.tipo_accion,
      'Equipo': h.equipo_codigo, 
      'Responsable': h.usuario_responsable,
      'Detalle': h.detalle,
      'Archivo': h.archivo || 'N/A'
    }));
  };

  const handlePrintPDF = () => {
    let htmlContent = `
      <style>
        body { font-family: 'Segoe UI', sans-serif; color: #334155; }
        .header-title { font-size: 18px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; color: #1e293b; }
        .header-meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
        
        .group-container { margin-bottom: 25px; page-break-inside: avoid; }
        .group-header { 
            background-color: #f1f5f9; 
            padding: 8px 12px; 
            font-weight: 700; 
            font-size: 13px; 
            color: #0f172a; 
            border-left: 4px solid #3b82f6; 
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .count-badge { background: #fff; padding: 2px 8px; border-radius: 10px; font-size: 10px; border: 1px solid #cbd5e1; }

        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th { background-color: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0; }
        td { padding: 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        tr:last-child td { border-bottom: none; }
        
        .badge { display: inline-block; padding: 3px 8px; border-radius: 99px; font-size: 8px; font-weight: 700; border: 1px solid transparent; text-transform: uppercase; }
        .badge-asignacion { color: #16a34a; background-color: #f0fdf4; border-color: #bbf7d0; }
        .badge-recepcion { color: #2563eb; background-color: #eff6ff; border-color: #bfdbfe; }
        .badge-baja { color: #dc2626; background-color: #fef2f2; border-color: #fecaca; }
        .badge-mantenimiento { color: #d97706; background-color: #fffbeb; border-color: #fde68a; }
        .badge-pre-baja { color: #ea580c; background-color: #fff7ed; border-color: #fed7aa; }
        .badge-default { color: #475569; background-color: #f8fafc; border-color: #e2e8f0; }
        
        .font-medium { font-weight: 700; color: #0f172a; }
        .text-dim { color: #64748b; }
      </style>
      <div class="header-title">Bitácora de Movimientos</div>
      <div class="header-meta">Generado el: ${new Date().toLocaleDateString()} | Registros: ${filteredHistorial.length}</div>
    `;

    if (filteredHistorial.length === 0) {
       htmlContent += `<div style="text-align:center; padding: 20px; color: #94a3b8; font-style: italic;">No hay movimientos registrados.</div>`;
    } else {
        const pdfGroups = filteredHistorial.reduce((groups, item) => {
            const key = grouping === 'ACTION' ? item.tipo_accion : 'Listado Completo';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
        }, {} as Record<string, HistorialMovimiento[]>);

        Object.entries(pdfGroups).forEach(([groupName, items]: [string, HistorialMovimiento[]]) => {
            htmlContent += `
            <div class="group-container">
                ${grouping === 'ACTION' ? `<div class="group-header">${groupName.replace('_', ' ')} <span class="count-badge">${items.length}</span></div>` : ''}
                <table>
                    <thead>
                        <tr>
                            <th style="width: 12%">Fecha</th>
                            <th style="width: 15%">Acción</th>
                            <th style="width: 15%">Equipo</th>
                            <th style="width: 20%">Responsable</th>
                            <th style="width: 38%">Detalle</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            items.forEach(h => {
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
                    <td class="font-medium">${h.equipo_codigo}</td>
                    <td>${h.usuario_responsable}</td>
                    <td class="text-dim">${h.detalle}</td>
                </tr>
               `;
            });

            htmlContent += `</tbody></table></div>`;
        });
    }

    printCustomHTML(htmlContent, 'Bitácora de Movimientos');
  };

  const handleCloseViewer = () => {
      if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
      }
      setFileToView(null);
  };

  // Pagination Logic
  const totalItems = filteredHistorial.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedItems = filteredHistorial.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Group only the current page items for display
  const displayGroups = getGroupedData(paginatedItems);

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between items-end gap-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full xl:w-auto flex-1">
            {/* Type Filter */}
            <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Tipo Equipo
                </label>
                <select 
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                    value={filterType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                >
                    <option value="">Todos</option>
                    {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
            </div>

            {/* Equipment Filter */}
            <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Box className="w-3 h-3" /> Equipo (Código)
                </label>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Buscar código..."
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                        value={filterEquipment}
                        onChange={(e) => setFilterEquipment(e.target.value)}
                    />
                </div>
            </div>

            {/* Responsible Filter */}
            <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Responsable
                </label>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Buscar persona..."
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                        value={filterResponsible}
                        onChange={(e) => setFilterResponsible(e.target.value)}
                    />
                </div>
            </div>
         </div>

         <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
             {/* Grouping Toggle */}
             <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-800 h-[38px]">
                <button onClick={() => setGrouping('NONE')} className={`px-3 h-full text-xs font-medium flex items-center gap-2 ${grouping === 'NONE' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    <Layers className="w-3 h-3" /> Listado
                </button>
                <div className="w-px h-full bg-slate-200 dark:bg-slate-600"></div>
                <button onClick={() => setGrouping('ACTION')} className={`px-3 h-full text-xs font-medium flex items-center gap-2 ${grouping === 'ACTION' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    <Zap className="w-3 h-3" /> Por Acción
                </button>
             </div>

             {/* Export Actions */}
             <div className="flex gap-2">
                <button 
                    onClick={() => generateExcelFromData(prepareExportData(), 'Historial_Movimientos')}
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
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm transition-colors flex flex-col">
         {/* ... (rest of the component remains same) ... */}
         <div className="overflow-x-auto">
            {loading ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">Cargando movimientos...</div>
            ) : filteredHistorial.length === 0 ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">No se encontraron movimientos con los filtros seleccionados.</div>
            ) : (
                Object.entries(displayGroups).map(([groupKey, items]: [string, HistorialMovimiento[]]) => (
                    <div key={groupKey}>
                        {grouping === 'ACTION' && (
                            <div className="bg-slate-100 dark:bg-slate-700/50 px-6 py-2 border-b border-slate-200 dark:border-slate-600 flex items-center gap-2 font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                                <Zap className="w-4 h-4 text-blue-500" />
                                {groupKey.replace('_', ' ')}
                                <span className="text-xs bg-white dark:bg-slate-600 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-500 text-slate-500 dark:text-slate-300 ml-1 font-normal normal-case">{items.length}</span>
                            </div>
                        )}
                        
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            {/* Renderizar encabezado solo en la primera iteración si está en modo Listado, o siempre si está agrupado por acción (aunque el diseño es mejor con una sola tabla para listado) */}
                            {(grouping === 'ACTION' || (grouping === 'NONE' && groupKey === Object.keys(displayGroups)[0])) && (
                                <thead className="bg-slate-50 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Acción</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Equipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Responsable</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Detalle</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Evidencia</th>
                                    </tr>
                                </thead>
                            )}
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {items.map(h => (
                                    <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            {h.fecha}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getActionColor(h.tipo_accion)}`}>
                                                {getActionLabel(h.tipo_accion)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">
                                            {h.equipo_codigo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                            {h.usuario_responsable}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate" title={h.detalle}>
                                            {h.detalle}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {h.archivo ? (
                                                <button 
                                                    onClick={() => {
                                                        const url = h.archivo!.startsWith('http') || h.archivo!.startsWith('blob') 
                                                            ? h.archivo! 
                                                            : `http://localhost:8000/storage/${h.archivo}`; 
                                                        setFileToView(url);
                                                    }}
                                                    className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                                                    title="Ver Documento"
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
         
         {!loading && totalItems > 0 && (
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
            />
         )}
      </div>

      <FileViewerModal 
        isOpen={!!fileToView} 
        onClose={handleCloseViewer} 
        fileUrl={fileToView}
        title="Documento de Evidencia"
      />
    </div>
  );
};
