
import React, { useState, useEffect } from 'react';
import { api } from '../../services/mockApi';
import { Departamento, Puesto, Ciudad } from '../../types';
import { Building2, Briefcase, MapPin } from 'lucide-react';
import EntityManager from '../EntityManager';

type TabType = 'DEPTS' | 'JOBS' | 'CITIES';

const OrganizationManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('DEPTS');
  const [departments, setDepartments] = useState<Departamento[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [deptData, puestosData, ciudadesData] = await Promise.all([
      api.getDepartamentos(),
      api.getPuestos(),
      api.getCiudades()
    ]);
    setDepartments(deptData);
    setPuestos(puestosData);
    setCiudades(ciudadesData);
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
        <button
          onClick={() => setActiveTab('CITIES')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'CITIES' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Ciudades
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
                withWarehouseOption={true}
                cities={ciudades}
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
            {activeTab === 'CITIES' && (
              <EntityManager 
                title="Ciudad"
                items={ciudades}
                onCreate={api.createCiudad}
                onUpdate={api.updateCiudad}
                onDelete={api.deleteCiudad}
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
