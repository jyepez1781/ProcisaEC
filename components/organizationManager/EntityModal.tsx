
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Save, Warehouse } from 'lucide-react';
import { EntityBase } from '../../hooks/useEntityManager';
import Swal from 'sweetalert2';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string; // "Departamento" or "Puesto"
  editingItem: EntityBase | null;
  withWarehouseOption?: boolean;
  onSubmit: (data: any) => Promise<boolean>;
}

export const EntityModal: React.FC<EntityModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  editingItem, 
  withWarehouseOption = false, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({ nombre: '', es_bodega: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({ nombre: editingItem.nombre, es_bodega: !!editingItem.es_bodega });
      } else {
        setFormData({ nombre: '', es_bodega: false });
      }
    }
  }, [isOpen, editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    const dataToSend = {
      nombre: formData.nombre,
      ...(withWarehouseOption ? { es_bodega: formData.es_bodega } : {})
    };

    setLoading(true);
    try {
      await onSubmit(dataToSend);
      // Modal closes via parent if successful
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error', error.message || 'Error al guardar', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingItem ? `Editar ${title}` : `Nuevo ${title}`}>
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
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
