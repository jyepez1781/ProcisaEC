
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useEquipmentTypes } from '../../hooks/useEquipmentTypes';
import { EquipmentTypesTable } from './EquipmentTypesTable';
import { EquipmentTypeModal } from './EquipmentTypeModal';
import { TipoEquipo } from '../../types';

const EquipmentTypes: React.FC = () => {
  const { tipos, loading, actions } = useEquipmentTypes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TipoEquipo | null>(null);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tipo: TipoEquipo) => {
    setEditingItem(tipo);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: { nombre: string; descripcion: string }) => {
    if (editingItem) {
      return await actions.updateType(editingItem.id, data);
    } else {
      return await actions.createType(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Tipos de Equipo</h2>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Tipo
        </button>
      </div>

      <EquipmentTypesTable 
        tipos={tipos} 
        loading={loading} 
        onEdit={handleOpenEdit} 
        onDelete={actions.deleteType} 
      />

      <EquipmentTypeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editingItem={editingItem} 
        onSubmit={handleFormSubmit} 
      />
    </div>
  );
};

export default EquipmentTypes;
