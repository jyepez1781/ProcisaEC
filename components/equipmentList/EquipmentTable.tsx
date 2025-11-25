import React, { useState } from 'react';
import { Equipo, EstadoEquipo } from '../../types';
import { MoreVertical, Edit, UserCheck, RotateCcw, Wrench, Archive, Trash2, Box, User } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { ModalAction } from '../../hooks/useEquipment';

interface EquipmentTableProps {
  groupedEquipos: Record<string, Equipo[]>;
  grouping: string;
  onAction: (action: ModalAction, equipo: Equipo) => void;
}

export const EquipmentTable: React.FC<EquipmentTableProps> = ({ groupedEquipos, grouping, onAction }) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const toggleMenu = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" onClick={() => setOpenMenuId(null)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Código / Serie</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Equipo</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Ubicación / Resp.</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {Object.keys(groupedEquipos).length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No hay registros.</td></tr>
            ) : Object.entries(groupedEquipos).map(([groupKey, items]: [string, Equipo[]]) => (
              <React.Fragment key={groupKey}>
                {grouping !== 'NONE' && (
                  <tr className="bg-slate-100">
                    <td colSpan={6} className="px-6 py-2 text-sm font-bold text-slate-700 flex items-center gap-2 border-b">
                      {grouping === 'TYPE' ? <Box className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-blue-600" />}
                      {groupKey} <span className="text-xs font-normal text-slate-500">({items.length})</span>
                    </td>
                  </tr>
                )}
                {items.map(equipo => (
                  <tr key={equipo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{equipo.codigo_activo}</span>
                        <span className="text-xs text-slate-500">{equipo.numero_serie}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-slate-900">{equipo.marca} {equipo.modelo}</span>
                        <span className="text-xs text-slate-500">{equipo.tipo_nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-sm">{formatCurrency(equipo.valor_compra)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                       {equipo.responsable_nombre ? (
                         <span className="text-blue-600 font-medium">{equipo.responsable_nombre}</span>
                       ) : (
                         <span>{equipo.ubicacion_nombre || '-'}</span>
                       )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge estado={equipo.estado} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right relative">
                       <button onClick={(e) => toggleMenu(e, equipo.id)} className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-slate-100">
                         <MoreVertical className="w-5 h-5" />
                       </button>
                       {openMenuId === equipo.id && (
                         <div className="absolute right-8 top-0 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-50 py-1">
                           <button onClick={() => onAction('EDIT', equipo)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex gap-2"><Edit className="w-4 h-4"/> Editar</button>
                           {(equipo.estado === EstadoEquipo.DISPONIBLE || equipo.estado === EstadoEquipo.PARA_BAJA) && (
                              <button onClick={() => onAction('ASSIGN', equipo)} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex gap-2"><UserCheck className="w-4 h-4"/> Asignar</button>
                           )}
                           {equipo.estado === EstadoEquipo.ACTIVO && (
                              <button onClick={() => onAction('RETURN', equipo)} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex gap-2"><RotateCcw className="w-4 h-4"/> Recepcionar</button>
                           )}
                           {['ACTIVO', 'DISPONIBLE', 'PARA_BAJA'].includes(equipo.estado) && (
                              <button onClick={() => onAction('TO_MAINTENANCE', equipo)} className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex gap-2"><Wrench className="w-4 h-4"/> Mantenimiento</button>
                           )}
                           {!['BAJA', 'PARA_BAJA'].includes(equipo.estado) && (
                              <button onClick={() => onAction('MARK_DISPOSAL', equipo)} className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex gap-2"><Archive className="w-4 h-4"/> Pre-Baja</button>
                           )}
                           {equipo.estado !== EstadoEquipo.BAJA && (
                              <button onClick={() => onAction('BAJA', equipo)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex gap-2"><Trash2 className="w-4 h-4"/> Dar Baja</button>
                           )}
                         </div>
                       )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};