
import React, { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { Usuario, Departamento, Puesto, RolUsuario } from '../types';
import { UserPlus, Edit, X, Save, ChevronLeft, ChevronRight, UserX, AlertTriangle, Search } from 'lucide-react';

interface UserManagerProps {
  currentUser: Usuario | null;
}

const UserManager: React.FC<UserManagerProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [depts, setDepts] = useState<Departamento[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filterText, setFilterText] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Edit/Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Usuario>>({});

  // Deactivate Confirmation Modal State
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<Usuario | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, d, p] = await Promise.all([
        api.getUsuarios(),
        api.getDepartamentos(),
        api.getPuestos()
      ]);
      setUsers(u);
      setDepts(d);
      setPuestos(p);
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredUsers = users.filter(user => {
    if (!filterText) return true;
    const searchText = filterText.toLowerCase();
    return (
      user.nombre_completo.toLowerCase().includes(searchText) ||
      user.nombre_usuario.toLowerCase().includes(searchText) ||
      user.correo.toLowerCase().includes(searchText) ||
      (user.numero_empleado && user.numero_empleado.toLowerCase().includes(searchText))
    );
  });

  // Pagination Logic (Applied on filtered list)
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenModal = (user?: Usuario) => {
    if (user) {
      setEditingId(user.id);
      setFormData({ ...user, password: '' }); // Don't show existing password
    } else {
      setEditingId(null);
      setFormData({
        nombres: '', apellidos: '', nombre_usuario: '', numero_empleado: '', correo: '', password: '',
        rol: RolUsuario.USUARIO, departamento_id: undefined, puesto_id: undefined, activo: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      if (editingId && !dataToSend.password) {
        delete dataToSend.password;
      }

      if (editingId) {
        await api.updateUsuario(editingId, dataToSend);
      } else {
        await api.createUsuario(dataToSend as any);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      alert('Error al guardar usuario');
    }
  };

  const handleStatusAction = async (user: Usuario) => {
    // Validation 1: Prevent self-deactivation
    if (currentUser && currentUser.id === user.id) {
      alert("No puedes desactivar tu propio usuario mientras estás conectado.");
      return;
    }

    // Validation 2: If already inactive, do nothing (button should be disabled, but double check)
    if (!user.activo) {
      return;
    }

    // Proceed to Deactivation Modal
    setUserToDeactivate(user);
    setIsDeactivateModalOpen(true);
  };

  const handleConfirmDeactivation = async () => {
    if (!userToDeactivate) return;
    
    try {
      // Close modal immediately
      setIsDeactivateModalOpen(false);
      setLoading(true);
      
      // Perform update on API
      await api.updateUsuario(userToDeactivate.id, { activo: false });
      
      // Reload data to reflect changes
      await loadData();
      setUserToDeactivate(null);
    } catch (error: any) {
      setLoading(false);
      alert('Error al desactivar: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header and Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Administración de Usuarios</h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text"
                        placeholder="Buscar usuario..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
                <button onClick={() => handleOpenModal()} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap">
                    <UserPlus className="w-4 h-4" /> Nuevo Usuario
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            {loading ? (
                <div className="p-8 text-center text-slate-500">Cargando usuarios...</div>
            ) : (
                <>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">N° Empleado / Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombre Completo</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Departamento / Puesto</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rol</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {paginatedUsers.map(u => {
                                const isSelf = currentUser?.id === u.id;
                                const isInactive = !u.activo;
                                const isDisabled = isSelf || isInactive;

                                return (
                                <tr key={u.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded w-fit mb-1">
                                                {u.numero_empleado || 'S/N'}
                                            </span>
                                            <span className="font-medium text-slate-900">{u.nombre_usuario}</span>
                                            <span className="text-xs text-slate-500">{u.correo}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">{u.nombre_completo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">{u.departamento_nombre || '-'}</div>
                                        <div className="text-xs text-slate-500">{u.puesto_nombre || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{u.rol}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {u.activo ? 
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Activo</span> : 
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Inactivo</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); handleOpenModal(u); }} 
                                            className="text-blue-600 hover:text-blue-900 mr-3" 
                                            title="Editar"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleStatusAction(u);
                                          }}
                                          disabled={isDisabled}
                                          className={`${!isDisabled ? 'text-amber-600 hover:text-amber-900 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
                                          title={isSelf ? "No puedes desactivar tu propio usuario" : (isInactive ? "Usuario ya inactivo" : "Desactivar Usuario")}
                                        >
                                          <UserX className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )})}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No se encontraron usuarios.</td>
                                </tr>
                            )}
                            {users.length > 0 && filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron resultados para "{filterText}".
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                {filteredUsers.length > 0 && (
                  <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-500">
                      Mostrando <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> a <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span> de <span className="font-medium">{filteredUsers.length}</span> usuarios
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
                                ? 'bg-blue-600 text-white' 
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
                </>
            )}
        </div>

        {/* Deactivate Confirmation Modal */}
        {isDeactivateModalOpen && userToDeactivate && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsDeactivateModalOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Inactivar Usuario</h3>
                  <p className="text-slate-600 text-sm mt-2">
                    ¿Realmente desea inactivar al usuario <span className="font-semibold text-slate-900">{userToDeactivate.nombre_usuario}</span>?
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    El usuario perderá acceso al sistema y se liberarán sus licencias asignadas. El historial se conservará.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button 
                  onClick={() => setIsDeactivateModalOpen(false)} 
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmDeactivation} 
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <UserX className="w-4 h-4" /> Sí, Inactivar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit/Create Modal Form */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Nombres</label>
                                <input required className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500" value={formData.nombres || ''} onChange={e => setFormData({...formData, nombres: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Apellidos</label>
                                <input required className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500" value={formData.apellidos || ''} onChange={e => setFormData({...formData, apellidos: e.target.value})} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <div>
                                <label className="block text-sm font-medium text-blue-800">N° de Empleado</label>
                                <input 
                                  type="text" 
                                  placeholder="Ej. EMP-001"
                                  className="w-full border border-blue-200 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
                                  value={formData.numero_empleado || ''} 
                                  onChange={e => setFormData({...formData, numero_empleado: e.target.value})} 
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-blue-800">Usuario (Login)</label>
                                <input required className="w-full border border-blue-200 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.nombre_usuario || ''} onChange={e => setFormData({...formData, nombre_usuario: e.target.value})} />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Correo</label>
                            <input required type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500" value={formData.correo || ''} onChange={e => setFormData({...formData, correo: e.target.value})} />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Contraseña</label>
                            <input 
                                type="password" 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder={editingId ? "Dejar en blanco para no cambiar" : "Contraseña inicial"}
                                value={formData.password || ''} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                required={!editingId}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Departamento</label>
                                <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.departamento_id || ''} onChange={e => setFormData({...formData, departamento_id: Number(e.target.value)})}>
                                    <option value="">Seleccionar...</option>
                                    {depts.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Puesto</label>
                                <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.puesto_id || ''} onChange={e => setFormData({...formData, puesto_id: Number(e.target.value)})}>
                                    <option value="">Seleccionar...</option>
                                    {puestos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Rol de Sistema</label>
                                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value as RolUsuario})}>
                                    <option value={RolUsuario.USUARIO}>{RolUsuario.USUARIO}</option>
                                    <option value={RolUsuario.TECNICO}>{RolUsuario.TECNICO}</option>
                                    <option value={RolUsuario.ADMIN}>{RolUsuario.ADMIN}</option>
                                </select>
                            </div>
                            <div className="pt-6">
                                <label className={`flex items-center gap-2 ${editingId === currentUser?.id ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-blue-600 rounded" 
                                        checked={formData.activo !== false} 
                                        onChange={e => setFormData({...formData, activo: e.target.checked})} 
                                        disabled={editingId === currentUser?.id}
                                    />
                                    <span className="text-sm font-medium text-slate-700">Usuario Activo</span>
                                </label>
                                {editingId === currentUser?.id && (
                                    <p className="text-xs text-amber-600 mt-1">No puedes desactivar tu propio usuario.</p>
                                )}
                            </div>
                        </div>

                         <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
                            <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                <Save className="w-4 h-4" /> Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default UserManager;
