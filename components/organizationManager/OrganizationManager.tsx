
import React, { useState, useEffect } from 'react';
import { api } from '../../services/mockApi';
import { Departamento, Puesto, Ciudad, Pais } from '../../types';
import { Building2, Briefcase, MapPin, Globe } from 'lucide-react';
import EntityManager from './EntityManager';

type TabType = 'COUNTRIES' | 'CITIES' | 'DEPTS' | 'JOBS';

const OrganizationManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('COUNTRIES');
  const [departments, setDepartments] = useState<Departamento[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [deptData, puestosData, ciudadesData, paisesData] = await Promise.all([
      api.getDepartamentos(),
      api.getPuestos(),
      api.getCiudades(),
      api.getPaises()
    ]);
    setDepartments(deptData);
    setPuestos(puestosData);
    setCiudades(ciudadesData);
    setPaises(paisesData);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Organización</h2>
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab('COUNTRIES')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'COUNTRIES' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          Países
        </button>
        <button
          onClick={() => setActiveTab('CITIES')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'CITIES' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Ciudades
        </button>
        <button
          onClick={() => setActiveTab('DEPTS')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'DEPTS' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Departamentos
        </button>
        <button
          onClick={() => setActiveTab('JOBS')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'JOBS' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Puestos / Cargos
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        {loading ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">Cargando datos...</div>
        ) : (
          <>
            {activeTab === 'COUNTRIES' && (
              <EntityManager 
                title="País"
                items={paises}
                onCreate={api.createPais}
                onUpdate={api.updatePais}
                onDelete={api.deletePais}
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
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizationManager;
