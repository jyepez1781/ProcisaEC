
import React from 'react';
import { useMaintenanceManager } from '../hooks/useMaintenanceManager';
import { MaintenanceHeader } from './maintenanceManager/MaintenanceHeader';
import { MaintenanceTable } from './maintenanceManager/MaintenanceTable';
import { FinalizeMaintenanceModal } from './maintenanceManager/FinalizeMaintenanceModal';

const MaintenanceManager: React.FC = () => {
  const { 
    equipos, 
    bodegas, 
    loading, 
    selectedEquipo, 
    formData, 
    actions 
  } = useMaintenanceManager();

  return (
    <div className="space-y-6">
      <MaintenanceHeader count={equipos.length} />

      <MaintenanceTable 
        equipos={equipos} 
        loading={loading} 
        onFinalize={actions.openModal} 
      />

      <FinalizeMaintenanceModal 
        isOpen={!!selectedEquipo} 
        onClose={actions.closeModal}
        equipo={selectedEquipo}
        bodegas={bodegas}
        formData={formData}
        onFormChange={actions.updateForm}
        onSubmit={actions.submitMaintenance}
      />
    </div>
  );
};

export default MaintenanceManager;
