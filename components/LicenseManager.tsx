import React, { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { TipoLicencia, Licencia, Usuario } from '../types';
import { Key, Users, Plus, Trash2, Edit, Save, X, UserCheck, Shield, RefreshCw, Unplug, AlertCircle, AlertTriangle, PackagePlus, ChevronLeft, ChevronRight, Filter, Layers, Box, User } from 'lucide-react';
import EntityManager from './EntityManager';

const LicenseManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'ASSIGNMENTS'>('CATALOG');
  const [tipos, setTipos] = useState<TipoLicencia[]>([]);
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Grouping State
  const [filterTypeId, setFilterTypeId] = useState<string>('');
  const [filterUserId, setFilterUserId] = useState<string>('');
  // Set default grouping to TYPE
  const [grouping, setGrouping] = useState<'NONE' | 'TYPE' | 'USER'>('TYPE');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Stock Modal (Existing)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockForm, setStockForm] = useState({ tipoId: 0, cantidad: 1, fechaVencimiento: '' });

  // Create Type Modal (New)
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);
  const [createTypeForm, setCreateTypeForm] = useState({
    nombre: '',
    proveedor: '',
    descripcion: '',
    stockInicial: 0,
    fechaVencimiento: ''
  });

  // Assign Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<Licencia | null>(null);
  const [assignUserId, setAssignUserId] = useState<number | string>('');
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // Unassign Modal
  const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);
  const [licenseToUnassign, setLicenseToUnassign] = useState<Licencia | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTypeId, filterUserId, grouping]);

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
        const [t, l, u] = await Promise.all([
        api.getTipoLicencias(),
        api.getLicencias(),
        api.getUsuarios()
        ]);
        setTipos(t);
        setLicencias(l);
        setUsuarios(u.filter(user => user.activo)); // Only active users can receive licenses
    } catch (e) {
        console.error("Error loading license data", e);
    } finally {
        setLoading(false);
    }
  };

  // -- Logic for Catalog Tab --
  
  const handleOpenCreateType = () => {
      setCreateTypeForm({
          nombre: '',
          proveedor: '',
          descripcion: '',
          stockInicial: 0,
          fechaVencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
      });
      setIsCreateTypeModalOpen(true);
  };

  const submitCreateType = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          // 1. Create the Type
          const newType = await api.createTipoLicencia({
              nombre: createTypeForm.nombre,
              proveedor: createTypeForm.proveedor,
              descripcion: createTypeForm.descripcion
          });

          // 2. Add Initial Stock if requested
          if (createTypeForm.stockInicial > 0) {
             await api.agregarStockLicencias(
                 newType.id, 
                 createTypeForm.stockInicial, 
                 createTypeForm.fechaVencimiento
             );
          }

          setIsCreateTypeModalOpen(false);
          loadData(false);
          alert('Tipo de licencia y stock inicial creados correctamente');
      } catch (error: any) {
          alert('Error: ' + error.message);
      }
  };
  
  const handleAddStock = (tipoId: number) => {
    setStockForm({ 
        tipoId, 
        cantidad: 1, 
        fechaVencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] 
    });
    setIsStockModalOpen(true);
  };

  const submitStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.agregarStockLicencias(stockForm.tipoId, stockForm.cantidad, stockForm.fechaVencimiento);
        setIsStockModalOpen(false);
        loadData(false); // Silent reload
        alert('Stock agregado correctamente');
    } catch (error: any) {
        alert(error.message);
    }
  };

  // -- Logic for Assignment Tab --

  const handleAssign = (licencia: Licencia) => {
    setSelectedLicense(licencia);
    setAssignUserId('');
    setAssignmentError(null);
    setIsAssignModalOpen(true);
  };

  const submitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLicense || !assignUserId) return;
    setAssignmentError(null);

    // Client-side validation: Check if user already has a license of this type
    const targetUserId = Number(assignUserId);
    const userHasType = licencias.some(l => 
        l.usuario_id === targetUserId && 
        l.tipo_id === selectedLicense.tipo_id
    );

    if (userHasType) {
        const user = usuarios.find(u => u.id === targetUserId);
        setAssignmentError(`El usuario ${user?.nombre_completo} ya tiene asignada una licencia de tipo "${selectedLicense.tipo_nombre}".`);
        return;
    }

    try {
        await api.asignarLicencia(selectedLicense.id, targetUserId);
        setIsAssignModalOpen(false);
        loadData(false); 
    } catch (error: any) {
        setAssignmentError(error.message);
    }
  };

  const handleOpenUnassignModal = (licencia: Licencia) => {
    setLicenseToUnassign(licencia);
    setIsUnassignModalOpen(true);
  };

  const confirmUnassign = async () => {
    if (!licenseToUnassign) return;
    try {
        await api.liberarLicencia(licenseToUnassign.id);
        setIsUnassignModalOpen(false);
        setLicenseToUnassign(null);
        await loadData(false); 
    } catch (error: any) {
        console.error(error);
        alert('Error al liberar licencia: ' + error.message);
    }
  };

  // -- Helpers --
  const getCounts = (tipoId: number) => {
    const total = licencias.filter(l => l.tipo_id === tipoId).length;
    const available = licencias.filter(l => l.tipo_id === tipoId && !l.usuario_id).length;
    return { total, available };
  };

  // -- Filtering and Grouping Logic --
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Key className="w-6 h-6 text-purple-600" /> Gestión de Licencias
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'CATALOG' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Shield className="w-4 h-4" /> Catálogo & Stock
        </button>
        <button
          onClick={() => setActiveTab('ASSIGNMENTS')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'ASSIGNMENTS' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Asignaciones
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {loading ? <div className="text-center py-8 text-slate-500">Cargando datos...</div> : (
            <>
                {/* TAB 1: CATALOG & TYPES */}
                {activeTab === 'CATALOG' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {tipos.map(tipo => {
                                const counts = getCounts(tipo.id);
                                return (
                                    <div key={tipo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-800">{tipo.nombre}</h3>
                                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{tipo.proveedor}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-4 min-h-[40px]">{tipo.descripcion}</p>
                                        
                                        <div className="flex justify-between items-end border-t pt-3">
                                            <div className="text-sm">
                                                <div className="text-slate-500">Disponibles: <span className="font-bold text-green-600">{counts.available}</span></div>
                                                <div className="text-slate-500">Total: <span className="font-semibold">{counts.total}</span></div>
                                            </div>
                                            <button 
                                                onClick={() => handleAddStock(tipo.id)}
                                                className="text-sm bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-900 flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Stock
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                             <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-slate-400 hover:border-purple-300 hover:text-purple-600 cursor-pointer transition-colors min-h-[150px]"
                                onClick={handleOpenCreateType}
                             >
                                <Plus className="w-8 h-8 mb-2" />
                                <span>Nuevo Tipo de Licencia</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: ASSIGNMENTS */}
                {activeTab === 'ASSIGNMENTS' && (
                     <div className="flex flex-col">
                        
                        {/* Filters & Grouping Toolbar */}
                        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-end gap-4">
                             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Filtrar Tipo</label>
                                    <div className="relative">
                                        <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <select 
                                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                            value={filterTypeId}
                                            onChange={(e) => setFilterTypeId(e.target.value)}
                                        >
                                            <option value="">Todos los Tipos</option>
                                            {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Filtrar Usuario</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <select 
                                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                            value={filterUserId}
                                            onChange={(e) => setFilterUserId(e.target.value)}
                                        >
                                            <option value="">Todos los Usuarios</option>
                                            {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre_completo}</option>)}
                                        </select>
                                    </div>
                                </div>
                             </div>

                             <div className="flex items-center border rounded-lg overflow-hidden bg-white h-fit self-end">
                                <button 
                                    onClick={() => setGrouping('NONE')}
                                    className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${grouping === 'NONE' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Layers className="w-4 h-4" /> Plano
                                </button>
                                <div className="w-px h-8 bg-slate-200"></div>
                                <button 
                                    onClick={() => setGrouping('TYPE')}
                                    className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${grouping === 'TYPE' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Box className="w-4 h-4" /> Tipo
                                </button>
                                <div className="w-px h-8 bg-slate-200"></div>
                                <button 
                                    onClick={() => setGrouping('USER')}
                                    className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${grouping === 'USER' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <User className="w-4 h-4" /> Usuario
                                </button>
                             </div>
                        </div>

                        <div className="overflow-x-auto">
                             {Object.entries(groupedData).length === 0 && (
                                 <div className="p-8 text-center text-slate-500">No se encontraron licencias con los filtros actuales.</div>
                             )}

                             {Object.entries(groupedData).map(([groupName, groupItems]) => (
                                <div key={groupName} className="mb-6 last:mb-0">
                                    {grouping !== 'NONE' && (
                                        <div className="px-4 py-2 bg-slate-100 font-semibold text-slate-700 border-b border-slate-200 flex items-center gap-2">
                                            {grouping === 'TYPE' ? <Box className="w-4 h-4 text-purple-600" /> : <User className="w-4 h-4 text-purple-600" />}
                                            {groupName} <span className="text-xs font-normal text-slate-500 ml-1">({groupItems.length})</span>
                                        </div>
                                    )}
                                    <table className="min-w-full divide-y divide-slate-200">
                                        {grouping === 'NONE' && (
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Licencia / Clave</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Vencimiento</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Asignado A</th>
                                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Acción</th>
                                                </tr>
                                            </thead>
                                        )}
                                        <tbody className="divide-y divide-slate-200 bg-white">
                                            {groupItems.map(lic => (
                                                <tr key={lic.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-700">{lic.clave}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lic.tipo_nombre}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lic.fecha_vencimiento}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {lic.usuario_id ? (
                                                            <div>
                                                                <div className="font-medium text-slate-900">{lic.usuario_nombre}</div>
                                                                <div className="text-xs text-slate-500">{lic.usuario_departamento}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Disponible</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                        <div className="flex justify-end">
                                                        {lic.usuario_id ? (
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleOpenUnassignModal(lic)} 
                                                                className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium text-xs border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors cursor-pointer"
                                                            >
                                                                <Unplug className="w-3 h-3" /> Liberar
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleAssign(lic)} 
                                                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors cursor-pointer"
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

                        {/* Pagination Controls */}
                        {filteredLicencias.length > 0 && (
                          <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                            <div className="text-sm text-slate-500">
                              Mostrando <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> a <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredLicencias.length)}</span> de <span className="font-medium">{filteredLicencias.length}</span> licencias
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              
                              <div className="hidden sm:flex gap-1">
                                {Array.from({ length: totalPages }).map((_, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                      currentPage === idx + 1 
                                        ? 'bg-purple-600 text-white' 
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    {idx + 1}
                                  </button>
                                ))}
                              </div>

                              <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                     </div>
                )}
            </>
        )}
      </div>

      {/* Create Type Modal */}
      {isCreateTypeModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsCreateTypeModalOpen(false)}>
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4 border-b pb-3">
                      <h3 className="text-lg font-bold text-slate-800">Nuevo Tipo de Licencia</h3>
                      <button onClick={() => setIsCreateTypeModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={submitCreateType} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700">Nombre</label>
                          <input required type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" 
                              value={createTypeForm.nombre} onChange={e => setCreateTypeForm({...createTypeForm, nombre: e.target.value})} placeholder="Ej. Microsoft 365 Business" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700">Proveedor</label>
                          <input required type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" 
                              value={createTypeForm.proveedor} onChange={e => setCreateTypeForm({...createTypeForm, proveedor: e.target.value})} placeholder="Ej. Microsoft" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700">Descripción</label>
                          <textarea className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" rows={2}
                              value={createTypeForm.descripcion} onChange={e => setCreateTypeForm({...createTypeForm, descripcion: e.target.value})} />
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2 mb-3">
                              <PackagePlus className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-semibold text-slate-700">Stock Inicial (Opcional)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">Cantidad</label>
                                  <input type="number" min="0" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" 
                                      value={createTypeForm.stockInicial} onChange={e => setCreateTypeForm({...createTypeForm, stockInicial: Number(e.target.value)})} />
                              </div>
                              <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">Vencimiento</label>
                                  <input type="date" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" 
                                      disabled={createTypeForm.stockInicial <= 0}
                                      required={createTypeForm.stockInicial > 0}
                                      value={createTypeForm.fechaVencimiento} onChange={e => setCreateTypeForm({...createTypeForm, fechaVencimiento: e.target.value})} />
                              </div>
                          </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                          <button type="button" onClick={() => setIsCreateTypeModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
                          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700">Crear</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Add Stock Modal */}
      {isStockModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsStockModalOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Agregar Stock</h3>
                <form onSubmit={submitStock} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Cantidad</label>
                        <input required type="number" min="1" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" value={stockForm.cantidad} onChange={e => setStockForm({...stockForm, cantidad: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Fecha Vencimiento</label>
                        <input required type="date" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" value={stockForm.fechaVencimiento} onChange={e => setStockForm({...stockForm, fechaVencimiento: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsStockModalOpen(false)} className="px-4 py-2 text-slate-600">Cancelar</button>
                        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg">Agregar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsAssignModalOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-lg font-bold text-slate-800">Asignar Licencia</h3>
                    <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="mb-6 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-sm font-medium text-purple-800">{selectedLicense?.tipo_nombre}</p>
                    <p className="text-xs text-purple-600 font-mono mt-1">ID: {selectedLicense?.clave}</p>
                </div>

                <form onSubmit={submitAssignment} className="space-y-4">
                    {assignmentError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span className="text-sm">{assignmentError}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Usuario Destino</label>
                        <select 
                            required 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white" 
                            value={assignUserId} 
                            onChange={e => {
                                setAssignUserId(e.target.value);
                                setAssignmentError(null); 
                            }}
                        >
                            <option value="">Seleccionar Usuario...</option>
                            {usuarios.map(u => (
                                <option key={u.id} value={u.id}>{u.nombre_completo} - {u.departamento_nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                        <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">Asignar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Unassign Confirmation Modal */}
      {isUnassignModalOpen && licenseToUnassign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsUnassignModalOpen(false)}>
             <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-red-100 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Liberar Licencia</h3>
                        <p className="text-slate-600 text-sm mt-1">
                            ¿Estás seguro de que deseas liberar esta licencia asignada a <span className="font-semibold text-slate-800">{licenseToUnassign.usuario_nombre}</span>?
                        </p>
                        <p className="text-slate-500 text-xs mt-2">
                            El usuario perderá el acceso asociado a esta licencia de forma inmediata.
                        </p>
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button 
                        onClick={() => setIsUnassignModalOpen(false)} 
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={confirmUnassign} 
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Unplug className="w-4 h-4" /> Confirmar Liberación
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default LicenseManager;