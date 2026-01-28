
import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { Usuario, Equipo } from '../../types';
import { History, CalendarRange, Wrench, ShieldAlert, Key, Trash2, Box } from 'lucide-react';
import { AssignmentsTab } from './AssignmentsTab';
import { HistoryTab } from './HistoryTab';
import { MaintenanceReportTab } from './MaintenanceReportTab';
import { WarrantiesTab } from './WarrantiesTab';
import { LicenseReportTab } from './LicenseReportTab';
import { DisposalReportTab } from './DisposalReportTab';
import { StockReportTab } from './StockReportTab';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('STOCK');
  
  // Data for Assignments Tab (shared logic)
  const [users, setUsers] = useState<Usuario[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);

  useEffect(() => {
    // Preload basic data used in filters
    Promise.all([reportService.getUsers(), reportService.getEquipos()]).then(([u, e]) => {
        setUsers(u);
        setEquipos(e);
    });
  }, []);

  const TabButton = ({ id, icon: Icon, label }: any) => (
    <button onClick={() => setActiveTab(id)} 
      className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === id ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Centro de Reportes</h2>
      
      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto bg-white dark:bg-slate-800 rounded-t-lg shadow-sm">
        <TabButton id="STOCK" icon={Box} label="Stock de Inventario" />
        <TabButton id="LICENSES" icon={Key} label="Licencias Asignadas" />
        <TabButton id="ASSIGNMENTS" icon={CalendarRange} label="Asignaciones" />
        <TabButton id="HISTORY" icon={History} label="Bitácora de Movimientos" />
        <TabButton id="MAINTENANCE" icon={Wrench} label="Historial Mantenimiento" />
        <TabButton id="WARRANTY" icon={ShieldAlert} label="Garantías" />
        <TabButton id="DISPOSAL" icon={Trash2} label="Bajas de Equipos" />
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-b-lg shadow-sm border border-t-0 border-slate-200 dark:border-slate-700 min-h-[500px]">
        {activeTab === 'STOCK' && <StockReportTab />}
        {activeTab === 'LICENSES' && <LicenseReportTab />}
        {activeTab === 'ASSIGNMENTS' && <AssignmentsTab usuarios={users} equipos={equipos} />}
        {activeTab === 'HISTORY' && <HistoryTab />}
        {activeTab === 'MAINTENANCE' && <MaintenanceReportTab />}
        {activeTab === 'WARRANTY' && <WarrantiesTab />}
        {activeTab === 'DISPOSAL' && <DisposalReportTab />}
      </div>
    </div>
  );
};

export default Reports;
