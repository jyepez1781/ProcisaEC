
import React, { useState } from 'react';
import { Plus, Trash2, Edit, X, Save, Warehouse } from 'lucide-react';

interface Entity {
  id: number;
  nombre: string;
  es_bodega?: boolean;
}

interface EntityManagerProps {
  title: string;
  items: Entity[];
  onCreate: (data: any) => Promise<any>;
  onUpdate: (id: number, data: any) => Promise<any>;
  onDelete: (id: number) => Promise<void>;
  onRefresh: () => void;
  withWarehouseOption?: boolean;
}

const EntityManager: React.FC<EntityManagerProps> = ({ title, items, onCreate, onUpdate, onDelete, onRefresh, withWarehouseOption = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Entity | null>(null);
  const [formData, setFormData] = useState({ nombre: '', es_bodega: false });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ nombre: '', es_bodega: false });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Entity) => {
    setEditingItem(item);
    setFormData({ nombre: item.nombre, es_bodega: !!item.es_bodega });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    const dataToSend = {
      nombre: formData.nombre,
      ...(withWarehouseOption ? { es_bodega: formData.es_bodega } : {})
    };

    if (editingItem) {
      await onUpdate(editingItem.id, dataToSend);
    } else {
      await onCreate(dataToSend);
    }
    setIsModalOpen(false);
    onRefresh();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(`¿Estás seguro de eliminar este ${title.toLowerCase()}?`)) {
      try {
        await onDelete(id);
        onRefresh();
      } catch (error: any) {
        alert(error.message || "Error al eliminar el registro.");
      }
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-600">Administra los {title.toLowerCase()}s disponibles en el sistema.</p>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
          <Plus className="w-4 h-4" /> Nuevo {title}
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombre</th>
              {withWarehouseOption && (
                 <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Tipo</th>
              )}
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 w-20">#{item.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.nombre}</td>
                {withWarehouseOption && (
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {item.es_bodega ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Warehouse className="w-3 h-3" /> Bodega IT
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        Administrativo
                      </span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenEdit(item)} className="text-blue-600 hover:text-blue-800 mr-3 p-1">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(item.id); }} 
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={withWarehouseOption ? 4 : 3} className="px-6 py-8 text-center text-slate-500 text-sm">No hay registros creados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-slate-800">
                {editingItem ? `Editar ${title}` : `Nuevo ${title}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del {title}</label>
                <input 
                  required 
                  autoFocus
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  placeholder={`Ej. ${title === 'Departamento' ? 'Marketing' : 'Analista Sr.'}`}
                />
              </div>

              {withWarehouseOption && (
                 <div className="pt-2">
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        checked={formData.es_bodega}
                        onChange={e => setFormData({...formData, es_bodega: e.target.checked})}
                      />
                      <div className="flex-1">
                         <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                           <Warehouse className="w-4 h-4 text-slate-500" />
                           Funciona como Bodega de Sistemas
                         </div>
                         <p className="text-xs text-slate-500 mt-0.5">Habilitar para áreas donde se almacenan equipos de IT.</p>
                      </div>
                    </label>
                 </div>
              )}
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">
                  Cancelar
                </button>
                <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
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

export default EntityManager;
