
import React, { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { Equipo, EstadoEquipo, TipoEquipo, Usuario, Departamento } from '../types';
import { Search, Filter, Plus, MoreVertical, Edit, UserCheck, RotateCcw, Trash2, X, Save, Wrench, Archive, Layers, Box, User, Laptop } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { generateAssignmentDocument } from '../utils/documentGenerator';

type ModalAction = 'CREATE' | 'EDIT' | 'ASSIGN' | 'RETURN' | 'BAJA' | 'TO_MAINTENANCE' | 'MARK_DISPOSAL' | null;
type GroupingMode = 'NONE' | 'TYPE' | 'USER';

const EquipmentList: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [filteredEquipos, setFilteredEquipos] = useState<Equipo[]>([]);
  
  // Filter States
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  
  // Grouping State
  const [grouping, setGrouping] = useState<GroupingMode>('NONE');
  
  // Catalogs for forms
  const [tipos, setTipos] = useState<TipoEquipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [bodegas, setBodegas] = useState<Departamento[]>([]);

  // Modal State
  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // Menu Dropdown State
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [eqData, tipoData, userData, deptData] = await Promise.all([
      api.getEquipos(),
      api.getTiposEquipo(),
      api.getUsuarios(),
      api.getDepartamentos()
    ]);
    setEquipos(eqData);
    setTipos(tipoData);
    setUsuarios(userData);
    setBodegas(deptData.filter(d => d.es_bodega));
    setFilteredEquipos(eqData);
  };

  useEffect(() => {
    let res = equipos;
    
    // Text Filter
    if (filterText) {
      res = res.filter(e => 
        e.codigo_activo.toLowerCase().includes(filterText.toLowerCase()) ||
        e.modelo.toLowerCase().includes(filterText.toLowerCase()) ||
        e.numero_serie.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    // Status Filter
    if (statusFilter !== 'ALL') {
      res = res.filter(e => e.estado === statusFilter);
    }

    // Type Filter
    if (typeFilter !== 'ALL') {
      res = res.filter(e => e.tipo_equipo_id === Number(typeFilter));
    }

    // User Filter
    if (userFilter !== 'ALL') {
      res = res.filter(e => e.responsable_id === Number(userFilter));
    }

    setFilteredEquipos(res);
  }, [filterText, statusFilter, typeFilter, userFilter, equipos]);

  const getGroupedData = () => {
    if (grouping === 'NONE') {
      return { 'Todos los Equipos': filteredEquipos };
    }

    return filteredEquipos.reduce((acc, item) => {
      let key = '';
      if (grouping === 'TYPE') {
        key = item.tipo_nombre || 'Sin Tipo';
      } else if (grouping === 'USER') {
        key = item.responsable_nombre || 'Sin Asignar / En Bodega';
      }

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, Equipo[]>);
  };

  const groupedEquipos = getGroupedData();

  const getStatusColor = (estado: EstadoEquipo) => {
    switch (estado) {
      case EstadoEquipo.ACTIVO: return 'bg-green-100 text-green-800';
      case EstadoEquipo.DISPONIBLE: return 'bg-blue-100 text-blue-800';
      case EstadoEquipo.EN_MANTENIMIENTO: return 'bg-amber-100 text-amber-800';
      case EstadoEquipo.BAJA: return 'bg-red-100 text-red-800';
      case EstadoEquipo.PARA_BAJA: return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Action Handlers
  const openModal = (action: ModalAction, equipo: Equipo | null = null) => {
    if (action === 'ASSIGN' && equipo) {
      if (equipo.estado !== EstadoEquipo.DISPONIBLE && equipo.estado !== EstadoEquipo.PARA_BAJA) {
        alert("Solo se pueden asignar equipos que se encuentren en estado 'Disponible' o 'Para Baja'.");
        return;
      }
    }

    setModalAction(action);
    setSelectedEquipo(equipo);
    setOpenMenuId(null);

    if (action === 'CREATE') {
      setFormData({
        codigo_activo: '', numero_serie: '', marca: '', modelo: '', 
        tipo_equipo_id: tipos[0]?.id || '', serie_cargador: '', 
        fecha_compra: new Date().toISOString().split('T')[0], 
        valor_compra: 0, anos_garantia: 1, estado: EstadoEquipo.DISPONIBLE, observaciones: '',
        ubicacion_id: bodegas.length > 0 ? bodegas[0].id : ''
      });
    } else if (action === 'EDIT' && equipo) {
      setFormData({ ...equipo });
    } else if (action === 'ASSIGN') {
      setFormData({ usuario_id: usuarios[0]?.id || '', ubicacion: '', observaciones: '' });
    } else if (action === 'RETURN' || action === 'MARK_DISPOSAL') {
      setFormData({ observaciones: '', ubicacion_id: bodegas.length > 0 ? bodegas[0].id : '' });
    } else if (action === 'BAJA' || action === 'TO_MAINTENANCE') {
      setFormData({ observaciones: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAction(true);
    try {
      if (modalAction === 'CREATE') {
        let locationName = '';
        if (formData.ubicacion_id) {
           const bodega = bodegas.find(b => b.id === Number(formData.ubicacion_id));
           if (bodega) locationName = bodega.nombre;
        }
        await api.createEquipo({ ...formData, ubicacion_nombre: locationName });
      } else if (modalAction === 'EDIT' && selectedEquipo) {
        await api.updateEquipo(selectedEquipo.id, formData);
      } else if (modalAction === 'ASSIGN' && selectedEquipo) {
        await api.asignarEquipo(selectedEquipo.id, formData.usuario_id, formData.ubicacion, formData.observaciones);
        const assignedUser = usuarios.find(u => u.id === Number(formData.usuario_id));
        if (assignedUser) {
           generateAssignmentDocument(assignedUser, selectedEquipo);
        }
      } else if (modalAction === 'RETURN' && selectedEquipo) {
        const bodega = bodegas.find(b => b.id === Number(formData.ubicacion_id));
        const nombreBodega = bodega ? bodega.nombre : 'Bodega General';
        await api.recepcionarEquipo(selectedEquipo.id, formData.observaciones, Number(formData.ubicacion_id), nombreBodega);
      } else if (modalAction === 'MARK_DISPOSAL' && selectedEquipo) {
         const bodega = bodegas.find(b => b.id === Number(formData.ubicacion_id));
         const nombreBodega = bodega ? bodega.nombre : 'Bodega IT';
         await api.marcarParaBaja(selectedEquipo.id, formData.observaciones, Number(formData.ubicacion_id), nombreBodega);
      } else if (modalAction === 'BAJA' && selectedEquipo) {
        await api.bajaEquipo(selectedEquipo.id, formData.observaciones);
      } else if (modalAction === 'TO_MAINTENANCE' && selectedEquipo) {
        await api.enviarAMantenimiento(selectedEquipo.id, formData.observaciones);
      }
      await loadData();
      setModalAction(null);
    } catch (error: any) {
      console.error("Error processing action", error);
      alert(error.message || "Error al procesar la solicitud");
    } finally {
      setIsLoadingAction(false);
    }
  };

  return (
    <div className="space-y-6 relative" onClick={() => setOpenMenuId(null)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Inventario de Equipos</h2>
        <button 
          onClick={(e) => { e.stopPropagation(); openModal('CREATE'); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Equipo
        </button>
      </div>

      {/* Filters & Grouping */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input 
               type="text"
               placeholder="Buscar código, serie..."
               className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
               value={filterText}
               onChange={(e) => setFilterText(e.target.value)}
             />
           </div>
           
           <div className="relative">
             <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
             <select 
               className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="ALL">Estado: Todos</option>
               <option value={EstadoEquipo.ACTIVO}>{EstadoEquipo.ACTIVO}</option>
               <option value={EstadoEquipo.DISPONIBLE}>{EstadoEquipo.DISPONIBLE}</option>
               <option value={EstadoEquipo.EN_MANTENIMIENTO}>{EstadoEquipo.EN_MANTENIMIENTO}</option>
               <option value={EstadoEquipo.PARA_BAJA}>{EstadoEquipo.PARA_BAJA}</option>
               <option value={EstadoEquipo.BAJA}>{EstadoEquipo.BAJA}</option>
             </select>
           </div>

           <div className="relative">
             <Laptop className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
             <select 
               className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm"
               value={typeFilter}
               onChange={(e) => setTypeFilter(e.target.value)}
             >
               <option value="ALL">Tipo: Todos</option>
               {tipos.map(t => (
                 <option key={t.id} value={t.id}>{t.nombre}</option>
               ))}
             </select>
           </div>

           <div className="relative">
             <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
             <select 
               className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm"
               value={userFilter}
               onChange={(e) => setUserFilter(e.target.value)}
             >
               <option value="ALL">Usuario: Todos</option>
               {usuarios.map(u => (
                 <option key={u.id} value={u.id}>{u.nombre_completo}</option>
               ))}
             </select>
           </div>
        </div>

        {/* Grouping Row */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-500 mr-3 uppercase tracking-wide">Agrupar por:</span>
            <div className="flex items-center border rounded-lg overflow-hidden bg-white">
                <button 
                  onClick={() => setGrouping('NONE')}
                  className={`px-3 py-1.5 text-xs font-medium flex items-center gap-2 ${grouping === 'NONE' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Layers className="w-3 h-3" /> Plano
                </button>
                <div className="w-px h-6 bg-slate-200"></div>
                <button 
                   onClick={() => setGrouping('TYPE')}
                   className={`px-3 py-1.5 text-xs font-medium flex items-center gap-2 ${grouping === 'TYPE' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Box className="w-3 h-3" /> Tipo
                </button>
                <div className="w-px h-6 bg-slate-200"></div>
                <button 
                   onClick={() => setGrouping('USER')}
                   className={`px-3 py-1.5 text-xs font-medium flex items-center gap-2 ${grouping === 'USER' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <User className="w-3 h-3" /> Usuario
                </button>
              </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Código / Serie</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Equipo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor Compra</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ubicación / Responsable</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {Object.entries(groupedEquipos).length === 0 ? (
                 <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron equipos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                Object.entries(groupedEquipos).map(([groupKey, items]) => {
                  const equipmentList = items as Equipo[];
                  return (
                  <React.Fragment key={groupKey}>
                    {grouping !== 'NONE' && (
                      <tr className="bg-slate-100">
                        <td colSpan={6} className="px-6 py-2 text-sm font-bold text-slate-700 flex items-center gap-2 border-b border-slate-200">
                           {grouping === 'TYPE' ? <Box className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-blue-600" />}
                           {groupKey} <span className="text-xs font-normal text-slate-500 ml-2">({equipmentList.length} items)</span>
                        </td>
                      </tr>
                    )}
                    {equipmentList.map((equipo) => (
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 font-medium">{formatCurrency(equipo.valor_compra)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          <div className="flex flex-col">
                            <span>{equipo.ubicacion_nombre || '-'}</span>
                            {equipo.responsable_nombre && <span className="text-xs text-blue-600 font-medium">{equipo.responsable_nombre}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(equipo.estado)}`}>
                            {equipo.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === equipo.id ? null : equipo.id); }}
                            className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-slate-100"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {openMenuId === equipo.id && (
                            <div className="absolute right-8 top-0 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                              <button onClick={() => openModal('EDIT', equipo)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Edit className="w-4 h-4" /> Editar
                              </button>
                              {(equipo.estado === EstadoEquipo.DISPONIBLE || equipo.estado === EstadoEquipo.PARA_BAJA) && (
                                <button onClick={() => openModal('ASSIGN', equipo)} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2">
                                  <UserCheck className="w-4 h-4" /> Asignar
                                </button>
                              )}
                              {equipo.estado === EstadoEquipo.ACTIVO && (
                                <button onClick={() => openModal('RETURN', equipo)} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2">
                                  <RotateCcw className="w-4 h-4" /> Recepcionar
                                </button>
                              )}
                              {(equipo.estado === EstadoEquipo.ACTIVO || equipo.estado === EstadoEquipo.DISPONIBLE || equipo.estado === EstadoEquipo.PARA_BAJA) && (
                                <button onClick={() => openModal('TO_MAINTENANCE', equipo)} className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                                  <Wrench className="w-4 h-4" /> Mantenimiento
                                </button>
                              )}
                              {(equipo.estado !== EstadoEquipo.BAJA && equipo.estado !== EstadoEquipo.PARA_BAJA) && (
                                <button onClick={() => openModal('MARK_DISPOSAL', equipo)} className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2">
                                  <Archive className="w-4 h-4" /> Enviar a Pre-Baja
                                </button>
                              )}
                              {equipo.estado !== EstadoEquipo.BAJA && (
                                <button onClick={() => openModal('BAJA', equipo)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                  <Trash2 className="w-4 h-4" /> Dar de Baja
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
           <p className="text-xs text-slate-500 text-center sm:text-right">
             Total registros: <span className="font-medium text-slate-700">{filteredEquipos.length}</span>
           </p>
        </div>
      </div>

      {/* Modal (Forms) */}
      {modalAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalAction(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-slate-800">
                {modalAction === 'CREATE' && 'Nuevo Equipo'}
                {modalAction === 'EDIT' && 'Editar Equipo'}
                {modalAction === 'ASSIGN' && 'Asignar Equipo'}
                {modalAction === 'RETURN' && 'Recepcionar Equipo'}
                {modalAction === 'BAJA' && 'Dar de Baja Equipo'}
                {modalAction === 'TO_MAINTENANCE' && 'Enviar a Mantenimiento'}
                {modalAction === 'MARK_DISPOSAL' && 'Enviar a Pre-Baja (Bodega)'}
              </h3>
              <button onClick={() => setModalAction(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* CREATE / EDIT Fields */}
              {(modalAction === 'CREATE' || modalAction === 'EDIT') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Código Activo</label>
                      <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.codigo_activo || ''} onChange={e => setFormData({...formData, codigo_activo: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Serie</label>
                      <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.numero_serie || ''} onChange={e => setFormData({...formData, numero_serie: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                      <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.marca || ''} onChange={e => setFormData({...formData, marca: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
                      <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.modelo || ''} onChange={e => setFormData({...formData, modelo: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Equipo</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.tipo_equipo_id || ''} onChange={e => setFormData({...formData, tipo_equipo_id: Number(e.target.value)})}>
                        {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                    </div>
                    {modalAction === 'CREATE' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación Inicial (Bodega)</label>
                            <select 
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.ubicacion_id || ''} 
                                onChange={e => setFormData({...formData, ubicacion_id: Number(e.target.value)})}
                            >
                                {bodegas.length === 0 && <option value="">Sin bodegas definidas</option>}
                                {bodegas.map(b => (
                                    <option key={b.id} value={b.id}>{b.nombre}</option>
                                ))}
                            </select>
                        </div>
                     )}
                  </div>

                  {(() => {
                    const selectedType = tipos.find(t => t.id === Number(formData.tipo_equipo_id));
                    if (selectedType?.nombre.toLowerCase().includes('laptop')) {
                      return (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Serie del Cargador</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={formData.serie_cargador || ''} 
                            onChange={e => setFormData({...formData, serie_cargador: e.target.value})} 
                            placeholder="S/N Cargador"
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Compra</label>
                      <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.fecha_compra || ''} onChange={e => setFormData({...formData, fecha_compra: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Años Garantía</label>
                      <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.anos_garantia || ''} onChange={e => setFormData({...formData, anos_garantia: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor de Compra</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400">$</span>
                      <input type="number" step="0.01" className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.valor_compra || 0} onChange={e => setFormData({...formData, valor_compra: Number(e.target.value)})} />
                    </div>
                  </div>
                </>
              )}

              {/* ASSIGN Fields */}
              {modalAction === 'ASSIGN' && (
                <>
                  <p className="text-sm text-slate-500 mb-4">Asignando equipo <b>{selectedEquipo?.codigo_activo}</b></p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Usuario Responsable</label>
                    <select required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.usuario_id || ''} onChange={e => setFormData({...formData,usuario_id: Number(e.target.value)})}>
                      <option value="">Seleccione un usuario...</option>
                      {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre_completo} ({u.departamento_nombre})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación Física</label>
                    <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Oficina 305, Edificio A"
                      value={formData.ubicacion || ''} onChange={e => setFormData({...formData, ubicacion: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                    <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3}
                      value={formData.observaciones || ''} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
                  </div>
                </>
              )}

              {/* RETURN Fields */}
              {modalAction === 'RETURN' && (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    Devolviendo equipo <b>{selectedEquipo?.codigo_activo}</b> a Bodega.
                  </p>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación de Recepción (Bodega)</label>
                      <select 
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          value={formData.ubicacion_id || ''} 
                          onChange={e => setFormData({...formData, ubicacion_id: Number(e.target.value)})}
                      >
                          {bodegas.length === 0 && <option value="">Sin bodegas definidas</option>}
                          {bodegas.map(b => (
                              <option key={b.id} value={b.id}>{b.nombre}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Observaciones de reingreso
                    </label>
                    <textarea required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3}
                      value={formData.observaciones || ''} onChange={e => setFormData({...formData, observaciones: e.target.value})} 
                      placeholder='Estado físico, accesorios devueltos...' />
                  </div>
                </>
              )}

              {/* MARK FOR DISPOSAL Fields */}
              {modalAction === 'MARK_DISPOSAL' && (
                <>
                  <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg mb-4">
                     <p className="text-sm text-orange-800">
                        El equipo <b>{selectedEquipo?.codigo_activo}</b> pasará a estado <b>Pre-Baja</b>. 
                        Debe seleccionar la bodega donde permanecerá hasta su disposición final.
                     </p>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación (Bodega IT)</label>
                      <select 
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          value={formData.ubicacion_id || ''} 
                          onChange={e => setFormData({...formData, ubicacion_id: Number(e.target.value)})}
                      >
                          {bodegas.length === 0 && <option value="">Sin bodegas definidas</option>}
                          {bodegas.map(b => (
                              <option key={b.id} value={b.id}>{b.nombre}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Observaciones / Motivo
                    </label>
                    <textarea required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3}
                      value={formData.observaciones || ''} onChange={e => setFormData({...formData, observaciones: e.target.value})} 
                      placeholder='Describa el motivo (obsoleto, dañado irrep.) y ubicación en estantería...' />
                  </div>
                </>
              )}

              {/* BAJA / TO_MAINTENANCE Fields */}
              {(modalAction === 'BAJA' || modalAction === 'TO_MAINTENANCE') && (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    {modalAction === 'BAJA' && `Dando de baja definitiva al equipo ${selectedEquipo?.codigo_activo}.`}
                    {modalAction === 'TO_MAINTENANCE' && `Enviando equipo ${selectedEquipo?.codigo_activo} a mantenimiento.`}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {modalAction === 'BAJA' && 'Motivo de Baja'}
                      {modalAction === 'TO_MAINTENANCE' && 'Falla reportada / Motivo'}
                    </label>
                    <textarea required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3}
                      value={formData.observaciones || ''} onChange={e => setFormData({...formData, observaciones: e.target.value})} 
                      placeholder={
                        modalAction === 'BAJA' ? 'Razon de baja, destino final...' :
                        'Describa el problema técnico...'
                      } />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setModalAction(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoadingAction} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {isLoadingAction ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
