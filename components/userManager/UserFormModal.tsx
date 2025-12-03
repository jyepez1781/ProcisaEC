
import React from 'react';
import { Save } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Usuario, Departamento, Puesto, RolUsuario } from '../../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: Partial<Usuario>;
  setFormData: (data: Partial<Usuario>) => void;
  departments: Departamento[];
  puestos: Puesto[];
  currentUser: Usuario | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ 
  isOpen, onClose, isEditing, formData, setFormData, 
  departments, puestos, currentUser, onSubmit 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'} maxWidth="max-w-2xl">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombres</label>
            <input required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" value={formData.nombres || ''} onChange={e => setFormData({...formData, nombres: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Apellidos</label>
            <input required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" value={formData.apellidos || ''} onChange={e => setFormData({...formData, apellidos: e.target.value})} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
          <div>
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-300">N° de Empleado</label>
            <input 
              type="text" 
              placeholder="Ej. EMP-001"
              className="w-full border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" 
              value={formData.numero_empleado || ''} 
              onChange={e => setFormData({...formData, numero_empleado: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-300">Usuario (Login)</label>
            <input required className="w-full border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" value={formData.nombre_usuario || ''} onChange={e => setFormData({...formData, nombre_usuario: e.target.value})} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Correo</label>
          <input required type="email" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" value={formData.correo || ''} onChange={e => setFormData({...formData, correo: e.target.value})} />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contraseña</label>
          <input 
            type="password" 
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" 
            placeholder={isEditing ? "Dejar en blanco para no cambiar" : "Contraseña inicial"}
            value={formData.password || ''} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required={!isEditing}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Departamento</label>
            <select required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" value={formData.departamento_id || ''} onChange={e => setFormData({...formData, departamento_id: Number(e.target.value)})}>
              <option value="">Seleccionar...</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Puesto</label>
            <select required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" value={formData.puesto_id || ''} onChange={e => setFormData({...formData, puesto_id: Number(e.target.value)})}>
              <option value="">Seleccionar...</option>
              {puestos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rol de Sistema</label>
            <select className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value as RolUsuario})}>
              <option value={RolUsuario.USUARIO}>{RolUsuario.USUARIO}</option>
              <option value={RolUsuario.TECNICO}>{RolUsuario.TECNICO}</option>
              <option value={RolUsuario.ADMIN}>{RolUsuario.ADMIN}</option>
            </select>
          </div>
          <div className="pt-6">
            <label className={`flex items-center gap-2 ${isEditing && formData.id === currentUser?.id ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              <input 
                type="checkbox" 
                className="w-4 h-4 text-blue-600 rounded dark:bg-slate-700 dark:border-slate-600" 
                checked={formData.activo !== false} 
                onChange={e => setFormData({...formData, activo: e.target.checked})} 
                disabled={isEditing && formData.id === currentUser?.id}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Usuario Activo</span>
            </label>
            {isEditing && formData.id === currentUser?.id && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">No puedes desactivar tu propio usuario.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancelar</button>
          <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Save className="w-4 h-4" /> Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
};
