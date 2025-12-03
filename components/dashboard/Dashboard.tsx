
import React from 'react';
import { AlertTriangle, Box, CheckCircle, Wrench, Laptop } from 'lucide-react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { GroupedStatCard } from './GroupedStatCard';
import { LicenseCard } from './LicenseCard';
import { StatusPieChart } from './StatusPieChart';
import { WarrantyChart } from './WarrantyChart';
import { EquipmentStackChart } from './EquipmentStackChart';
import { MaintenanceDueList } from './MaintenanceDueList';

const Dashboard: React.FC = () => {
  const { 
    loading, 
    groupedStats, 
    warrantyData, 
    licenseStats, 
    equipmentBreakdown,
    pendingMaintenance
  } = useDashboardData();

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-slate-400">Cargando Dashboard...</div>;
  }

  // Data for Pie Chart
  const pieData = [
    { name: 'Activos', value: groupedStats.grandTotals.assigned },
    { name: 'Disponibles', value: groupedStats.grandTotals.available },
    { name: 'Mantenimiento', value: groupedStats.grandTotals.maintenance },
    { name: 'Para Baja', value: groupedStats.grandTotals.pre_baja },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard General</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        <GroupedStatCard
            title="Total Equipos"
            icon={<Box className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            dataMap={groupedStats.total}
            total={groupedStats.grandTotals.total}
            bgColor="bg-blue-50 dark:bg-blue-900/20"
            textColor="text-blue-700 dark:text-blue-300"
        />

        <GroupedStatCard
            title="Asignados"
            icon={<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
            dataMap={groupedStats.assigned}
            total={groupedStats.grandTotals.assigned}
            bgColor="bg-green-50 dark:bg-green-900/20"
            textColor="text-green-700 dark:text-green-300"
        />

        <GroupedStatCard
            title="Disponibles"
            icon={<Laptop className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            dataMap={groupedStats.available}
            total={groupedStats.grandTotals.available}
            bgColor="bg-indigo-50 dark:bg-indigo-900/20"
            textColor="text-indigo-700 dark:text-indigo-300"
        />

        <GroupedStatCard
            title="Mantenimiento"
            icon={<Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
            dataMap={groupedStats.maintenance}
            total={groupedStats.grandTotals.maintenance}
            bgColor="bg-amber-50 dark:bg-amber-900/20"
            textColor="text-amber-700 dark:text-amber-300"
        />

        <GroupedStatCard
            title="Garantías (Riesgo)"
            icon={<AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />}
            dataMap={groupedStats.warranty}
            total={groupedStats.grandTotals.warranty}
            bgColor="bg-red-50 dark:bg-red-900/20"
            textColor="text-red-700 dark:text-red-300"
        />
         
        <LicenseCard stats={licenseStats} />
      </div>

      {/* Maintenance List Row */}
      <div className="grid grid-cols-1 gap-6">
        <MaintenanceDueList tasks={pendingMaintenance} />
      </div>

      {/* Charts Section Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusPieChart data={pieData} />
        <WarrantyChart data={warrantyData} />
      </div>

      {/* Charts Section Row 2 */}
      <EquipmentStackChart breakdown={equipmentBreakdown} />
    </div>
  );
};

export default Dashboard;
