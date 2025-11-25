
import { useState } from 'react';
import Swal from 'sweetalert2';

export interface EntityBase {
  id: number;
  nombre: string;
  es_bodega?: boolean;
}

interface UseEntityManagerProps {
  title: string;
  onCreate: (data: any) => Promise<any>;
  onUpdate: (id: number, data: any) => Promise<any>;
  onDelete: (id: number) => Promise<void>;
  onRefresh: () => void;
}

export const useEntityManager = ({ title, onCreate, onUpdate, onDelete, onRefresh }: UseEntityManagerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EntityBase | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: EntityBase) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        await onUpdate(editingItem.id, data);
      } else {
        await onCreate(data);
      }
      closeModal();
      onRefresh();
      return true;
    } catch (error: any) {
      // Re-throw to be handled by the form/UI if needed, usually Swal inside component
      throw error; 
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: `¿Eliminar ${title.toLowerCase()}?`,
      text: "No podrás revertir esta acción.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await onDelete(id);
        onRefresh();
        Swal.fire('Eliminado', 'El registro ha sido eliminado.', 'success');
      } catch (error: any) {
        Swal.fire({
          title: 'No se puede eliminar',
          text: error.message || "Error al eliminar el registro.",
          icon: 'error',
          confirmButtonColor: '#2563eb'
        });
      }
    }
  };

  return {
    isModalOpen,
    editingItem,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete
  };
};
