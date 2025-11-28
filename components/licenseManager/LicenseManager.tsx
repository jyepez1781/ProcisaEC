
import React, { useState } from 'react';
import { Key, Shield, UserCheck } from 'lucide-react';
import { useLicenseManager } from '../../hooks/useLicenseManager';
import { LicenseCatalogTab } from './LicenseCatalogTab';
import { LicenseAssignmentsTab } from './LicenseAssignmentsTab';
import { CreateTypeModal, StockModal, AssignModal, UnassignModal } from './LicenseModals';
import { Licencia } from '../../types';

const LicenseManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'ASSIGNMENTS'>('CATALOG');
  const { data, actions } = useLicenseManager();
  const { tipos, licencias, usuarios, loading } = data;

  // Modal States
  const [isCreateTypeOpen, setIsCreateTypeOpen] = useState(false);
  const [stockModalData, setStockModalData] = useState<{ isOpen: boolean; tipoId: number }>({ isOpen: false, tipoId: 0 });
  const [assignModalData, setAssignModalData] = useState<{ isOpen: boolean; license: Licencia | null }>({ isOpen: false, license: null });
  const [unassignModalData, setUnassignModalData] = useState<{ isOpen: boolean; license: Licencia | null }>({ isOpen: false, license: null });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Key className="w-6 h-6 text-purple-600" /> Gestión de Licencias
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'CATALOG' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Shield className="w-4 h-4" /> Catálogo & Stock
        </button>
        <button
          onClick={() => setActiveTab('ASSIGNMENTS')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'ASSIGNMENTS' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Asignaciones
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {loading ? <div className="text-center py-8 text-slate-500">Cargando datos...</div> : (
          <>
            {activeTab === 'CATALOG' && (
              <LicenseCatalogTab 
                tipos={tipos} 
                licencias={licencias}
                onOpenCreateType={() => setIsCreateTypeOpen(true)}
                onAddStock={(id) => setStockModalData({ isOpen: true, tipoId: id })}
              />
            )}
            {activeTab === 'ASSIGNMENTS' && (
              <LicenseAssignmentsTab 
                licencias={licencias} 
                tipos={tipos}
                usuarios={usuarios}
                onAssign={(l) => setAssignModalData({ isOpen: true, license: l })}
                onUnassign={(l) => setUnassignModalData({ isOpen: true, license: l })}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateTypeModal 
        isOpen={isCreateTypeOpen} 
        onClose={() => setIsCreateTypeOpen(false)} 
        onSubmit={actions.createType}
      />
      
      <StockModal 
        isOpen={stockModalData.isOpen} 
        onClose={() => setStockModalData({ isOpen: false, tipoId: 0 })}
        tipoId={stockModalData.tipoId}
        onSubmit={actions.addStock}
      />

      <AssignModal 
        isOpen={assignModalData.isOpen}
        onClose={() => setAssignModalData({ isOpen: false, license: null })}
        license={assignModalData.license}
        usuarios={usuarios}
        onAssign={actions.assignLicense}
      />

      <UnassignModal
        isOpen={unassignModalData.isOpen}
        onClose={() => setUnassignModalData({ isOpen: false, license: null })}
        license={unassignModalData.license}
        onConfirm={actions.unassignLicense}
      />
    </div>
  );
};

export default LicenseManager;
