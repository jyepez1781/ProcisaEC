
import React, { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { Usuario, Equipo } from '../types';
import { RefreshCw, History, CalendarRange, Wrench, Key } from 'lucide-react';
import { AssignmentsTab } from './reports/AssignmentsTab';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ASSIGNMENTS');
  const [users, setUsers] = useState<Usuario[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);

  useEffect(() => {
    Promise.all([api.getUsuarios(), api.getEquipos()]).then(([u, e]) => {
        setUsers(u);
        setEquipos(e);
    });
  }, []);

  const TabButton = ({ id, icon: Icon, label }: any) => (
    <button onClick={() => setActiveTab(id)} 
      className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Reportes</h2>
      <div className="flex border-b overflow-x-auto bg-white rounded-t-lg shadow-sm">
        <TabButton id="ASSIGNMENTS" icon={CalendarRange} label="Asignaciones" />
        <TabButton id="HISTORY" icon={History} label="Historial" />
        {/* Add other tabs here */}
      </div>

      <div className="bg-white p-6 rounded-b-lg shadow-sm border border-t-0">
        {activeTab === 'ASSIGNMENTS' && <AssignmentsTab usuarios={users} equipos={equipos} />}
        {activeTab === 'HISTORY' && <div className="text-center py-10 text-slate-400">Componente Historial pendiente de refactor...</div>}
      </div>
    </div>
  );
};

export default Reports;
