
import React, { useState } from 'react';
import { PlanningConfig } from './PlanningConfig';
import { PlanningCalendar } from './PlanningCalendar';
import { PlanMantenimiento, DetallePlan } from '../../types';
import { maintenancePlanningService } from '../../services/maintenancePlanningService';
import { api } from '../../services/mockApi';
import Swal from 'sweetalert2';

const MaintenancePlanning: React.FC = () => {
  const [view, setView] = useState<'CONFIG' | 'CALENDAR'>('CONFIG');
  const [currentPlan, setCurrentPlan] = useState<PlanMantenimiento | null>(null);
  const [planDetails, setPlanDetails] = useState<DetallePlan[]>([]);
  const [isNewPlan, setIsNewPlan] = useState(false);

  const handleGeneratePlan = async (year: number, cityId: number, cityName: string) => {
    try {
        // 1. Fetch data
        const [allEquipos, departamentos] = await Promise.all([
          api.getEquipos(),
          api.getDepartamentos()
        ]);
        
        // 2. Filter Equipment by City
        // First, find which departments belong to the selected city
        const cityDeptIds = departamentos
            .filter(d => d.ciudad_id === cityId)
            .map(d => d.id);

        if (cityDeptIds.length === 0) {
            Swal.fire('Atención', `No hay departamentos registrados en ${cityName}.`, 'warning');
            return;
        }

        // Then filter equipment that are located in those departments
        const filteredEquipos = allEquipos.filter(e => {
            const isActive = e.estado !== 'Baja' && e.estado !== 'Para Baja';
            const isInCity = cityDeptIds.includes(e.ubicacion_id);
            return isActive && isInCity;
        });

        if (filteredEquipos.length === 0) {
            Swal.fire('Sin Equipos', `No se encontraron equipos activos en ${cityName} para generar un plan.`, 'info');
            return;
        }

        // 3. Generate Plan
        const generated = await maintenancePlanningService.generatePlan(year, filteredEquipos, cityId, cityName);
        
        setCurrentPlan(generated.header);
        setPlanDetails(generated.details);
        setIsNewPlan(true);
        setView('CALENDAR');
    } catch (e: any) {
        Swal.fire('Error', e.message, 'error');
    }
  };

  const handleViewPlan = async (planId: number) => {
      try {
          const { plan, details } = await maintenancePlanningService.getPlanDetails(planId);
          setCurrentPlan(plan);
          setPlanDetails(details);
          setIsNewPlan(false);
          setView('CALENDAR');
      } catch (e: any) {
          Swal.fire('Error', 'No se pudo cargar el plan', 'error');
      }
  };

  const handleSavePlan = async (details: DetallePlan[]) => {
      if (!currentPlan) return;

      const result = await Swal.fire({
          title: '¿Guardar Plan?',
          text: `Se registrará el plan "${currentPlan.nombre}" con ${details.length} tareas programadas.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#2563eb',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Sí, guardar plan',
          cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
          try {
              await maintenancePlanningService.savePlan(currentPlan, details);
              Swal.fire('Éxito', 'Plan guardado correctamente', 'success');
              setView('CONFIG'); // Go back to list
          } catch (e: any) {
              Swal.fire('Error', 'Error al guardar el plan', 'error');
          }
      }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
       {view === 'CONFIG' && (
           <div className="flex-1 overflow-auto">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Planificación de Mantenimiento</h2>
                <PlanningConfig 
                    onGenerate={handleGeneratePlan}
                    onViewPlan={handleViewPlan}
                />
           </div>
       )}

       {view === 'CALENDAR' && currentPlan && (
           <PlanningCalendar 
              plan={currentPlan}
              initialDetails={planDetails}
              isNew={isNewPlan}
              onSave={handleSavePlan}
              onBack={() => setView('CONFIG')}
           />
       )}
    </div>
  );
};

export default MaintenancePlanning;
