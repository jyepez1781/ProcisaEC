import React, { useState } from 'react';
import { Plus, Trash2, Edit, X, Save } from 'lucide-react';

interface Entity {
  id: number;
  nombre: string;
}

interface EntityManagerProps {
  title: string;
  items: Entity[];
  onCreate: (nombre: string) => Promise<any>;
  onUpdate: (id: number, nombre: string) => Promise<any>;
  onDelete: (id: number) => Promise<void>;
  onRefresh: () => void;
}

const EntityManager: React.FC<EntityManagerProps> = ({ title, items, onCreate, onUpdate, onDelete, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Entity | null>(null);
  const [nameInput, setNameInput] = useState('');

  const handleOpenCreate = () => {
    setEditingItem(null);
    setNameInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Entity) => {
    setEditingItem(item);
    setNameInput(item.nombre);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    if (editingItem) {
      await onUpdate(editingItem.id, nameInput);
    } else {
      await onCreate(nameInput);
    }
    setIsModalOpen(false);
    onRefresh();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(`¿Estás seguro de eliminar este ${title.toLowerCase()}?`)) {
      await onDelete(id);
      onRefresh();
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
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 w-20">#{item.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenEdit(item)} className="text-blue-600 hover:text-blue-800 mr-3 p-1">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-sm">No hay registros creados.</td>
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
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder={`Ej. ${title === 'Departamento' ? 'Marketing' : 'Analista Sr.'}`}
                />
              </div>
              
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