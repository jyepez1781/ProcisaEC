
import React, { useState, useEffect } from 'react';
import { HistorialAsignacion, Usuario, Equipo } from '../../types';
import { api } from '../../services/mockApi';
import { Layers, User, Laptop, Eye, Upload, FileText } from 'lucide-react';
import { calculateDays } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface AssignmentsTabProps {
  usuarios: Usuario[];
  equipos: Equipo[];
}

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ usuarios, equipos }) => {
  const [asignaciones, setAsignaciones] = useState<HistorialAsignacion[]>([]);
  const [filters, setFilters] = useState({ user: '', equipment: '' });
  const [grouping, setGrouping] = useState<'NONE' | 'USER' | 'EQUIPMENT'>('NONE');
  const [fileToView, setFileToView] = useState<string | null>(null);

  useEffect(() => {
    api.getHistorialAsignaciones().then(setAsignaciones);
  }, []);

  const filteredData = asignaciones.filter(a => {
    return (!filters.user || a.usuario_nombre === filters.user) &&
           (!filters.equipment || a.equipo_codigo === filters.equipment);
  });

  const groupedData = filteredData.reduce((acc, item) => {
    const key = grouping === 'NONE' ? 'Todas' : (grouping === 'USER' ? item.usuario_nombre : item.equipo_codigo);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, HistorialAsignacion[]>);

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="p-4 bg-slate-50 border rounded-lg flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Usuario</label>
                <select className="w-full p-2 border rounded text-sm" value={filters.user} onChange={e => setFilters({...filters, user: e.target.value})}>
                    <option value="">Todos</option>
                    {usuarios.map(u => <option key={u.id} value={u.nombre_completo}>{u.nombre_completo}</option>)}
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Equipo</label>
                <select className="w-full p-2 border rounded text-sm" value={filters.equipment} onChange={e => setFilters({...filters, equipment: e.target.value})}>
                    <option value="">Todos</option>
                    {equipos.map(e => <option key={e.id} value={e.codigo_activo}>{e.codigo_activo}</option>)}
                </select>
            </div>
        </div>
        <div className="flex border rounded overflow-hidden bg-white">
            <button onClick={() => setGrouping('NONE')} className={`px-3 py-2 text-xs ${grouping === 'NONE' ? 'bg-blue-600 text-white' : ''}`}>Plano</button>
            <button onClick={() => setGrouping('USER')} className={`px-3 py-2 text-xs ${grouping === 'USER' ? 'bg-blue-600 text-white' : ''}`}>Usuario</button>
            <button onClick={() => setGrouping('EQUIPMENT')} className={`px-3 py-2 text-xs ${grouping === 'EQUIPMENT' ? 'bg-blue-600 text-white' : ''}`}>Equipo</button>
        </div>
      </div>

      {/* List */}
      <div className="border rounded-lg overflow-hidden">
        {Object.entries(groupedData).map(([key, items]) => (
            <div key={key}>
                {grouping !== 'NONE' && <div className="bg-slate-100 p-2 font-bold text-sm border-b">{key}</div>}
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="p-3 text-left">Usuario</th>
                            <th className="p-3 text-left">Equipo</th>
                            <th className="p-3 text-left">Desde</th>
                            <th className="p-3 text-left">Hasta</th>
                            <th className="p-3 text-center">Docs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} className="border-t hover:bg-slate-50">
                                <td className="p-3">{item.usuario_nombre}</td>
                                <td className="p-3">{item.equipo_codigo}</td>
                                <td className="p-3 text-green-600">{item.fecha_inicio}</td>
                                <td className="p-3">{item.fecha_fin || <span className="text-blue-600 font-bold">Vigente</span>}</td>
                                <td className="p-3 text-center">
                                    {item.archivo_pdf ? (
                                        <button onClick={() => setFileToView(item.archivo_pdf!)} className="text-blue-600"><Eye className="w-4 h-4"/></button>
                                    ) : <span className="text-slate-300">-</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ))}
      </div>
      
      <Modal isOpen={!!fileToView} onClose={() => setFileToView(null)} title="Vista Previa">
         <div className="p-4 text-center">Simulando visor para: <b>{fileToView}</b></div>
      </Modal>
    </div>
  );
};
