
import React, { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { Usuario, Departamento, Puesto, RolUsuario } from '../types';
import { UserPlus, Edit, Trash2, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [depts, setDepts] = useState<Departamento[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Usuario>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [u, d, p] = await Promise.all([
      api.getUsuarios(),
      api.getDepartamentos(),
      api.getPuestos()
    ]);
    setUsers(u);
    setDepts(d);
    setPuestos(p);
    setLoading(false);
  };

  // Pagination Logic
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenModal = (user?: Usuario) => {
    if (user) {
      setEditingId(user.id);
      setFormData({ ...user, password: '' }); // Don't show existing password, empty means no change
    } else {
      setEditingId(null);
      setFormData({
        nombres: '', apellidos: '', nombre_usuario: '', correo: '', password: '',
        rol: RolUsuario.USUARIO, departamento_id: undefined, puesto_id: undefined, activo: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // If editing and password is empty, remove it so it doesn't overwrite with empty string
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

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar usuario?')) {
      await api.deleteUsuario(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Administración de Usuarios</h2>
            <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <UserPlus className="w-4 h-4" /> Nuevo Usuario
            </button>
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
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombre Completo</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Departamento / Puesto</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rol</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {paginatedUsers.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-slate-900">{u.nombre_usuario}</div>
                                        <div className="text-xs text-slate-500">{u.correo}</div>
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
                                        <button onClick={() => handleOpenModal(u)} className="text-blue-600 hover:text-blue-900 mr-3"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No se encontraron usuarios.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                {users.length > 0 && (
                  <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-500">
                      Mostrando <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> a <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, users.length)}</span> de <span className="font-medium">{users.length}</span> usuarios
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

        {/* Modal Form */}
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
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Usuario</label>
                                <input required className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500" value={formData.nombre_usuario || ''} onChange={e => setFormData({...formData, nombre_usuario: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Correo</label>
                                <input required type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500" value={formData.correo || ''} onChange={e => setFormData({...formData, correo: e.target.value})} />
                            </div>
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
                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" checked={formData.activo !== false} onChange={e => setFormData({...formData, activo: e.target.checked})} />
                                    <span className="text-sm font-medium text-slate-700">Usuario Activo</span>
                                </label>
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
