import React, { useState, useEffect } from 'react';
import { HistorialAsignacion, Usuario, Equipo, Licencia } from '../../types';
import { reportService } from '../../services/reportService';
import { Eye, User, Laptop, Key, Download, Search, FileText, Printer } from 'lucide-react';
import { Modal } from '../common/Modal';
import { downloadCSV } from '../../utils/csvExporter';
import { openPrintPreview } from '../../utils/documentGenerator';

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
        Usuario: item.user.nombre_completo,
        Departamento: item.user.departamento_nombre,
        Tipo_Activo: 'EQUIPO',
        Descripcion: `${e.equipo_modelo}`,
        Identificador: e.equipo_codigo,
        Fecha_Asignacion: e.fecha_inicio,
        Vencimiento: 'N/A'
      }));
      
      const licRows = item.licenses.map(l => ({
        Usuario: item.user.nombre_completo,
        Departamento: item.user.departamento_nombre,
        Tipo_Activo: 'LICENCIA',
        Descripcion: l.tipo_nombre,
        Identificador: l.clave,
        Fecha_Asignacion: 'N/A', 
        Vencimiento: l.fecha_vencimiento
      }));

      return [...eqRows, ...licRows];
    });
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="p-4 bg-slate-50 border rounded-lg flex flex-col md:flex-row gap-4 items-end justify-between">
        <div className="w-full md:w-1/3">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Search className="w-3 h-3" /> Filtrar Usuario
            </label>
            <select 
                className="w-full p-2 border border-slate-300 rounded text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                value={filterUserId}
                onChange={e => setFilterUserId(e.target.value)}
            >
                <option value="">Todos los Usuarios con Activos</option>
                {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre_completo}</option>)}
            </select>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={() => downloadCSV(prepareExportData(), 'Reporte_Activos_Por_Usuario')}
                className="flex items-center gap-2 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
                <Download className="w-4 h-4" /> Excel
            </button>
            <button 
                onClick={() => openPrintPreview(prepareExportData(), 'Reporte Activos por Usuario')}
                className="flex items-center gap-2 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
                <Printer className="w-4 h-4" /> PDF
            </button>
        </div>
      </div>

      {/* Listado Agrupado */}
      <div className="space-y-8">
        {loading ? (
             <div className="p-12 text-center text-slate-500">Cargando activos...</div>
        ) : userAssetsList.length === 0 ? (
             <div className="p-12 text-center text-slate-500 border rounded-lg bg-slate-50">
                No se encontraron asignaciones para los criterios seleccionados.
             </div>
        ) : (
            userAssetsList.map(({ user, equipment, licenses }) => (
                <div key={user.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {/* User Header */}
                    <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                {user.nombres.charAt(0)}{user.apellidos.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{user.nombre_completo}</h3>
                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                    <User className="w-3 h-3" /> {user.departamento_nombre || 'Sin Departamento'} 
                                    <span className="text-slate-300">|</span> 
                                    {user.puesto_nombre || 'Sin Cargo'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="px-3 py-1 bg-white border rounded-full text-xs font-medium text-slate-600 flex items-center gap-1">
                                <Laptop className="w-3 h-3 text-blue-500" /> {equipment.length} Equipos
                            </span>
                            <span className="px-3 py-1 bg-white border rounded-full text-xs font-medium text-slate-600 flex items-center gap-1">
                                <Key className="w-3 h-3 text-purple-500" /> {licenses.length} Licencias
                            </span>
                        </div>
                    </div>

                    <div className="p-0 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Equipos Section */}
                        <div className="border rounded-lg overflow-hidden h-fit">
                            <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 font-semibold text-blue-800 text-sm flex items-center gap-2">
                                <Laptop className="w-4 h-4" /> Equipos Asignados
                            </div>
                            {equipment.length > 0 ? (
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs uppercase">Código</th>
                                            <th className="px-4 py-2 text-left text-xs uppercase">Modelo</th>
                                            <th className="px-4 py-2 text-left text-xs uppercase">Fecha</th>
                                            <th className="px-4 py-2 text-center text-xs uppercase">Doc</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {equipment.map(eq => (
                                            <tr key={eq.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium text-slate-700">{eq.equipo_codigo}</td>
                                                <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]" title={eq.equipo_modelo}>{eq.equipo_modelo}</td>
                                                <td className="px-4 py-3 text-slate-600">{eq.fecha_inicio}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {eq.archivo_pdf ? (
                                                        <button onClick={() => setFileToView(eq.archivo_pdf!)} className="text-blue-600 hover:bg-blue-50 p-1 rounded" title="Ver Documento">
                                                            <Eye className="w-4 h-4"/>
                                                        </button>
                                                    ) : (
                                                        <button className="text-slate-300 cursor-not-allowed p-1" title="Sin Documento"><FileText className="w-4 h-4"/></button>
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
                        <div className="border rounded-lg overflow-hidden h-fit">
                            <div className="bg-purple-50 px-4 py-2 border-b border-purple-100 font-semibold text-purple-800 text-sm flex items-center gap-2">
                                <Key className="w-4 h-4" /> Licencias Asignadas
                            </div>
                            {licenses.length > 0 ? (
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs uppercase">Software</th>
                                            <th className="px-4 py-2 text-left text-xs uppercase">Clave / ID</th>
                                            <th className="px-4 py-2 text-left text-xs uppercase">Vence</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {licenses.map(lic => (
                                            <tr key={lic.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium text-slate-700">{lic.tipo_nombre}</td>
                                                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{lic.clave}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${new Date(lic.fecha_vencimiento) < new Date() ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
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

      <Modal isOpen={!!fileToView} onClose={() => setFileToView(null)} title="Vista Previa de Documento">
         <div className="p-8 text-center bg-slate-50 rounded-lg">
             <div className="mb-4 text-slate-400">Simulación de Visor PDF</div>
             <div className="font-mono text-sm bg-white p-2 border rounded inline-block text-slate-600">{fileToView}</div>
         </div>
      </Modal>
    </div>
  );
};