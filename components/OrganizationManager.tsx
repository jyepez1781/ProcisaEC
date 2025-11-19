import React, { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { Departamento, Puesto } from '../types';
import { Building2, Briefcase } from 'lucide-react';
import EntityManager from './EntityManager';

type TabType = 'DEPTS' | 'JOBS';

const OrganizationManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('DEPTS');
  const [departments, setDepartments] = useState<Departamento[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [deptData, puestosData] = await Promise.all([
      api.getDepartamentos(),
      api.getPuestos()
    ]);
    setDepartments(deptData);
    setPuestos(puestosData);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Organización</h2>
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('DEPTS')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'DEPTS' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Departamentos
        </button>
        <button
          onClick={() => setActiveTab('JOBS')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'JOBS' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Puestos / Cargos
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Cargando datos...</div>
        ) : (
          <>
            {activeTab === 'DEPTS' && (
              <EntityManager 
                title="Departamento"
                items={departments}
                onCreate={api.createDepartamento}
                onUpdate={api.updateDepartamento}
                onDelete={api.deleteDepartamento}
                onRefresh={loadData}
              />
            )}
            {activeTab === 'JOBS' && (
              <EntityManager 
                title="Puesto"
                items={puestos}
                onCreate={api.createPuesto}
                onUpdate={api.updatePuesto}
                onDelete={api.deletePuesto}
                onRefresh={loadData}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizationManager;