
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Save } from 'lucide-react';
import { TipoEquipo } from '../../types';

interface EquipmentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: TipoEquipo | null;
  onSubmit: (data: { nombre: string; descripcion: string; frecuencia_anual: number }) => Promise<boolean>;
}

export const EquipmentTypeModal: React.FC<EquipmentTypeModalProps> = ({ isOpen, onClose, editingItem, onSubmit }) => {
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', frecuencia_anual: 1 });

  useEffect(() => {
    if (editingItem) {
      setFormData({ 
        nombre: editingItem.nombre, 
        descripcion: editingItem.descripcion,
        frecuencia_anual: editingItem.frecuencia_anual ?? 1 
      });
    } else {
      setFormData({ nombre: '', descripcion: '', frecuencia_anual: 1 });
    }
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
        onClose();
        setFormData({ nombre: '', descripcion: '', frecuencia_anual: 1 });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingItem ? 'Editar Tipo' : 'Nuevo Tipo'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
          <input 
            type="text" 
            required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
            value={formData.nombre}
            onChange={e => setFormData({...formData, nombre: e.target.value})}
            placeholder="Ej. Laptop, Proyector"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
          <textarea 
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
            rows={3}
            value={formData.descripcion}
            onChange={e => setFormData({...formData, descripcion: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mantenimientos por Año</label>
          <input 
            type="number" 
            min="0"
            max="12"
            required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
            value={formData.frecuencia_anual}
            onChange={e => setFormData({...formData, frecuencia_anual: Number(e.target.value)})}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            0 = Excluido del plan anual. 1 = Anual. 2 = Semestral. 4 = Trimestral. 12 = Mensual.
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">
            Cancelar
          </button>
          <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Save className="w-4 h-4" /> Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
};
