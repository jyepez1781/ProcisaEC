
import React from 'react';
import { Plus } from 'lucide-react';
import { useEntityManager, EntityBase } from '../hooks/useEntityManager';
import { EntityTable } from './organizationManager/EntityTable';
import { EntityModal } from './organizationManager/EntityModal';

interface EntityManagerProps {
  title: string;
  items: EntityBase[];
  onCreate: (data: any) => Promise<any>;
  onUpdate: (id: number, data: any) => Promise<any>;
  onDelete: (id: number) => Promise<void>;
  onRefresh: () => void;
  withWarehouseOption?: boolean;
}

const EntityManager: React.FC<EntityManagerProps> = (props) => {
  const { title, items, withWarehouseOption } = props;
  
  const { 
    isModalOpen, 
    editingItem, 
    openCreateModal, 
    openEditModal, 
    closeModal, 
    handleSave, 
    handleDelete 
  } = useEntityManager(props);

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-600">Administra los {title.toLowerCase()}s disponibles en el sistema.</p>
        <button 
          onClick={openCreateModal} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo {title}
        </button>
      </div>

      <EntityTable 
        items={items} 
        withWarehouseOption={withWarehouseOption} 
        onEdit={openEditModal} 
        onDelete={handleDelete} 
      />

      <EntityModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={title}
        editingItem={editingItem} 
        withWarehouseOption={withWarehouseOption}
        onSubmit={handleSave} 
      />
    </div>
  );
};

export default EntityManager;
