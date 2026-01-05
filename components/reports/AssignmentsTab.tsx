
import React, { useState, useEffect, useRef } from 'react';
import { HistorialAsignacion, Usuario, Equipo, Licencia } from '../../types';
import { reportService } from '../../services/reportService';
import { Eye, User, Laptop, Key, Download, Search, FileText, Printer, Upload } from 'lucide-react';
import { Modal } from '../common/Modal';
import { generateExcelFromData } from '../../utils/excelHelper';
import { printCustomHTML } from '../../utils/documentGenerator';
import Swal from 'sweetalert2';

interface AssignmentsTabProps {
  usuarios: Usuario[];
  equipos: Equipo[];
}

interface UserAssets {
  user: Usuario;
  equipment: HistorialAsignacion[];
  licenses: Licencia[];
}

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ usuarios }) => {
  const [activeAssignments, setActiveAssignments] = useState<HistorialAsignacion[]>([]);
  const [activeLicenses, setActiveLicenses] = useState<Licencia[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [fileToView, setFileToView] = useState<string | null>(null);
    const [fileToViewUrl, setFileToViewUrl] = useState<string | null>(null);
    const [fileToViewType, setFileToViewType] = useState<string | null>(null);

  // Upload Logic
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadId, setUploadId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allAssignments, allLicenses] = await Promise.all([
        reportService.getAssignments(),
        reportService.getLicenses()
      ]);

      // Filtrar solo asignaciones vigentes (fecha_fin es null)
      setActiveAssignments(allAssignments.filter(a => a.fecha_fin === null));
      
      // Filtrar solo licencias asignadas (usuario_id no es null)
      setActiveLicenses(allLicenses.filter(l => l.usuario_id !== null && l.usuario_id !== undefined));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = (id: number) => {
      setUploadId(id);
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0] && uploadId) {
          try {
              setLoading(true);
              await reportService.uploadAssignmentFile(uploadId, e.target.files[0]);
              await loadData();
              Swal.fire('Éxito', 'Documento cargado correctamente', 'success');
          } catch (error) {
              Swal.fire('Error', 'No se pudo cargar el documento', 'error');
          } finally {
              setLoading(false);
              setUploadId(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      }
  };

    const openFile = async (path?: string | null) => {
        if (!path) return Swal.fire('Info', 'No hay archivo disponible', 'info');
        try {
            const backendOrigin = window.location.origin.includes(':3000') ? window.location.origin.replace(':3000', ':8000') : window.location.origin;
            const normalized = path.startsWith('/') ? path : '/' + path;
            const url = path.startsWith('http') ? path : backendOrigin + normalized;

            // Public proxy route is served without auth; do not send Authorization header to avoid preflight
            const res = await fetch(url);
            if (!res.ok) throw new Error('Fetch failed ' + res.status);
            const blob = await res.blob();
            const objUrl = URL.createObjectURL(blob);
            // Revoke previous if exists
            if (fileToViewUrl) URL.revokeObjectURL(fileToViewUrl);
            setFileToViewType(blob.type || null);
            setFileToViewUrl(objUrl);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudo abrir el archivo', 'error');
        }
    };

  // Procesar datos agrupados por usuario
  const userAssetsList: UserAssets[] = usuarios.map(user => {
    // Buscar equipos asignados a este usuario (Por nombre, ya que el historial usa nombres)
    const userEq = activeAssignments.filter(a => a.usuario_nombre === user.nombre_completo);
    
    // Buscar licencias asignadas a este usuario (Por ID)
    const userLic = activeLicenses.filter(l => l.usuario_id === user.id);

    return {
      user,
      equipment: userEq,
      licenses: userLic
    };
  }).filter(item => {
    // Aplicar filtro de usuario seleccionado
    if (filterUserId && item.user.id !== Number(filterUserId)) return false;
    
    // Ocultar usuarios sin activos (Opcional, pero recomendado para reportes limpios)
    return item.equipment.length > 0 || item.licenses.length > 0;
  });

  const prepareExportData = () => {
    return userAssetsList.flatMap(item => {
      const eqRows = item.equipment.map(e => ({
        'Usuario': item.user.nombre_completo,
        'Departamento': item.user.departamento_nombre || 'Sin Departamento',
        'Tipo Activo': 'EQUIPO',
        'Descripción': e.equipo_modelo,
        'Código': e.equipo_codigo,
        'Fecha Asignación': e.fecha_inicio,
        'Vencimiento': 'N/A'
      }));
      
      const licRows = item.licenses.map(l => ({
        'Usuario': item.user.nombre_completo,
        'Departamento': item.user.departamento_nombre || 'Sin Departamento',
        'Tipo Activo': 'LICENCIA',
        'Descripción': l.tipo_nombre,
        'Código': l.clave,
        'Fecha Asignación': 'N/A', 
        'Vencimiento': l.fecha_vencimiento
      }));

      return [...eqRows, ...licRows];
    });
  };

  const handlePrintPDF = () => {
    let htmlContent = `
      <style>
        .user-card { border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 25px; overflow: hidden; page-break-inside: avoid; }
        .user-header { background-color: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .avatar { width: 32px; height: 32px; background-color: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 10px; }
        .user-info { flex: 1; }
        .user-name { font-size: 15px; font-weight: 700; color: #1e293b; }
        .user-meta { font-size: 11px; color: #64748b; margin-top: 2px; }
        .counts { display: flex; gap: 8px; }
        .count-badge { padding: 4px 10px; border-radius: 99px; font-size: 10px; font-weight: 600; border: 1px solid transparent; }
        .count-eq { background-color: #eff6ff; color: #1d4ed8; border-color: #dbeafe; }
        .count-lic { background-color: #faf5ff; color: #7e22ce; border-color: #f3e8ff; }
        
        .grid-container { display: flex; border-top: 1px solid #e2e8f0; }
        .col-section { flex: 1; border-right: 1px solid #e2e8f0; }
        .col-section:last-child { border-right: none; }
        .section-header { padding: 8px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; }
        .header-eq { background-color: #eff6ff; color: #1e40af; border-bottom: 1px solid #dbeafe; }
        .header-lic { background-color: #faf5ff; color: #6b21a8; border-bottom: 1px solid #f3e8ff; }
        
        .empty-state { padding: 15px; text-align: center; color: #cbd5e1; font-style: italic; font-size: 11px; }
        
        table.inner-table { width: 100%; border-collapse: collapse; }
        table.inner-table th { background: transparent; border-bottom: 1px solid #f1f5f9; padding: 6px 12px; font-size: 10px; text-align: left; color: #64748b; font-weight: 600; text-transform: uppercase; }
        table.inner-table td { padding: 6px 12px; font-size: 11px; border-bottom: 1px solid #f8fafc; color: #334155; }
        table.inner-table tr:last-child td { border-bottom: none; }
      </style>
    `;

    if (userAssetsList.length === 0) {
       htmlContent += `<div style="text-align:center; padding: 40px; color: #64748b;">No hay datos para mostrar con los filtros actuales.</div>`;
    } else {
       userAssetsList.forEach(({ user, equipment, licenses }) => {
          htmlContent += `
            <div class="user-card">
               <div class="user-header">
                  <div style="display:flex; align-items:center;">
                     <div class="avatar">${user.nombres.charAt(0)}${user.apellidos.charAt(0)}</div>
                     <div class="user-info">
                        <div class="user-name">${user.nombre_completo}</div>
                        <div class="user-meta">${user.departamento_nombre || 'Sin Depto'} | ${user.puesto_nombre || 'Sin Cargo'}</div>
                     </div>
                  </div>
                  <div class="counts">
                     <span class="count-badge count-eq">Equipos: ${equipment.length}</span>
                     <span class="count-badge count-lic">Licencias: ${licenses.length}</span>
                  </div>
               </div>
               
               <div class="grid-container">
                  <!-- Equipment Column -->
                  <div class="col-section">
                     <div class="section-header header-eq">Equipos Asignados</div>
                     ${equipment.length > 0 ? `
                        <table class="inner-table">
                           <thead>
                              <tr>
                                 <th>Código</th>
                                 <th>Modelo</th>
                                 <th>Fecha</th>
                              </tr>
                           </thead>
                           <tbody>
                              ${equipment.map(e => `
                                 <tr>
                                    <td style="font-weight:500;">${e.equipo_codigo}</td>
                                    <td>${e.equipo_modelo}</td>
                                    <td>${e.fecha_inicio}</td>
                                 </tr>
                              `).join('')}
                           </tbody>
                        </table>
                     ` : `<div class="empty-state">Sin equipos</div>`}
                  </div>
                  
                  <!-- Licenses Column -->
                  <div class="col-section">
                     <div class="section-header header-lic">Licencias Asignadas</div>
                     ${licenses.length > 0 ? `
                        <table class="inner-table">
                           <thead>
                              <tr>
                                 <th>Software</th>
                                 <th>Clave / ID</th>
                                 <th>Vencimiento</th>
                              </tr>
                           </thead>
                           <tbody>
                              ${licenses.map(l => `
                                 <tr>
                                    <td style="font-weight:500;">${l.tipo_nombre}</td>
                                    <td style="font-family:monospace; color:#64748b;">${l.clave}</td>
                                    <td>${l.fecha_vencimiento}</td>
                                 </tr>
                              `).join('')}
                           </tbody>
                        </table>
                     ` : `<div class="empty-state">Sin licencias</div>`}
                  </div>
               </div>
            </div>
          `;
       });
    }

    printCustomHTML(htmlContent, 'Reporte de Activos por Usuario');
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col md:flex-row gap-4 items-end justify-between transition-colors">
        <div className="w-full md:w-1/3">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Search className="w-3 h-3" /> Filtrar Usuario
            </label>
            <select 
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={filterUserId}
                onChange={e => setFilterUserId(e.target.value)}
            >
                <option value="">Todos los Usuarios con Activos</option>
                {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre_completo}</option>)}
            </select>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={() => generateExcelFromData(prepareExportData(), 'Reporte_Activos_Por_Usuario')}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
                <Download className="w-4 h-4" /> Excel
            </button>
            <button 
                onClick={handlePrintPDF}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
                <Printer className="w-4 h-4" /> PDF
            </button>
        </div>
      </div>

      {/* Listado Agrupado */}
      <div className="space-y-8">
        {loading ? (
             <div className="p-12 text-center text-slate-500 dark:text-slate-400">Cargando activos...</div>
        ) : userAssetsList.length === 0 ? (
             <div className="p-12 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                No se encontraron asignaciones para los criterios seleccionados.
             </div>
        ) : (
            userAssetsList.map(({ user, equipment, licenses }) => (
                <div key={user.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm transition-colors">
                    {/* User Header */}
                    <div className="bg-slate-100 dark:bg-slate-700/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                {user.nombres.charAt(0)}{user.apellidos.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white text-lg">{user.nombre_completo}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <User className="w-3 h-3" /> {user.departamento_nombre || 'Sin Departamento'} 
                                    <span className="text-slate-300 dark:text-slate-600">|</span> 
                                    {user.puesto_nombre || 'Sin Cargo'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                <Laptop className="w-3 h-3 text-blue-500" /> {equipment.length} Equipos
                            </span>
                            <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                <Key className="w-3 h-3 text-purple-500" /> {licenses.length} Licencias
                            </span>
                        </div>
                    </div>

                    <div className="p-0 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Equipos Section */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-fit">
                            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 border-b border-blue-100 dark:border-blue-900/30 font-semibold text-blue-800 dark:text-blue-300 text-sm flex items-center gap-2">
                                <Laptop className="w-4 h-4" /> Equipos Asignados
                            </div>
                            {equipment.length > 0 ? (
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs uppercase">Código</th>
                                            <th className="px-4 py-2 text-left text-xs uppercase">Modelo</th>
                                            <th className="px-4 py-2 text-left text-xs uppercase">Fecha</th>
                                            <th className="px-4 py-2 text-center text-xs uppercase">Doc</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {equipment.map(eq => (
                                            <tr key={eq.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{eq.equipo_codigo}</td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-[150px]" title={eq.equipo_modelo}>{eq.equipo_modelo}</td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{eq.fecha_inicio}</td>
                                                <td className="px-4 py-3 text-center">
                                                    { (eq as any).archivo || (eq as any).archivo_pdf ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={() => openFile((eq as any).archivo ?? (eq as any).archivo_pdf)} className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1 rounded" title="Ver Documento">
                                                                <Eye className="w-4 h-4"/>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => handleUploadClick(eq.id)} className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-700" title="Subir Documento Firmado">
                                                            <Upload className="w-4 h-4"/>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-4 text-center text-slate-400 text-sm italic">Sin equipos asignados</div>
                            )}
                        </div>

                        {/* Licencias Section */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-fit">
                            <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 border-b border-purple-100 dark:border-purple-900/30 font-semibold text-purple-800 dark:text-purple-300 text-sm flex items-center gap-2">
                                <Key className="w-4 h-4" /> Licencias Asignadas
                            </div>
                            {licenses.length > 0 ? (
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs uppercase">Software</th>
                                            <th className="px-4 py-2 text-left text-xs uppercase">Clave / ID</th>
                                            <th className="px-4 py-2 text-left text-xs uppercase">Vence</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {licenses.map(lic => (
                                            <tr key={lic.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{lic.tipo_nombre}</td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{lic.clave}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${new Date(lic.fecha_vencimiento) < new Date() ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                                                        {lic.fecha_vencimiento}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-4 text-center text-slate-400 text-sm italic">Sin licencias asignadas</div>
                            )}
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf,image/*" onChange={handleFileChange} />

            <Modal isOpen={!!fileToViewUrl} onClose={() => { if (fileToViewUrl) URL.revokeObjectURL(fileToViewUrl); setFileToViewUrl(null); setFileToViewType(null); }} title="Vista Previa de Documento">
                 <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                         {!fileToViewUrl ? (
                             <div className="p-8 text-center text-slate-500">Cargando...</div>
                         ) : (
                             <div className="w-full h-[70vh]">
                                 {fileToViewType && fileToViewType.startsWith('image/') ? (
                                     <img src={fileToViewUrl} alt="Archivo" className="max-w-full max-h-full mx-auto" />
                                 ) : (
                                     <iframe src={fileToViewUrl} title="Documento" className="w-full h-full border-0" />
                                 )}
                             </div>
                         )}
                 </div>
            </Modal>
    </div>
  );
};
