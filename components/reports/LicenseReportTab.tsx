
import React, { useState, useEffect } from 'react';
import { Licencia, TipoLicencia, Usuario } from '../../types';
import { reportService } from '../../services/reportService';
import { Filter, User, Box, Layers, Download, Key, Printer } from 'lucide-react';
import { generateExcelFromData } from '../../utils/excelHelper';
import { openPrintPreview, printCustomHTML } from '../../utils/documentGenerator';

export const LicenseReportTab: React.FC = () => {
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [tipos, setTipos] = useState<TipoLicencia[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterUser, setFilterUser] = useState('');
  
  // Grouping - Default to TYPE
  const [grouping, setGrouping] = useState<'NONE' | 'TYPE' | 'USER'>('TYPE');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [l, t, u] = await Promise.all([
          reportService.getLicenses(),
          reportService.getLicenseTypes(),
          reportService.getUsers()
        ]);
        // Solo nos interesan las licencias asignadas para este reporte
        setLicencias(l.filter(lic => lic.usuario_id !== null && lic.usuario_id !== undefined));
        setTipos(t);
        setUsuarios(u);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredData = licencias.filter(l => {
    const matchType = filterType ? l.tipo_id === Number(filterType) : true;
    const matchUser = filterUser ? l.usuario_id === Number(filterUser) : true;
    return matchType && matchUser;
  });

  const groupedData = filteredData.reduce((acc, item) => {
    const key = grouping === 'NONE' 
      ? 'Todas las Asignaciones' 
      : (grouping === 'TYPE' ? item.tipo_nombre : (item.usuario_nombre || 'Desconocido'));
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, Licencia[]>);

  const prepareExportData = () => {
    return filteredData.map(l => ({
      'Tipo Licencia': l.tipo_nombre,
      'Clave / ID': l.clave,
      'Usuario Asignado': l.usuario_nombre || '-', // Alineado con UI
      'Departamento': l.usuario_departamento || '-',
      'Vencimiento': l.fecha_vencimiento
    }));
  };

  const handlePrintPDF = () => {
    let htmlContent = `
      <style>
        .group-wrapper { border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; overflow: hidden; page-break-inside: avoid; }
        .group-header { background-color: #faf5ff; padding: 10px 16px; border-bottom: 1px solid #f3e8ff; display: flex; align-items: center; gap: 8px; color: #581c87; font-weight: 700; font-size: 13px; }
        .group-badge { background-color: #fff; border: 1px solid #f3e8ff; color: #9333ea; font-size: 10px; padding: 2px 8px; border-radius: 99px; font-weight: 500; }
        
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 10px; text-align: left; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
        td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; color: #334155; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        
        .avatar { width: 20px; height: 20px; background-color: #dbeafe; color: #2563eb; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; margin-right: 8px; }
        .user-container { display: flex; align-items: center; }
        .mono { font-family: monospace; color: #64748b; }
        
        .text-red { color: #dc2626; font-weight: 700; }
        .text-slate { color: #475569; }
      </style>
    `;

    if (Object.keys(groupedData).length === 0) {
       htmlContent += `<div style="text-align:center; padding: 20px; color: #94a3b8; font-style: italic;">No hay datos para mostrar.</div>`;
    } else {
       Object.entries(groupedData).forEach(([groupKey, items]: [string, Licencia[]]) => {
          htmlContent += `<div class="group-wrapper">`;
          
          // Header
          if (grouping !== 'NONE') {
              htmlContent += `
                <div class="group-header">
                   <span>${groupKey}</span>
                   <span class="group-badge">${items.length}</span>
                </div>
              `;
          }
          
          // Table
          htmlContent += `
            <table>
                <thead>
                    <tr>
                        <th style="width: 20%">Tipo Licencia</th>
                        <th style="width: 20%">Clave / ID</th>
                        <th style="width: 25%">Usuario Asignado</th>
                        <th style="width: 20%">Departamento</th>
                        <th style="width: 15%">Vencimiento</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(lic => {
                        const isExpired = new Date(lic.fecha_vencimiento) < new Date();
                        return `
                        <tr>
                            <td style="font-weight: 500;">${lic.tipo_nombre}</td>
                            <td class="mono">${lic.clave}</td>
                            <td>
                                <div class="user-container">
                                    <div class="avatar">${lic.usuario_nombre?.charAt(0) || '-'}</div>
                                    <span>${lic.usuario_nombre || '-'}</span>
                                </div>
                            </td>
                            <td>${lic.usuario_departamento || '-'}</td>
                            <td>
                                <span class="${isExpired ? 'text-red' : 'text-slate'}">
                                    ${lic.fecha_vencimiento}
                                </span>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
          `;
          htmlContent += `</div>`;
       });
    }

    printCustomHTML(htmlContent, 'Reporte de Licencias Asignadas');
  };

  return (
    <div className="space-y-4">
       {/* Toolbar */}
       <div className="p-4 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col md:flex-row gap-4 items-end transition-colors">
         <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Box className="w-3 h-3" /> Tipo de Licencia
                </label>
                <select 
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                >
                    <option value="">Todos</option>
                    {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Usuario Asignado
                </label>
                <select 
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterUser}
                    onChange={e => setFilterUser(e.target.value)}
                >
                    <option value="">Todos</option>
                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre_completo}</option>)}
                </select>
            </div>
         </div>

         <div className="flex items-center gap-3">
             <div className="flex flex-col">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Agrupar Por</label>
                 <div className="flex border border-slate-200 dark:border-slate-600 rounded overflow-hidden bg-white dark:bg-slate-800">
                    <button onClick={() => setGrouping('NONE')} className={`px-3 py-2 text-xs flex items-center gap-1 ${grouping === 'NONE' ? 'bg-purple-600 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        <Layers className="w-3 h-3" /> Plano
                    </button>
                    <button onClick={() => setGrouping('TYPE')} className={`px-3 py-2 text-xs flex items-center gap-1 ${grouping === 'TYPE' ? 'bg-purple-600 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        <Box className="w-3 h-3" /> Tipo
                    </button>
                    <button onClick={() => setGrouping('USER')} className={`px-3 py-2 text-xs flex items-center gap-1 ${grouping === 'USER' ? 'bg-purple-600 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        <User className="w-3 h-3" /> Usuario
                    </button>
                 </div>
             </div>
             
             <div className="flex flex-col">
                <label className="text-[10px] font-bold text-transparent uppercase mb-1">.</label>
                <div className="flex gap-2">
                    <button 
                        onClick={() => generateExcelFromData(prepareExportData(), 'Reporte_Licencias_Asignadas')}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-2 rounded text-sm font-medium h-[34px]"
                    >
                        <Download className="w-4 h-4" /> Exportar
                    </button>
                    <button 
                        onClick={handlePrintPDF}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-2 rounded text-sm font-medium h-[34px]"
                    >
                        <Printer className="w-4 h-4" /> PDF
                    </button>
                </div>
             </div>
         </div>
       </div>

       {/* Data Grid */}
       <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm transition-colors">
          {loading ? (
             <div className="p-8 text-center text-slate-500 dark:text-slate-400">Cargando datos...</div>
          ) : Object.keys(groupedData).length === 0 ? (
             <div className="p-8 text-center text-slate-500 dark:text-slate-400">No se encontraron licencias asignadas con los filtros seleccionados.</div>
          ) : (
             Object.entries(groupedData).map(([groupKey, items]: [string, Licencia[]]) => (
                <div key={groupKey}>
                    {grouping !== 'NONE' && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 border-b border-purple-100 dark:border-purple-900/30 flex items-center gap-2">
                             {grouping === 'TYPE' ? <Box className="w-4 h-4 text-purple-600 dark:text-purple-400" /> : <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                             <span className="font-bold text-purple-900 dark:text-purple-300 text-sm">{groupKey}</span>
                             <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs font-medium text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800">{items.length}</span>
                        </div>
                    )}
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tipo Licencia</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Clave / ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Usuario Asignado</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Departamento</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Vencimiento</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                            {items.map(lic => (
                                <tr key={lic.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-700 dark:text-slate-200">{lic.tipo_nombre}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-mono text-slate-500 dark:text-slate-400">{lic.clave}</td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                                                {lic.usuario_nombre?.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{lic.usuario_nombre}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{lic.usuario_departamento}</td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <span className={`text-sm ${new Date(lic.fecha_vencimiento) < new Date() ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {lic.fecha_vencimiento}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             ))
          )}
       </div>
    </div>
  );
};
