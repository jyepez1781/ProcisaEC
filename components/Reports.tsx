
import React, { useEffect, useState } from 'react';
import { api } from '../services/mockApi';
import { Equipo, HistorialMovimiento, TipoEquipo, HistorialAsignacion, Usuario, RegistroMantenimiento } from '../types';
import { Download, RefreshCw, History, FileText, CalendarRange, Wrench, Filter, Layers, User, Laptop } from 'lucide-react';

type ReportTab = 'REPLACEMENT' | 'HISTORY' | 'ASSIGNMENTS' | 'MAINTENANCE';
type GroupingMode = 'NONE' | 'USER' | 'EQUIPMENT';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('REPLACEMENT');
  
  // Data state
  const [candidates, setCandidates] = useState<Equipo[]>([]);
  const [historial, setHistorial] = useState<HistorialMovimiento[]>([]);
  const [asignaciones, setAsignaciones] = useState<HistorialAsignacion[]>([]);
  const [mantenimientos, setMantenimientos] = useState<RegistroMantenimiento[]>([]);
  
  // Catalogs for Filters
  const [tipos, setTipos] = useState<TipoEquipo[]>([]);
  const [allUsuarios, setAllUsuarios] = useState<Usuario[]>([]);
  const [allEquipos, setAllEquipos] = useState<Equipo[]>([]);

  // Filter States
  const [selectedTipoId, setSelectedTipoId] = useState<number | string>('');
  
  // Assignment Report Specific States
  const [assignFilterUser, setAssignFilterUser] = useState<string>('');
  const [assignFilterEquipo, setAssignFilterEquipo] = useState<string>('');
  const [assignGrouping, setAssignGrouping] = useState<GroupingMode>('NONE');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      const [candData, tiposData, userData, equipData] = await Promise.all([
        api.getReplacementCandidates(),
        api.getTiposEquipo(),
        api.getUsuarios(),
        api.getEquipos()
      ]);
      setCandidates(candData);
      setTipos(tiposData);
      setAllUsuarios(userData);
      setAllEquipos(equipData);
      setLoading(false);
    };
    loadInitial();
  }, []);

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      fetchHistorial();
    } else if (activeTab === 'ASSIGNMENTS') {
      fetchAsignaciones();
    } else if (activeTab === 'MAINTENANCE') {
      fetchMantenimientos();
    }
  }, [activeTab, selectedTipoId]);

  const fetchHistorial = async () => {
    setLoading(true);
    const data = await api.getHistorial(selectedTipoId ? Number(selectedTipoId) : undefined);
    setHistorial(data);
    setLoading(false);
  };

  const fetchAsignaciones = async () => {
    setLoading(true);
    const data = await api.getHistorialAsignaciones();
    setAsignaciones(data);
    setLoading(false);
  }

  const fetchMantenimientos = async () => {
    setLoading(true);
    const data = await api.getHistorialMantenimiento(selectedTipoId ? Number(selectedTipoId) : undefined);
    setMantenimientos(data);
    setLoading(false);
  }

  const calculateAge = (dateStr: string) => {
    const years = new Date().getFullYear() - new Date(dateStr).getFullYear();
    return years;
  };

  const calculateDays = (start: string, end: string | null) => {
    const d1 = new Date(start);
    const d2 = end ? new Date(end) : new Date();
    const diff = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  // --- Logic for Assignments Filtering & Grouping ---
  
  const getFilteredAssignments = () => {
    return asignaciones.filter(item => {
      const matchesUser = assignFilterUser ? item.usuario_nombre === assignFilterUser : true;
      const matchesEquip = assignFilterEquipo ? item.equipo_codigo === assignFilterEquipo : true;
      return matchesUser && matchesEquip;
    });
  };

  const getGroupedAssignments = () => {
    const filtered = getFilteredAssignments();
    if (assignGrouping === 'NONE') return { 'Todas las Asignaciones': filtered };

    return filtered.reduce((groups, item) => {
      const key = assignGrouping === 'USER' ? item.usuario_nombre : `${item.equipo_codigo} - ${item.equipo_modelo}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, HistorialAsignacion[]>);
  };

  const groupedData = getGroupedAssignments();


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Reportes del Sistema</h2>
        <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('REPLACEMENT')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'REPLACEMENT' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Candidatos a Reemplazo
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'HISTORY' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          Historial de Movimientos
        </button>
        <button
          onClick={() => setActiveTab('ASSIGNMENTS')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'ASSIGNMENTS' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CalendarRange className="w-4 h-4" />
          Historial de Asignaciones
        </button>
        <button
          onClick={() => setActiveTab('MAINTENANCE')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'MAINTENANCE' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Historial de Mantenimiento
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        
        {/* -- Tab: Replacement Candidates -- */}
        {activeTab === 'REPLACEMENT' && (
          <div className="p-0">
             <div className="p-4 bg-blue-50 border-b border-blue-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <RefreshCw className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Este reporte muestra el 20% de los equipos con mayor antigüedad (≥ 4 años) sugeridos para reemplazo inmediato.
                    </p>
                  </div>
                </div>
              </div>
              
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Activo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Modelo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha Compra</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Antigüedad</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center">Cargando...</td></tr>
                  ) : candidates.map((equipo) => (
                    <tr key={equipo.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{equipo.codigo_activo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{equipo.marca} {equipo.modelo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{equipo.fecha_compra}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                          {calculateAge(equipo.fecha_compra)} Años
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{equipo.observaciones || '-'}</td>
                    </tr>
                  ))}
                  {!loading && candidates.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No hay candidatos críticos.</td></tr>
                  )}
                </tbody>
              </table>
          </div>
        )}

        {/* -- Tab: History by Type -- */}
        {activeTab === 'HISTORY' && (
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center gap-4 bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Filtrar por Tipo de Equipo:</span>
              <select 
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                value={selectedTipoId}
                onChange={(e) => setSelectedTipoId(e.target.value)}
              >
                <option value="">Todos los Tipos</option>
                {tipos.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>

            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Equipo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acción</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Detalle</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center">Cargando historial...</td></tr>
                  ) : historial.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.equipo_codigo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold 
                        ${item.tipo_accion === 'CREACION' ? 'bg-green-100 text-green-800' : ''}
                        ${item.tipo_accion === 'ASIGNACION' ? 'bg-blue-100 text-blue-800' : ''}
                        ${item.tipo_accion === 'BAJA' ? 'bg-red-100 text-red-800' : ''}
                        ${item.tipo_accion === 'RECEPCION' ? 'bg-purple-100 text-purple-800' : ''}
                      `}>
                        {item.tipo_accion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.usuario_responsable}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.detalle}</td>
                  </tr>
                ))}
                {!loading && historial.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No hay registros de historial.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* -- Tab: Assignments History -- */}
        {activeTab === 'ASSIGNMENTS' && (
          <div>
            {/* Filters and Grouping Controls */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Filtrar Usuario</label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <select 
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={assignFilterUser}
                      onChange={(e) => setAssignFilterUser(e.target.value)}
                    >
                      <option value="">Todos los Usuarios</option>
                      {allUsuarios.map(u => (
                        <option key={u.id} value={u.nombre_completo}>{u.nombre_completo}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Filtrar Equipo</label>
                   <div className="relative">
                    <Laptop className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <select 
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={assignFilterEquipo}
                      onChange={(e) => setAssignFilterEquipo(e.target.value)}
                    >
                      <option value="">Todos los Equipos</option>
                      {allEquipos.map(e => (
                        <option key={e.id} value={e.codigo_activo}>{e.codigo_activo} - {e.modelo}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center border rounded-lg overflow-hidden bg-white">
                <button 
                  onClick={() => setAssignGrouping('NONE')}
                  className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${assignGrouping === 'NONE' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Layers className="w-4 h-4" /> Plano
                </button>
                <div className="w-px h-8 bg-slate-200"></div>
                <button 
                   onClick={() => setAssignGrouping('USER')}
                   className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${assignGrouping === 'USER' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <User className="w-4 h-4" /> Agrupar Usuario
                </button>
                <div className="w-px h-8 bg-slate-200"></div>
                <button 
                   onClick={() => setAssignGrouping('EQUIPMENT')}
                   className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${assignGrouping === 'EQUIPMENT' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Laptop className="w-4 h-4" /> Agrupar Equipo
                </button>
              </div>
            </div>

            {/* Grouped Content Rendering */}
            {loading ? (
               <div className="p-12 text-center text-slate-500">Cargando asignaciones...</div>
            ) : (
               <div>
                 {Object.entries(groupedData).length === 0 && (
                    <div className="p-12 text-center text-slate-500">No se encontraron registros con los filtros actuales.</div>
                 )}

                 {Object.entries(groupedData).map(([groupKey, items]) => (
                   <div key={groupKey} className="border-b border-slate-200 last:border-0">
                      {assignGrouping !== 'NONE' && (
                        <div className="px-6 py-3 bg-slate-50 font-semibold text-slate-700 border-b border-slate-100 flex items-center gap-2">
                          {assignGrouping === 'USER' ? <User className="w-4 h-4 text-blue-500" /> : <Laptop className="w-4 h-4 text-blue-500" />}
                          {groupKey} <span className="text-slate-400 font-normal text-sm">({items.length} asignaciones)</span>
                        </div>
                      )}
                      
                      <table className="min-w-full divide-y divide-slate-200">
                        {assignGrouping === 'NONE' && (
                           <thead className="bg-white">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Usuario</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Departamento</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Equipo</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Periodo</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Duración</th>
                            </tr>
                          </thead>
                        )}
                        <tbody className="bg-white divide-y divide-slate-100">
                          {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              {/* Conditionally hide columns based on grouping to avoid redundancy */}
                              {assignGrouping !== 'USER' && (
                                <>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.usuario_nombre}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.usuario_departamento}</td>
                                </>
                              )}
                              
                              {assignGrouping !== 'EQUIPMENT' && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-blue-600">{item.equipo_codigo}</span>
                                    <span className="text-xs text-slate-500">{item.equipo_modelo}</span>
                                  </div>
                                </td>
                              )}

                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                <div className="flex flex-col">
                                  <span>Desde: {item.fecha_inicio}</span>
                                  <span className="text-xs text-slate-400">Hasta: {item.fecha_fin || 'Presente'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {!item.fecha_fin ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                    Vigente ({calculateDays(item.fecha_inicio, null)} días)
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                    Finalizado ({calculateDays(item.fecha_inicio, item.fecha_fin)} días)
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                 ))}
               </div>
            )}
          </div>
        )}

        {/* -- Tab: Maintenance History -- */}
        {activeTab === 'MAINTENANCE' && (
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">Filtrar por Tipo:</span>
                <select 
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                  value={selectedTipoId}
                  onChange={(e) => setSelectedTipoId(e.target.value)}
                >
                  <option value="">Todos los Tipos</option>
                  {tipos.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-slate-500">
                Muestra registros de mantenimientos preventivos y correctivos.
              </div>
            </div>

            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Equipo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo Mantenimiento</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Costo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center">Cargando mantenimientos...</td></tr>
                  ) : mantenimientos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-blue-600">{item.equipo_codigo}</span>
                        <span className="text-xs text-slate-500">{item.equipo_modelo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold 
                        ${item.tipo_mantenimiento === 'Preventivo' ? 'bg-indigo-100 text-indigo-800' : 'bg-orange-100 text-orange-800'}
                      `}>
                        {item.tipo_mantenimiento}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{item.proveedor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatCurrency(item.costo)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={item.descripcion}>{item.descripcion}</td>
                  </tr>
                ))}
                {!loading && mantenimientos.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No hay registros de mantenimiento para este filtro.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;
