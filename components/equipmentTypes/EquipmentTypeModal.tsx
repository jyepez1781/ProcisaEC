
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Save } from 'lucide-react';
import { TipoEquipo } from '../../types';

interface EquipmentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: TipoEquipo | null;
  onSubmit: (data: { nombre: string; descripcion: string }) => Promise<boolean>;
}

export const EquipmentTypeModal: React.FC<EquipmentTypeModalProps> = ({ isOpen, onClose, editingItem, onSubmit }) => {
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

  useEffect(() => {
    if (editingItem) {
      setFormData({ nombre: editingItem.nombre, descripcion: editingItem.descripcion });
    } else {
      setFormData({ nombre: '', descripcion: '' });
    }
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
        onClose();
        setFormData({ nombre: '', descripcion: '' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingItem ? 'Editar Tipo' : 'Nuevo Tipo'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
          <input 
            type="text" 
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.nombre}
            onChange={e => setFormData({...formData, nombre: e.target.value})}
            placeholder="Ej. Laptop, Proyector"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea 
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows={3}
            value={formData.descripcion}
            onChange={e => setFormData({...formData, descripcion: e.target.value})}
          />
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">
            Cancelar
          </button>
          <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            <Save className="w-4 h-4" /> Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
};
