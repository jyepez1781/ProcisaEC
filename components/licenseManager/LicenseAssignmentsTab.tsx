
import React, { useState, useEffect } from 'react';
import { Licencia, TipoLicencia, Usuario } from '../../types';
import { Filter, Users, Layers, Box, User, UserCheck, Unplug } from 'lucide-react';
import { Pagination } from '../common/Pagination';

interface LicenseAssignmentsTabProps {
  licencias: Licencia[];
  tipos: TipoLicencia[];
  usuarios: Usuario[];
  onAssign: (licencia: Licencia) => void;
  onUnassign: (licencia: Licencia) => void;
}

export const LicenseAssignmentsTab: React.FC<LicenseAssignmentsTabProps> = ({ 
  licencias, tipos, usuarios, onAssign, onUnassign 
}) => {
  // Local state for filters and grouping
  const [filterTypeId, setFilterTypeId] = useState<string>('');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [grouping, setGrouping] = useState<'NONE' | 'TYPE' | 'USER'>('TYPE');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTypeId, filterUserId, grouping]);

  // Logic
  const getFilteredLicencias = () => {
    return licencias.filter(l => {
      const matchType = filterTypeId ? l.tipo_id === Number(filterTypeId) : true;
      const matchUser = filterUserId ? l.usuario_id === Number(filterUserId) : true;
      return matchType && matchUser;
    });
  };

  const filteredLicencias = getFilteredLicencias();
  const totalPages = Math.ceil(filteredLicencias.length / ITEMS_PER_PAGE);
  const paginatedLicencias = filteredLicencias.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getGroupedLicencias = (items: Licencia[]) => {
    if (grouping === 'NONE') return { 'Todas las Licencias': items };

    return items.reduce((groups, item) => {
      let key = '';
      if (grouping === 'TYPE') key = item.tipo_nombre;
      else if (grouping === 'USER') key = item.usuario_nombre || 'Sin Asignar';

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {} as Record<string, Licencia[]>);
  };

  const groupedData = getGroupedLicencias(paginatedLicencias);

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      {/* Filters & Grouping Toolbar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-700/30 flex flex-col md:flex-row md:items-end gap-4 transition-colors border-b border-slate-200 dark:border-slate-700">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Filtrar Tipo</label>
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <select
                className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-800 dark:text-white transition-colors"
                value={filterTypeId}
                onChange={(e) => setFilterTypeId(e.target.value)}
              >
                <option value="">Todos los Tipos</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Filtrar Usuario</label>
            <div className="relative">
              <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <select
                className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-800 dark:text-white transition-colors"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
              >
                <option value="">Todos los Usuarios</option>
                {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre_completo}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-800 h-fit self-end">
          <button
            onClick={() => setGrouping('NONE')}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${grouping === 'NONE' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Layers className="w-4 h-4" /> Plano
          </button>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-600"></div>
          <button
            onClick={() => setGrouping('TYPE')}
            className={`px-4 py-2 text-xs font-medium flex items-center gap-2 ${grouping === 'TYPE' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Box className="w-4 h-4" /> Tipo
          </button>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-600"></div>
          <button
            onClick={() => setGrouping('USER')}
            className={`px-4 py-2 text-xs font-medium flex items-center gap-2 ${grouping === 'USER' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <User className="w-4 h-4" /> Usuario
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        {Object.entries(groupedData).length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">No se encontraron licencias con los filtros actuales.</div>
        )}

        {Object.entries(groupedData).map(([groupName, groupItems]) => (
          <div key={groupName} className="mb-0 last:mb-0">
            {grouping !== 'NONE' && (
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700/50 font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                {grouping === 'TYPE' ? <Box className="w-4 h-4 text-purple-600 dark:text-purple-400" /> : <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                {groupName} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">({groupItems.length})</span>
              </div>
            )}
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              {grouping === 'NONE' && (
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Licencia / Clave</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Vencimiento</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Asignado A</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Acción</th>
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {groupItems.map(lic => (
                  <tr key={lic.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-700 dark:text-slate-200">{lic.clave}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{lic.tipo_nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{lic.fecha_vencimiento}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {lic.usuario_id ? (
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{lic.usuario_nombre}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{lic.usuario_departamento}</div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Disponible</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end">
                        {lic.usuario_id ? (
                          <button
                            type="button"
                            onClick={() => onUnassign(lic)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-xs border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 px-3 py-1.5 rounded transition-colors cursor-pointer"
                          >
                            <Unplug className="w-3 h-3" /> Liberar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAssign(lic)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-xs border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded transition-colors cursor-pointer"
                          >
                            <UserCheck className="w-3 h-3" /> Asignar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {filteredLicencias.length > 0 && (
        <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredLicencias.length}
            itemsPerPage={ITEMS_PER_PAGE}
        />
      )}
    </div>
  );
};
