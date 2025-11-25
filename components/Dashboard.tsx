
import React from 'react';
import { AlertTriangle, Box, CheckCircle, Wrench, Laptop } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { GroupedStatCard } from './dashboard/GroupedStatCard';
import { LicenseCard } from './dashboard/LicenseCard';
import { StatusPieChart } from './dashboard/StatusPieChart';
import { WarrantyChart } from './dashboard/WarrantyChart';
import { EquipmentStackChart } from './dashboard/EquipmentStackChart';

const Dashboard: React.FC = () => {
  const { 
    loading, 
    groupedStats, 
    warrantyData, 
    licenseStats, 
    equipmentBreakdown 
  } = useDashboardData();

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando Dashboard...</div>;
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
      <h2 className="text-2xl font-bold text-slate-800">Dashboard General</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        <GroupedStatCard
            title="Total Equipos"
            icon={<Box className="w-5 h-5 text-blue-600" />}
            dataMap={groupedStats.total}
            total={groupedStats.grandTotals.total}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
        />

        <GroupedStatCard
            title="Asignados"
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            dataMap={groupedStats.assigned}
            total={groupedStats.grandTotals.assigned}
            bgColor="bg-green-50"
            textColor="text-green-700"
        />

        <GroupedStatCard
            title="Disponibles"
            icon={<Laptop className="w-5 h-5 text-indigo-600" />}
            dataMap={groupedStats.available}
            total={groupedStats.grandTotals.available}
            bgColor="bg-indigo-50"
            textColor="text-indigo-700"
        />

        <GroupedStatCard
            title="Mantenimiento"
            icon={<Wrench className="w-5 h-5 text-amber-600" />}
            dataMap={groupedStats.maintenance}
            total={groupedStats.grandTotals.maintenance}
            bgColor="bg-amber-50"
            textColor="text-amber-700"
        />

        <GroupedStatCard
            title="Garantías (Riesgo)"
            icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
            dataMap={groupedStats.warranty}
            total={groupedStats.grandTotals.warranty}
            bgColor="bg-red-50"
            textColor="text-red-700"
        />
         
        <LicenseCard stats={licenseStats} />
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
