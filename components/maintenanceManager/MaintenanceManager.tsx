
import React from 'react';
import { useMaintenanceManager } from '../../hooks/useMaintenanceManager';
import { MaintenanceHeader } from './MaintenanceHeader';
import { MaintenanceTable } from './MaintenanceTable';
import { FinalizeMaintenanceModal } from './FinalizeMaintenanceModal';

const MaintenanceManager: React.FC = () => {
  const { 
    equipos, 
    bodegas, 
    loading, 
    selectedEquipo, 
    formData,
    reportFile,
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
        reportFile={reportFile}
        onFormChange={actions.updateForm}
        onFileChange={actions.setFile}
        onSubmit={actions.submitMaintenance}
      />
    </div>
  );
};

export default MaintenanceManager;
