
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useEquipment, ModalAction } from '../hooks/useEquipment';
import { EquipmentFilters } from './equipmentList/EquipmentFilters';
import { EquipmentTable } from './equipmentList/EquipmentTable';
import { EquipmentForm } from './equipmentList/EquipmentForm';
import { Modal } from './common/Modal';
import { Equipo } from '../types';

const EquipmentPage: React.FC = () => {
  const { 
    groupedEquipos, 
    tipos, usuarios, bodegas,
    filters, setFilters, 
    grouping, setGrouping, 
    handleAction 
  } = useEquipment();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);

  const openModal = (action: ModalAction, equipo: Equipo | null = null) => {
    setModalAction(action);
    setSelectedEquipo(equipo);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAction(null);
    setSelectedEquipo(null);
  };

  const onFormSubmit = async (data: any) => {
    const success = await handleAction(modalAction, selectedEquipo, data);
    if (success) closeModal();
    return success;
  };

  const getModalTitle = () => {
    switch (modalAction) {
      case 'CREATE': return 'Nuevo Equipo';
      case 'EDIT': return 'Editar Equipo';
      case 'ASSIGN': return 'Asignar Equipo';
      case 'RETURN': return 'Recepcionar Equipo';
      case 'BAJA': return 'Dar de Baja';
      case 'TO_MAINTENANCE': return 'Enviar a Mantenimiento';
      case 'MARK_DISPOSAL': return 'Enviar a Pre-Baja';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Inventario de Equipos</h2>
        <button 
          onClick={() => openModal('CREATE')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Equipo
        </button>
      </div>

      <EquipmentFilters 
        filters={filters} setFilters={setFilters}
        grouping={grouping} setGrouping={setGrouping}
        tipos={tipos} usuarios={usuarios}
      />

      <EquipmentTable 
        groupedEquipos={groupedEquipos} 
        grouping={grouping} 
        onAction={openModal} 
      />

      <Modal isOpen={modalOpen} onClose={closeModal} title={getModalTitle()}>
        <EquipmentForm 
          action={modalAction} 
          equipo={selectedEquipo} 
          tipos={tipos} 
          usuarios={usuarios} 
          bodegas={bodegas}
          onSubmit={onFormSubmit} 
          onCancel={closeModal} 
        />
      </Modal>
    </div>
  );
};

export default EquipmentPage;
